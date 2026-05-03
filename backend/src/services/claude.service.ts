import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { GapAnalysisResult } from '../types';

export class ClaudeService {
  private readonly client: Anthropic;
  private static readonly MODEL = 'claude-sonnet-4-6';

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }

  private stripJsonFences(raw: string): string {
    return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }

  private sampleText(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;
    const head = Math.floor(maxChars * 0.5);
    const tail = maxChars - head;
    return text.slice(0, head) + '\n\n[...document continues...]\n\n' + text.slice(-tail);
  }

  async summarize(text: string): Promise<{ summary: string; keyPoints: string[] }> {
    const content = this.sampleText(text, 24_000);

    const message = await this.client.messages.create({
      model: ClaudeService.MODEL,
      max_tokens: 1024,
      temperature: 0,
      system: [
        {
          type: 'text',
          text: 'You are a compliance document analyst. Extract structured insights from workplace safety and compliance documents. Respond with valid JSON only — no markdown, no explanation.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content:
            'Summarize this compliance document based only on what it contains. Do not mention what is absent, missing, or not covered — that is handled separately by gap analysis.\n\n' +
            'Return a JSON object with:\n' +
            '- "summary": 3-4 sentence plain English overview of what this document covers and requires\n' +
            '- "keyPoints": array of 6-8 specific concrete obligations or requirements that are stated in the document\n\n' +
            `Document:\n${content}`,
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
    return JSON.parse(this.stripJsonFences(raw)) as { summary: string; keyPoints: string[] };
  }

  async streamAnswer(question: string, contextChunks: string[], res: Response): Promise<void> {
    const context = contextChunks.map((c, i) => `[Section ${i + 1}]\n${c}`).join('\n\n---\n\n');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const stream = this.client.messages.stream({
      model: ClaudeService.MODEL,
      max_tokens: 600,
      temperature: 0.2,
      system: [
        {
          type: 'text',
          text: 'You are a concise compliance document assistant. Answer questions based only on the provided document sections. Cite the section number when relevant. If the answer is not in the sections, say so clearly.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Using only the sections below, answer: "${question}"\n\n${context}`,
        },
      ],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }

  private extractJson(raw: string): string {
    const cleaned = this.stripJsonFences(raw);
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found in response');
    return cleaned.slice(start, end + 1);
  }

  async runGapAnalysis(
    docAName: string,
    docBName: string,
    docASummary: string,
    docBSummary: string,
    docAKeyPoints: string[],
    docBKeyPoints: string[],
    docAExcerpt: string,
    docBExcerpt: string
  ): Promise<GapAnalysisResult> {
    const formatDoc = (
      name: string,
      summary: string,
      keyPoints: string[],
      excerpt: string
    ) =>
      `Name: ${name}\n` +
      `Summary: ${summary}\n` +
      `Key Requirements:\n${keyPoints.map(p => `  - ${p}`).join('\n')}\n` +
      `Excerpt:\n${excerpt}`;

    const message = await this.client.messages.create({
      model: ClaudeService.MODEL,
      max_tokens: 8000,
      temperature: 0,
      system: [
        {
          type: 'text',
          text: 'You are a senior compliance auditor. Compare two compliance documents and identify gaps. Respond with raw JSON only — no markdown fences, no preamble, no trailing text.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content:
            `Perform a compliance gap analysis. Document A is the company procedure; Document B is the regulatory standard.\n\n` +
            `=== Document A ===\n${formatDoc(docAName, docASummary, docAKeyPoints, docAExcerpt)}\n\n` +
            `=== Document B ===\n${formatDoc(docBName, docBSummary, docBKeyPoints, docBExcerpt)}\n\n` +
            `Return exactly this JSON structure (omit overallScore and overallComplianceRating — they are calculated from the gaps):\n` +
            `{"summary":"","totalGapsFound":0,"gaps":[{"area":"","severity":"Critical|Major|Minor","acmeProcedure":"","standardRequirement":"","recommendation":""}],"strengths":[""],"priorityActions":[""]}`,
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    if (!raw) throw new Error('Empty response from Claude');
    return JSON.parse(this.extractJson(raw)) as GapAnalysisResult;
  }
}

export const claudeService = new ClaudeService();
