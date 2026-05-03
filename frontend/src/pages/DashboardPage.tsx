import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Layout from '../components/Layout';
import DocumentCard from '../components/DocumentCard';
import UploadDialog from '../components/UploadDialog';
import { documentsApi } from '../services/api';
import { DocumentSummary } from '../types';
import { useNavigate } from 'react-router-dom';

const POLL_INTERVAL = 4000;

export default function DashboardPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchDocs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await documentsApi.list();
      setDocs(data);
      setError(null);
    } catch {
      setError('Failed to load documents. Please refresh the page.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    const hasAnalyzing = docs.some(d => d.status === 'analyzing');
    if (!hasAnalyzing) return;

    const timer = setInterval(() => fetchDocs(true), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [docs, fetchDocs]);

  const handleUpload = async (file: File, onProgress: (p: number) => void) => {
    const newDoc = await documentsApi.upload(file, onProgress);
    setDocs(prev => [newDoc, ...prev]);
  };

  const handleAnalyze = async (id: string) => {
    try {
      await documentsApi.analyze(id);
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'analyzing' } : d));
    } catch {
      setError('Failed to start analysis. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await documentsApi.remove(id);
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch {
      setError('Failed to delete document.');
    }
  };

  const analyzingCount = docs.filter(d => d.status === 'analyzing').length;

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4">Document Library</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Upload compliance documents to extract insights and perform gap analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {analyzingCount > 0 && (
            <Chip
              label={`${analyzingCount} analyzing...`}
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadOpen(true)}
            disableElevation
          >
            Upload PDF
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : docs.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            border: '2px dashed #d0daea',
            borderRadius: 3,
            color: 'text.secondary',
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 52, mb: 2, opacity: 0.4 }} />
          <Typography variant="h6" mb={1}>No documents yet</Typography>
          <Typography variant="body2" mb={3}>
            Upload a PDF to get started with AI-powered compliance analysis
          </Typography>
          <Button
            variant="contained"
            onClick={() => setUploadOpen(true)}
            disableElevation
          >
            Upload your first document
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {docs.map(doc => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <DocumentCard
                doc={doc}
                onView={id => navigate(`/documents/${id}`)}
                onAnalyze={handleAnalyze}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
    </Layout>
  );
}
