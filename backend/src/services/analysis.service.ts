import { SQLiteStore } from '../store/sqlite.store';
import { ClaudeService } from '../services/claude.service';
import { claudeService } from './claude.service';
import { chromaService } from './chroma.service';
import { ragService } from './rag.service';
import { store } from '../store/sqlite.store';

class AnalysisService {
  constructor(
    private readonly store: SQLiteStore,
    private readonly claude: ClaudeService
  ) {}

  async analyzeDocument(docId: string): Promise<void> {
    const doc = this.store.getDocument(docId);
    if (!doc) return;

    this.store.updateDocument(docId, { status: 'analyzing' });

    try {
      const chunks = ragService.chunk(doc.text);
      await chromaService.deleteChunks(doc.id);
      const [{ summary, keyPoints }] = await Promise.all([
        this.claude.summarize(doc.text),
        chromaService.addChunks(doc.id, chunks),
      ]);
      this.store.updateDocument(docId, { summary, keyPoints, status: 'ready' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      this.store.updateDocument(docId, { status: 'error', errorMessage: message });
    }
  }
}

export const analysisService = new AnalysisService(store, claudeService);
