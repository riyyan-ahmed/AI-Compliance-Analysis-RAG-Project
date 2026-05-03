import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { documentService } from '../services/document.service';
import { analysisService } from '../services/analysis.service';
import { store } from '../store/sqlite.store';

export async function uploadDocument(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthenticatedRequest;

  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  try {
    const doc = await documentService.create(userId, req.file);
    analysisService.analyzeDocument(doc.id).catch(console.error);
    res.status(201).json({ success: true, data: { ...documentService.toSummaryView(doc), status: 'analyzing' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    res.status(422).json({ success: false, error: message });
  }
}

export function listDocuments(req: Request, res: Response): void {
  const { userId } = req as AuthenticatedRequest;
  const docs = documentService.getByUser(userId).map(d => documentService.toSummaryView(d));
  res.json({ success: true, data: docs });
}

export function getDocument(req: Request, res: Response): void {
  const { userId } = req as AuthenticatedRequest;
  const doc = documentService.getById(req.params.id, userId);

  if (!doc) {
    res.status(404).json({ success: false, error: 'Document not found' });
    return;
  }

  const { chunks: _c, ...rest } = doc;
  res.json({ success: true, data: rest });
}

export async function triggerAnalysis(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthenticatedRequest;
  const doc = documentService.getById(req.params.id, userId);

  if (!doc) {
    res.status(404).json({ success: false, error: 'Document not found' });
    return;
  }

  if (doc.status === 'analyzing') {
    res.status(409).json({ success: false, error: 'Analysis already in progress' });
    return;
  }

  store.updateDocument(doc.id, { status: 'analyzing', errorMessage: undefined });
  analysisService.analyzeDocument(doc.id).catch(console.error);

  res.json({ success: true, data: { message: 'Analysis started' } });
}

export async function deleteDocument(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthenticatedRequest;
  const deleted = await documentService.remove(req.params.id, userId);

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Document not found' });
    return;
  }

  res.json({ success: true });
}
