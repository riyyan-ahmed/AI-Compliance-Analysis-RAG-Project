import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { SQLiteStore } from '../store/sqlite.store';
import { ComplianceDocument } from '../types';
import { parserService } from './parser.service';
import { ragService } from './rag.service';
import { store } from '../store/sqlite.store';

class DocumentService {
  constructor(private readonly store: SQLiteStore) {}

  async create(userId: string, file: Express.Multer.File): Promise<ComplianceDocument> {
    const text = await parserService.extractText(file.path);
    const chunks = ragService.chunk(text);

    const doc: ComplianceDocument = {
      id: uuidv4(),
      userId,
      originalName: file.originalname,
      filename: file.filename,
      fileSize: file.size,
      uploadedAt: new Date(),
      text,
      chunks,
      status: 'uploaded',
    };

    this.store.saveDocument(doc);
    return doc;
  }

  getByUser(userId: string): ComplianceDocument[] {
    return this.store.getDocumentsByUser(userId);
  }

  getById(id: string, userId: string): ComplianceDocument | null {
    const doc = this.store.getDocument(id);
    if (!doc || doc.userId !== userId) return null;
    return doc;
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const doc = this.store.getDocument(id);
    if (!doc || doc.userId !== userId) return false;

    const filePath = path.join(process.env.UPLOAD_DIR ?? './uploads', doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const { chromaService } = await import('./chroma.service');
    await chromaService.deleteChunks(id).catch(console.error);
    return this.store.deleteDocument(id);
  }

  toSummaryView(doc: ComplianceDocument) {
    const { text: _t, chunks: _c, ...rest } = doc;
    return rest;
  }
}

export const documentService = new DocumentService(store);
