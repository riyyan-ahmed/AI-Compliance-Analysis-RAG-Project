import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStreamingChat } from '../hooks/useStreamingChat';
import { ChatMessage } from '../types';

interface Props {
  docId: string;
  messages: ChatMessage[];
  onUpdate: (messages: ChatMessage[], firstQuestion?: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'What are the key obligations or requirements in this document?',
  'What are the penalties or consequences for non-compliance?',
  'Who is responsible for ensuring compliance?',
];

export default function ChatBox({ docId, messages, onUpdate }: Props) {
  const { loading, send } = useStreamingChat(docId, { messages, onUpdate });
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    await send(q);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#fafbfd' }}>
        {messages.length === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Ask anything about this document. Try one of these:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {SUGGESTED_QUESTIONS.map(q => (
                <Button
                  key={q}
                  size="small"
                  variant="outlined"
                  onClick={() => send(q)}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', borderColor: '#d0daea' }}
                >
                  {q}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {messages.map(msg => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 1,
              alignItems: 'flex-start',
            }}
          >
            {msg.role === 'assistant' && (
              <SmartToyIcon sx={{ mt: 0.5, fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
            )}

            <Paper
              elevation={0}
              sx={{
                px: 1.8,
                py: 1.2,
                maxWidth: '82%',
                bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                color: msg.role === 'user' ? 'white' : 'text.primary',
                border: msg.role === 'assistant' ? '1px solid #e0e7f0' : 'none',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                wordBreak: 'break-word',
                '& p': { mt: 0, mb: 0.5, fontSize: '0.875rem', lineHeight: 1.6 },
                '& p:last-child': { mb: 0 },
                '& h1, & h2, & h3': { fontSize: '0.9rem', fontWeight: 600, mt: 1, mb: 0.5 },
                '& h1:first-of-type, & h2:first-of-type, & h3:first-of-type': { mt: 0 },
                '& ul, & ol': { mt: 0.5, mb: 0.5, pl: 2.5, fontSize: '0.875rem' },
                '& li': { mb: 0.25 },
                '& strong': { fontWeight: 600 },
                '& code': { fontFamily: 'monospace', bgcolor: '#f0f4f8', px: 0.5, borderRadius: 0.5, fontSize: '0.8rem' },
                '& blockquote': { borderLeft: '3px solid #d0daea', pl: 1.5, my: 0.5, color: 'text.secondary', fontStyle: 'italic' },
              }}
            >
              {msg.role === 'assistant' ? (
                msg.content === '' && loading ? (
                  <CircularProgress size={14} />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              )}
            </Paper>

            {msg.role === 'user' && (
              <PersonIcon sx={{ mt: 0.5, fontSize: 18, color: 'grey.500', flexShrink: 0 }} />
            )}
          </Box>
        ))}

        <div ref={bottomRef} />
      </Box>

      <Divider />

      <Box sx={{ p: 1.5, display: 'flex', gap: 1, bgcolor: 'white' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          multiline
          maxRows={3}
          sx={{ '& fieldset': { borderColor: '#d0daea' } }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          sx={{ alignSelf: 'flex-end' }}
        >
          {loading ? <CircularProgress size={20} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}
