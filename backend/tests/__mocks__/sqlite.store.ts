import { ComplianceDocument, User, AuthSession } from '../../src/types';

export class SQLiteStore {}

const documents = new Map<string, ComplianceDocument>();
const users = new Map<string, User>();
const sessions = new Map<string, AuthSession>();

export const store = {
  addUser: jest.fn((user: User) => { users.set(user.id, user); }),
  getUserById: jest.fn((id: string) => users.get(id)),
  getUserByUsername: jest.fn((username: string) =>
    [...users.values()].find(u => u.username === username)
  ),
  createSession: jest.fn((session: AuthSession) => { sessions.set(session.token, session); }),
  getSession: jest.fn((token: string) => sessions.get(token)),
  deleteSession: jest.fn((token: string) => { sessions.delete(token); }),
  saveDocument: jest.fn((doc: ComplianceDocument) => { documents.set(doc.id, doc); }),
  getDocument: jest.fn((id: string) => documents.get(id)),
  getDocumentsByUser: jest.fn((userId: string) =>
    [...documents.values()].filter(d => d.userId === userId)
  ),
  updateDocument: jest.fn((id: string, updates: Partial<ComplianceDocument>) => {
    const doc = documents.get(id);
    if (!doc) return null;
    const updated = { ...doc, ...updates };
    documents.set(id, updated);
    return updated;
  }),
  deleteDocument: jest.fn((id: string) => documents.delete(id)),

  // Test helper — clears all data between tests
  _reset() {
    documents.clear();
    users.clear();
    sessions.clear();
    jest.clearAllMocks();
  },
};
