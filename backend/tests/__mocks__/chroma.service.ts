import { DocumentChunk } from '../../src/types';

export class ChromaService {}

export const chromaService = {
  addChunks: jest.fn(async (_docId: string, _chunks: DocumentChunk[]) => Promise.resolve()),
  queryChunks: jest.fn(async (_docId: string, _question: string, _topK?: number): Promise<DocumentChunk[]> =>
    Promise.resolve([
      { index: 0, text: 'All workers must wear hard hats in operational zones.', startChar: 0, endChar: 55 },
      { index: 1, text: 'High-visibility vests are mandatory in vehicle areas.', startChar: 55, endChar: 108 },
    ])
  ),
  deleteChunks: jest.fn(async (_docId: string) => Promise.resolve()),
};
