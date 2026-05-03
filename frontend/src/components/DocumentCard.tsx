import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Button,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DocumentSummary, DocumentStatus } from '../types';

interface Props {
  doc: DocumentSummary;
  onView: (id: string) => void;
  onAnalyze: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<DocumentStatus, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  uploaded: { label: 'Uploaded', color: 'default' },
  analyzing: { label: 'Analyzing...', color: 'warning' },
  ready: { label: 'Ready', color: 'success' },
  error: { label: 'Error', color: 'error' },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DocumentCard({ doc, onView, onAnalyze, onDelete }: Props) {
  const status = statusConfig[doc.status];
  const isAnalyzing = doc.status === 'analyzing';
  const isReady = doc.status === 'ready';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isAnalyzing && <LinearProgress />}

      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <InsertDriveFileIcon color="primary" />
            <Typography
              variant="subtitle1"
              noWrap
              title={doc.originalName}
              sx={{ maxWidth: 180 }}
            >
              {doc.originalName}
            </Typography>
          </Box>
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {formatBytes(doc.fileSize)} &nbsp;·&nbsp; {formatDate(doc.uploadedAt)}
        </Typography>

        {isReady && doc.summary && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {doc.summary}
          </Typography>
        )}

        {doc.status === 'uploaded' && (
          <Typography variant="body2" color="text.secondary">
            Click "Analyze" to extract insights from this document.
          </Typography>
        )}

        {doc.status === 'error' && (
          <Typography variant="body2" color="error">
            {doc.errorMessage ?? 'Analysis failed. Try again.'}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        {!isReady && doc.status !== 'analyzing' && (
          <Button
            size="small"
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => onAnalyze(doc.id)}
            disableElevation
          >
            Analyze
          </Button>
        )}

        {isReady && (
          <Button
            size="small"
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={() => onView(doc.id)}
            disableElevation
          >
            Open
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={isAnalyzing ? 'Cannot delete while analyzing' : 'Delete document'}>
          <span>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(doc.id)}
              disabled={isAnalyzing}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
