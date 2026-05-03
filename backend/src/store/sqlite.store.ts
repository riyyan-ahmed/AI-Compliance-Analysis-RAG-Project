import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { User, AuthSession, ComplianceDocument } from '../types';

interface DocumentRow {
  id: string;
  user_id: string;
  original_name: string;
  filename: string;
  file_size: number;
  uploaded_at: string;
  status: string;
  full_text: string | null;
  summary: string | null;
  key_points: string | null;
  error_message: string | null;
}

function rowToDoc(row: DocumentRow): ComplianceDocument {
  return {
    id: row.id,
    userId: row.user_id,
    originalName: row.original_name,
    filename: row.filename,
    fileSize: row.file_size,
    uploadedAt: new Date(row.uploaded_at),
    status: row.status as ComplianceDocument['status'],
    text: row.full_text ?? '',
    chunks: [],
    summary: row.summary ?? undefined,
    keyPoints: row.key_points ? (JSON.parse(row.key_points) as string[]) : undefined,
    errorMessage: row.error_message ?? undefined,
  };
}

export class SQLiteStore {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const resolvedPath = dbPath ?? path.join(process.cwd(), 'data', 'compliance.db');

    if (resolvedPath !== ':memory:') {
      const dir = path.dirname(resolvedPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(resolvedPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id         TEXT PRIMARY KEY,
        username   TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token      TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL,
        username   TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS documents (
        id            TEXT PRIMARY KEY,
        user_id       TEXT NOT NULL,
        original_name TEXT NOT NULL,
        filename      TEXT NOT NULL,
        file_size     INTEGER NOT NULL,
        uploaded_at   TEXT NOT NULL,
        status        TEXT NOT NULL DEFAULT 'uploaded',
        full_text     TEXT,
        summary       TEXT,
        key_points    TEXT,
        error_message TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS gap_analyses (
        pair_key   TEXT PRIMARY KEY,
        result     TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }

  addUser(user: User): void {
    this.db
      .prepare('INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)')
      .run(user.id, user.username);
  }

  getUserById(id: string): User | undefined {
    return this.db
      .prepare('SELECT id, username FROM users WHERE id = ?')
      .get(id) as User | undefined;
  }

  getUserByUsername(username: string): User | undefined {
    return this.db
      .prepare('SELECT id, username FROM users WHERE username = ?')
      .get(username) as User | undefined;
  }

  createSession(session: AuthSession): void {
    this.db
      .prepare('INSERT INTO sessions (token, user_id, username) VALUES (?, ?, ?)')
      .run(session.token, session.userId, session.username);
  }

  getSession(token: string): AuthSession | undefined {
    const row = this.db
      .prepare('SELECT token, user_id, username, created_at FROM sessions WHERE token = ?')
      .get(token) as { token: string; user_id: string; username: string; created_at: string } | undefined;

    if (!row) return undefined;
    return { token: row.token, userId: row.user_id, username: row.username, createdAt: new Date(row.created_at) };
  }

  deleteSession(token: string): void {
    this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  saveDocument(doc: ComplianceDocument): void {
    this.db
      .prepare(
        `INSERT INTO documents
           (id, user_id, original_name, filename, file_size, uploaded_at, status, full_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(doc.id, doc.userId, doc.originalName, doc.filename, doc.fileSize, doc.uploadedAt.toISOString(), doc.status, doc.text);
  }

  getDocument(id: string): ComplianceDocument | undefined {
    const row = this.db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as DocumentRow | undefined;
    return row ? rowToDoc(row) : undefined;
  }

  getDocumentsByUser(userId: string): ComplianceDocument[] {
    const rows = this.db
      .prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC')
      .all(userId) as DocumentRow[];
    return rows.map(rowToDoc);
  }

  updateDocument(id: string, updates: Partial<ComplianceDocument>): ComplianceDocument | null {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.summary !== undefined) { fields.push('summary = ?'); values.push(updates.summary); }
    if (updates.keyPoints !== undefined) { fields.push('key_points = ?'); values.push(JSON.stringify(updates.keyPoints)); }
    if (updates.errorMessage !== undefined) { fields.push('error_message = ?'); values.push(updates.errorMessage ?? null); }
    if (updates.text !== undefined) { fields.push('full_text = ?'); values.push(updates.text); }

    if (fields.length === 0) return this.getDocument(id) ?? null;

    values.push(id);
    this.db
      .prepare(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`)
      .run(...(values as Parameters<Database.Statement['run']>));

    return this.getDocument(id) ?? null;
  }

  deleteDocument(id: string): boolean {
    const deleted = this.db.prepare('DELETE FROM documents WHERE id = ?').run(id).changes > 0;
    if (deleted) {
      this.db.prepare(`DELETE FROM gap_analyses WHERE pair_key LIKE '%' || ? || '%'`).run(id);
    }
    return deleted;
  }

  private gapKey(idA: string, idB: string): string {
    return [idA, idB].sort().join('::');
  }

  getGapAnalysis(idA: string, idB: string): unknown | null {
    const row = this.db
      .prepare('SELECT result FROM gap_analyses WHERE pair_key = ?')
      .get(this.gapKey(idA, idB)) as { result: string } | undefined;
    return row ? JSON.parse(row.result) : null;
  }

  saveGapAnalysis(idA: string, idB: string, result: unknown): void {
    this.db
      .prepare('INSERT OR REPLACE INTO gap_analyses (pair_key, result) VALUES (?, ?)')
      .run(this.gapKey(idA, idB), JSON.stringify(result));
  }
}

export const store = new SQLiteStore(process.env.DB_PATH);
