import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatThread, ChatMessage } from '../types';

const storageKey = (docId: string) => `chat_threads_${docId}`;

function load(docId: string): ChatThread[] {
  try {
    const raw = localStorage.getItem(storageKey(docId));
    return raw ? (JSON.parse(raw) as ChatThread[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(docId: string, threads: ChatThread[]) {
  try {
    localStorage.setItem(storageKey(docId), JSON.stringify(threads));
  } catch {}
}

export function useChatThreads(docId: string) {
  const [threads, setThreads] = useState<ChatThread[]>(() => load(docId));
  const [activeId, setActiveId] = useState<string | null>(() => {
    const existing = load(docId);
    return existing.length > 0 ? existing[0].id : null;
  });

  // Use functional state update to always operate on latest threads.
  // This prevents stale-closure bugs when updateThread is called
  // multiple times in quick succession (e.g., during streaming).
  const setAndSave = useCallback(
    (updater: (prev: ChatThread[]) => ChatThread[]) => {
      setThreads(prev => {
        const next = updater(prev);
        saveToStorage(docId, next);
        return next;
      });
    },
    [docId]
  );

  const createThread = useCallback(() => {
    const thread: ChatThread = {
      id: uuidv4(),
      title: 'New Chat',
      createdAt: Date.now(),
      messages: [],
    };
    setAndSave(prev => [thread, ...prev]);
    setActiveId(thread.id);
    return thread.id;
  }, [setAndSave]);

  const selectThread = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const updateThread = useCallback(
    (id: string, messages: ChatMessage[], firstQuestion?: string) => {
      setAndSave(prev =>
        prev.map(t => {
          if (t.id !== id) return t;
          const title =
            firstQuestion && t.title === 'New Chat'
              ? firstQuestion.length > 42
                ? firstQuestion.slice(0, 42) + '…'
                : firstQuestion
              : t.title;
          return { ...t, messages, title };
        })
      );
    },
    [setAndSave]
  );

  const deleteThread = useCallback(
    (id: string) => {
      setAndSave(prev => {
        const next = prev.filter(t => t.id !== id);
        if (activeId === id) {
          setActiveId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    },
    [setAndSave, activeId]
  );

  const activeThread = threads.find(t => t.id === activeId) ?? null;

  return { threads, activeId, activeThread, createThread, selectThread, updateThread, deleteThread };
}
