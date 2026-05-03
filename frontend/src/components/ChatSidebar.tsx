import React from 'react';
import { Box, Typography, IconButton, Tooltip, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { ChatThread } from '../types';

interface Props {
  threads: ChatThread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export default function ChatSidebar({ threads, activeId, onSelect, onCreate, onDelete }: Props) {
  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid #e0e7f0',
        bgcolor: '#f7f8fc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: '1px solid #e0e7f0' }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onCreate}
          sx={{ borderColor: '#d0daea', color: 'text.primary', justifyContent: 'flex-start', fontWeight: 500 }}
        >
          New Chat
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 0.5 }}>
        {threads.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ px: 2, py: 1, display: 'block' }}>
            No conversations yet
          </Typography>
        )}

        {threads.map(thread => (
          <Box
            key={thread.id}
            onClick={() => onSelect(thread.id)}
            sx={{
              px: 1.5,
              py: 1,
              mx: 0.5,
              my: 0.25,
              borderRadius: 1.5,
              cursor: 'pointer',
              bgcolor: thread.id === activeId ? 'primary.main' : 'transparent',
              color: thread.id === activeId ? 'white' : 'text.primary',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              '&:hover': {
                bgcolor: thread.id === activeId ? 'primary.main' : '#edf0f7',
              },
              '& .delete-btn': { opacity: 0 },
              '&:hover .delete-btn': { opacity: 1 },
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 14, mt: '3px', flexShrink: 0, opacity: 0.7 }} />

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.4,
                }}
              >
                {thread.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.65,
                  fontSize: '0.68rem',
                  display: 'block',
                }}
              >
                {formatDate(thread.createdAt)}
              </Typography>
            </Box>

            <Tooltip title="Delete">
              <IconButton
                className="delete-btn"
                size="small"
                onClick={e => { e.stopPropagation(); onDelete(thread.id); }}
                sx={{
                  p: 0.3,
                  flexShrink: 0,
                  color: thread.id === activeId ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                  '&:hover': { color: thread.id === activeId ? 'white' : 'error.main' },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
