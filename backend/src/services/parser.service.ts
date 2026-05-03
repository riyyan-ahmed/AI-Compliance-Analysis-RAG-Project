import fs from 'fs';
import pdfParse from 'pdf-parse';

class ParserService {
  async extractText(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);

    const text = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!text || text.length < 50) {
      throw new Error(
        'Could not extract readable text from this PDF. Make sure the file contains digital (not scanned) text.'
      );
    }

    return text;
  }

  wordCount(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
}

export const parserService = new ParserService();
