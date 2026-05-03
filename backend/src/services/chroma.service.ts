import { ChromaClient, Collection, IEmbeddingFunction } from 'chromadb';
import { DocumentChunk } from '../types';

// ts-node compiles `import()` to `require()`, which breaks ESM-only packages.
// Using new Function prevents TypeScript from transforming this into require().
const dynamicImport = new Function('specifier', 'return import(specifier)') as (
  s: string
) => Promise<any>;

class LocalEmbeddingFunction implements IEmbeddingFunction {
  private pipe: Promise<any> | null = null;

  private async getPipe() {
    if (!this.pipe) {
      const { pipeline, env } = await dynamicImport('chromadb-default-embed');
      env.allowLocalModels = false;
      this.pipe = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: false });
    }
    return this.pipe;
  }

  async generate(texts: string[]): Promise<number[][]> {
    const pipe = await this.getPipe();
    const output = await pipe(texts, { pooling: 'mean', normalize: true });
    return output.tolist();
  }
}

export class ChromaService {
  private client: ChromaClient | null = null;
  private collection: Collection | null = null;
  private static readonly COLLECTION_NAME = 'compliance_docs';
  private readonly embedder = new LocalEmbeddingFunction();

  private async getCollection(): Promise<Collection> {
    if (this.collection) return this.collection;

    if (!this.client) {
      this.client = new ChromaClient({
        path: process.env.CHROMA_URL ?? 'http://localhost:8000',
      });
    }

    this.collection = await this.client.getOrCreateCollection({
      name: ChromaService.COLLECTION_NAME,
      metadata: { 'hnsw:space': 'cosine' },
      embeddingFunction: this.embedder,
    });

    return this.collection;
  }

  async addChunks(docId: string, chunks: DocumentChunk[]): Promise<void> {
    if (chunks.length === 0) return;

    const col = await this.getCollection();

    await col.add({
      ids: chunks.map(c => `${docId}__${c.index}`),
      documents: chunks.map(c => c.text),
      metadatas: chunks.map(c => ({
        docId,
        chunkIndex: c.index,
        startChar: c.startChar,
        endChar: c.endChar,
      })),
    });
  }

  async queryChunks(docId: string, question: string, topK = 4): Promise<DocumentChunk[]> {
    const col = await this.getCollection();
    const total = await col.count();
    if (total === 0) return [];

    const results = await col.query({
      queryTexts: [question],
      nResults: Math.min(topK, total),
      where: { docId: { $eq: docId } } as Parameters<Collection['query']>[0]['where'],
    });

    if (!results.documents[0]) return [];

    return results.documents[0]
      .map((text, i) => {
        const meta = results.metadatas[0][i] as {
          chunkIndex: number;
          startChar: number;
          endChar: number;
        };
        return {
          index: meta.chunkIndex,
          text: text ?? '',
          startChar: meta.startChar,
          endChar: meta.endChar,
        };
      })
      .filter(c => c.text.length > 0);
  }

  async deleteChunks(docId: string): Promise<void> {
    try {
      const col = await this.getCollection();
      await col.delete({ where: { docId: { $eq: docId } } as any });
    } catch {
    }
  }
}

export const chromaService = new ChromaService();
