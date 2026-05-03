import { useState, useCallback } from 'react';
import { getQAStreamURL } from '../services/api';
import { ChatMessage } from '../types';

interface Options {
  messages: ChatMessage[];
  onUpdate: (messages: ChatMessage[], firstQuestion?: string) => void;
}

export function useStreamingChat(docId: string, { messages, onUpdate }: Options) {
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (question: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: question,
      };
      const assistantId = `assistant-${Date.now() + 1}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
      };

      const isFirst = messages.length === 0;
      let current = [...messages, userMsg, assistantMsg];
      onUpdate(current, isFirst ? question : undefined);
      setLoading(true);

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(getQAStreamURL(docId), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({})) as { error?: string };
          throw new Error(err.error ?? 'Failed to connect to Q&A service');
        }
        if (!response.body) throw new Error('Failed to connect to Q&A service');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]' || payload === '[ERROR]') break;

            try {
              const { text } = JSON.parse(payload) as { text: string };
              current = current.map(m =>
                m.id === assistantId ? { ...m, content: m.content + text } : m
              );
              onUpdate(current);
            } catch {}
          }
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        current = current.map(m =>
          m.id === assistantId ? { ...m, content: errMsg } : m
        );
        onUpdate(current);
      } finally {
        setLoading(false);
      }
    },
    [docId, messages, onUpdate]
  );

  return { loading, send };
}
