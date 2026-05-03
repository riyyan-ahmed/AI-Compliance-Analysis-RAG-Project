import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Chip,
  Button,
  Alert,
  Skeleton,
  Divider,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ChatBox from '../components/ChatBox';
import ChatSidebar from '../components/ChatSidebar';
import GapAnalysisPanel from '../components/GapAnalysisPanel';
import KeyPoints from '../components/KeyPoints';
import { useChatThreads } from '../hooks/useChatThreads';
import { documentsApi } from '../services/api';
import { DocumentSummary } from '../types';

const POLL_INTERVAL = 3000;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentSummary | null>(null);
  const [allDocs, setAllDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const chatThreads = useChatThreads(id ?? '');

  useEffect(() => {
    if (!id) return;

    const fetchDoc = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [docData, listData] = await Promise.all([
          documentsApi.get(id),
          documentsApi.list(),
        ]);
        setDoc(docData);
        setAllDocs(listData);
        setError(null);
      } catch {
        setError('Document not found or could not be loaded.');
      } finally {
        if (!silent) setLoading(false);
      }
    };

    fetchDoc();
  }, [id]);

  useEffect(() => {
    if (!id || doc?.status !== 'analyzing') return;
    const timer = setInterval(async () => {
      try {
        const updated = await documentsApi.get(id);
        setDoc(updated);
      } catch {
        clearInterval(timer);
      }
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [id, doc?.status]);

  if (loading) {
    return (
      <Layout>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" height={300} sx={{ mt: 2, borderRadius: 2 }} />
      </Layout>
    );
  }

  if (error || !doc) {
    return (
      <Layout>
        <Alert severity="error">{error ?? 'Document not found.'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Layout>
    );
  }

  const isReady = doc.status === 'ready';

  return (
    <Layout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Library
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <InsertDriveFileIcon color="primary" sx={{ fontSize: 36, mt: 0.5 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5">{doc.originalName}</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {formatBytes(doc.fileSize)}
            </Typography>
            <Typography variant="caption" color="text.secondary">·</Typography>
            <Typography variant="caption" color="text.secondary">
              Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Typography>
            <Chip
              label={doc.status === 'analyzing' ? 'Analyzing...' : doc.status}
              color={doc.status === 'ready' ? 'success' : doc.status === 'error' ? 'error' : 'warning'}
              size="small"
            />
          </Box>
        </Box>
      </Box>

      {isReady && doc.summary && (
        <Paper elevation={0} sx={{ border: '1px solid #e0e7f0', borderRadius: 2, p: 3, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            DOCUMENT SUMMARY
          </Typography>
          <Typography variant="body1">{doc.summary}</Typography>

          {doc.keyPoints && doc.keyPoints.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <KeyPoints points={doc.keyPoints} />
            </>
          )}
        </Paper>
      )}

      {doc.status === 'analyzing' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          AI analysis in progress — this page will update automatically.
        </Alert>
      )}

      {doc.status === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {doc.errorMessage ?? 'Analysis failed.'}
        </Alert>
      )}

      {isReady && (
        <>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e0e7f0' }}>
            <Tab label="Q&A Assistant" />
            <Tab label="Gap Analysis" />
          </Tabs>

          {tab === 0 && (
            <Box
              sx={{
                display: 'flex',
                height: 540,
                border: '1px solid #e0e7f0',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <ChatSidebar
                threads={chatThreads.threads}
                activeId={chatThreads.activeId}
                onSelect={chatThreads.selectThread}
                onCreate={() => {
                  const id = chatThreads.createThread();
                  return id;
                }}
                onDelete={chatThreads.deleteThread}
              />

              {chatThreads.activeThread ? (
                <ChatBox
                  docId={doc.id}
                  messages={chatThreads.activeThread.messages}
                  onUpdate={(msgs, firstQ) =>
                    chatThreads.updateThread(chatThreads.activeId!, msgs, firstQ)
                  }
                />
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    bgcolor: '#fafbfd',
                    color: 'text.secondary',
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 48, opacity: 0.2 }} />
                  <Typography variant="body2">Start a new chat to ask questions about this document</Typography>
                  <Button variant="contained" onClick={chatThreads.createThread}>
                    New Chat
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {tab === 1 && (
            <GapAnalysisPanel currentDocId={doc.id} allDocs={allDocs} />
          )}
        </>
      )}
    </Layout>
  );
}
