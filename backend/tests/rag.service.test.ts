import { ragService } from '../src/services/rag.service';
import { DocumentChunk } from '../src/types';

const SAMPLE_TEXT = `
Personal Protective Equipment requirements state that all workers must wear hard hats in operational zones.
High-visibility vests are mandatory in vehicle movement areas. Steel-capped boots are required at all times.

Emergency procedures require workers to notify their supervisor immediately after any accident.
First aid kits are located at the main office. In case of fire, call 000 and evacuate the area.

Chemical handling procedures specify that all chemicals must be stored in the designated shed.
Safety data sheets must be available for all hazardous substances on site.
Workers must wear appropriate PPE including gloves and eye protection when handling chemicals.

Working at heights requires fall arrest harnesses for any work above two metres.
Scaffolding must be inspected before each use. A permit-to-work is required for elevated work.
`.trim();

describe('RagService.chunk', () => {
  it('splits text into multiple chunks', () => {
    expect(ragService.chunk(SAMPLE_TEXT).length).toBeGreaterThan(0);
  });

  it('assigns sequential index values', () => {
    const chunks = ragService.chunk(SAMPLE_TEXT);
    chunks.forEach((c: DocumentChunk, i: number) => expect(c.index).toBe(i));
  });

  it('preserves startChar and endChar boundaries', () => {
    ragService.chunk(SAMPLE_TEXT).forEach((c: DocumentChunk) => {
      expect(c.startChar).toBeGreaterThanOrEqual(0);
      expect(c.endChar).toBeGreaterThan(c.startChar);
    });
  });

  it('returns empty array for empty input', () => {
    expect(ragService.chunk('')).toHaveLength(0);
  });

  it('returns chunks for text longer than the minimum threshold', () => {
    const text = 'All workers must wear hard hats and high-visibility vests in all operational zones on site.';
    expect(ragService.chunk(text).length).toBeGreaterThan(0);
  });

  it('chunk text content matches the original source text', () => {
    const chunks = ragService.chunk(SAMPLE_TEXT);
    chunks.forEach((c: DocumentChunk) => {
      expect(SAMPLE_TEXT.slice(c.startChar, c.endChar)).toContain(c.text.slice(0, 20));
    });
  });
});
