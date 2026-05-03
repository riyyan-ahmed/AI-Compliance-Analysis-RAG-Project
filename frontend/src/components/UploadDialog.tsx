import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface Props {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, onProgress: (p: number) => void) => Promise<void>;
}

export default function UploadDialog({ open, onClose, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setFile(null);
    setProgress(0);
    setError(null);
    setUploading(false);
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(file, setProgress);
      reset();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Upload failed. Please try again.';
      setError(msg);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Compliance Document</DialogTitle>

      <DialogContent>
        <Box
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: dragging ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            bgcolor: dragging ? 'primary.50' : 'grey.50',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {file ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
              <PictureAsPdfIcon color="error" sx={{ fontSize: 36 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2">{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1.5 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Drag and drop a PDF here
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                or click to browse — PDF only, max 20 MB
              </Typography>
            </>
          )}
        </Box>

        {uploading && (
          <Box mt={2}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              Uploading... {progress}%
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || uploading}
          disableElevation
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
