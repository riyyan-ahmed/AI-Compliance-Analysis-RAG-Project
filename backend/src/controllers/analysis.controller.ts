import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { documentService } from '../services/document.service';
import { chromaService } from '../services/chroma.service';
import { claudeService } from '../services/claude.service';
import { store } from '../store/sqlite.store';
import { GapAnalysisResult, GapItem } from '../types';

function computeScore(gaps: GapItem[]): number {
  if (gaps.length === 0) return 100;

  const critical = gaps.filter(g => g.severity === 'Critical').length;
  const major    = gaps.filter(g => g.severity === 'Major').length;
  const minor    = gaps.filter(g => g.severity === 'Minor').length;

  // Normalize against the worst case (all gaps Critical).
  // actual/max = 1.0 → 0%,  actual/max = 0.0 → 100%
  const actualPenalty = critical * 8 + major * 5 + minor * 2;
  const maxPenalty    = gaps.length * 8;

  return Math.round((1 - actualPenalty / maxPenalty) * 100);
}

function computeRating(score: number): GapAnalysisResult['overallComplianceRating'] {
  if (score >= 81) return 'Excellent';
  if (score >= 61) return 'Good';
  if (score >= 41) return 'Fair';
  return 'Poor';
}

function applyComputedScore(result: GapAnalysisResult): GapAnalysisResult {
  const overallScore = computeScore(result.gaps);
  return { ...result, overallScore, overallComplianceRating: computeRating(overallScore) };
}

export async function qaStream(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthenticatedRequest;
  const { question } = req.body as { question: string };

  if (!question?.trim()) {
    res.status(400).json({ success: false, error: 'Question is required' });
    return;
  }

  const doc = documentService.getById(req.params.id, userId);
  if (!doc) {
    res.status(404).json({ success: false, error: 'Document not found' });
    return;
  }

  if (doc.status !== 'ready') {
    res.status(409).json({ success: false, error: 'Document analysis is not ready yet' });
    return;
  }

  try {
    const chunks = await chromaService.queryChunks(doc.id, question, 4);
    if (chunks.length === 0) {
      res.status(422).json({ success: false, error: 'Document content is not indexed yet. Please delete and re-upload the document.' });
      return;
    }
    await claudeService.streamAnswer(question, chunks.map(c => c.text), res);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Q&A error]', message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: message });
    } else {
      res.write('data: [ERROR]\n\n');
      res.end();
    }
  }
}

export async function gapAnalysis(req: Request, res: Response): Promise<void> {
  const { userId } = req as AuthenticatedRequest;
  const { docAId, docBId } = req.body as { docAId: string; docBId: string };

  if (!docAId || !docBId) {
    res.status(400).json({ success: false, error: 'Both docAId and docBId are required' });
    return;
  }

  if (docAId === docBId) {
    res.status(400).json({ success: false, error: 'Select two different documents to compare' });
    return;
  }

  const docA = documentService.getById(docAId, userId);
  const docB = documentService.getById(docBId, userId);

  if (!docA || !docB) {
    res.status(404).json({ success: false, error: 'One or both documents not found' });
    return;
  }

  if (docA.status !== 'ready' || docB.status !== 'ready') {
    res.status(409).json({ success: false, error: 'Both documents must be fully analyzed before comparison' });
    return;
  }

  if (!docA.summary || !docB.summary) {
    res.status(409).json({ success: false, error: 'Both documents must be fully analyzed before comparison' });
    return;
  }

  const cached = store.getGapAnalysis(docAId, docBId);
  if (cached) {
    res.json({ success: true, data: applyComputedScore(cached as GapAnalysisResult), cached: true });
    return;
  }

  const excerpt = (text: string) => text.slice(0, 4000);

  try {
    const raw = await claudeService.runGapAnalysis(
      docA.originalName, docB.originalName,
      docA.summary, docB.summary,
      docA.keyPoints ?? [], docB.keyPoints ?? [],
      excerpt(docA.text), excerpt(docB.text)
    );
    const result = applyComputedScore(raw);
    store.saveGapAnalysis(docAId, docBId, result);
    res.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Gap analysis error]', message);
    res.status(500).json({ success: false, error: 'Gap analysis failed. Please try again.' });
  }
}
