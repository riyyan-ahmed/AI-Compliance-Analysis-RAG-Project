const mockCreate = jest.fn();

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate, stream: jest.fn() },
  })),
}));

import { claudeService } from '../src/services/claude.service';

beforeEach(() => {
  mockCreate.mockResolvedValue({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          summary: 'A workplace safety document covering PPE and emergency procedures.',
          keyPoints: [
            'Hard hats are mandatory in operational zones',
            'Emergency contacts must be posted at all entry points',
          ],
        }),
      },
    ],
  });
});

afterEach(() => {
  mockCreate.mockReset();
});

describe('claudeService.summarize', () => {
  it('parses the AI response into summary and keyPoints', async () => {
    const result = await claudeService.summarize('Sample compliance document text.');
    expect(result.summary).toBeTruthy();
    expect(Array.isArray(result.keyPoints)).toBe(true);
    expect(result.keyPoints.length).toBeGreaterThan(0);
  });

  it('returns a non-empty summary string', async () => {
    const result = await claudeService.summarize('Any text here.');
    expect(typeof result.summary).toBe('string');
    expect(result.summary.length).toBeGreaterThan(10);
  });

  it('strips markdown code fences from the response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: '```json\n{"summary": "A test summary.", "keyPoints": ["Point A"]}\n```',
        },
      ],
    });

    const result = await claudeService.summarize('Test document content.');
    expect(result.summary).toBe('A test summary.');
    expect(result.keyPoints).toEqual(['Point A']);
  });

  it('calls the Anthropic API with a user message containing the document text', async () => {
    await claudeService.summarize('Test content');
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const call = mockCreate.mock.calls[0][0];
    expect(call.messages[0].role).toBe('user');
    expect(call.messages[0].content).toContain('Test content');
  });
});
