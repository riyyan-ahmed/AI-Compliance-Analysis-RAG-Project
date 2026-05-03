import { DocumentChunk } from '../types';

class RagService {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;
  private readonly minChunkLength: number;

  constructor(chunkSize = 600, chunkOverlap = 100, minChunkLength = 50) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.minChunkLength = minChunkLength;
  }

  chunk(text: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    let i = 0;
    let index = 0;

    while (i < text.length) {
      const end = Math.min(i + this.chunkSize, text.length);
      const chunkText = text.slice(i, end).trim();

      if (chunkText.length > this.minChunkLength) {
        chunks.push({ index, text: chunkText, startChar: i, endChar: end });
        index++;
      }

      i += this.chunkSize - this.chunkOverlap;
    }

    return chunks;
  }
}

export const ragService = new RagService();
