import { store } from '../src/store/sqlite.store';
import { documentService } from '../src/services/document.service';
import { ComplianceDocument } from '../src/types';

const mockDoc: ComplianceDocument = {
  id: 'doc-001',
  userId: 'user-001',
  originalName: 'safety-procedures.pdf',
  filename: 'uuid-safety.pdf',
  fileSize: 204800,
  uploadedAt: new Date('2025-01-15'),
  text: 'All workers must wear hard hats and high-visibility vests at all times.',
  chunks: [{ index: 0, text: 'All workers must wear hard hats.', startChar: 0, endChar: 32 }],
  status: 'ready',
  summary: 'A site safety procedure document.',
  keyPoints: ['Hard hats required', 'Hi-vis vests required'],
};

beforeEach(() => {
  (store as unknown as { _reset: () => void })._reset();
  store.saveDocument(mockDoc);
});

describe('documentService.getById', () => {
  it('returns a document when id and userId match', () => {
    const result = documentService.getById('doc-001', 'user-001');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('doc-001');
  });

  it('returns null for a mismatched userId', () => {
    expect(documentService.getById('doc-001', 'wrong-user')).toBeNull();
  });

  it('returns null for a non-existent document id', () => {
    expect(documentService.getById('missing', 'user-001')).toBeNull();
  });
});

describe('documentService.getByUser', () => {
  it('returns only documents belonging to the given user', () => {
    const results = documentService.getByUser('user-001');
    expect(results.every((d: ComplianceDocument) => d.userId === 'user-001')).toBe(true);
  });

  it('returns empty array for a user with no documents', () => {
    expect(documentService.getByUser('user-nobody')).toHaveLength(0);
  });
});

describe('documentService.toSummaryView', () => {
  it('removes the text and chunks fields', () => {
    const view = documentService.toSummaryView(mockDoc) as Record<string, unknown>;
    expect(view.text).toBeUndefined();
    expect(view.chunks).toBeUndefined();
  });

  it('preserves all metadata fields', () => {
    const view = documentService.toSummaryView(mockDoc) as Record<string, unknown>;
    expect(view.id).toBe('doc-001');
    expect(view.originalName).toBe('safety-procedures.pdf');
    expect(view.status).toBe('ready');
    expect(view.summary).toBe('A site safety procedure document.');
  });
});
