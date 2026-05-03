import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { DocumentSummary, GapAnalysisResult, GapItem } from '../types';
import { analysisApi } from '../services/api';

interface Props {
  currentDocId: string;
  allDocs: DocumentSummary[];
}

const severityConfig = {
  Critical: { color: 'error' as const, bgcolor: '#fdecea', border: '#ef9a9a' },
  Major: { color: 'warning' as const, bgcolor: '#fff3e0', border: '#ffcc80' },
  Minor: { color: 'default' as const, bgcolor: '#f5f5f5', border: '#e0e0e0' },
};

const ratingColor = {
  Poor: '#d32f2f',
  Fair: '#ed6c02',
  Good: '#2e7d32',
  Excellent: '#1565c0',
};

function ScoreRing({ score, rating }: { score: number; rating: string }) {
  const color = ratingColor[rating as keyof typeof ratingColor] ?? '#666';
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
      <CircularProgress
        variant="determinate"
        value={score}
        size={90}
        thickness={5}
        sx={{ color }}
      />
      <CircularProgress
        variant="determinate"
        value={100}
        size={90}
        thickness={5}
        sx={{ color: '#e0e0e0', position: 'absolute', top: 0, left: 0 }}
      />
      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ color, fontWeight: 700, lineHeight: 1 }}>{score}</Typography>
        <Typography variant="caption" color="text.secondary">/100</Typography>
      </Box>
    </Box>
  );
}

function GapRow({ gap }: { gap: GapItem }) {
  const cfg = severityConfig[gap.severity];
  return (
    <Accordion elevation={0} sx={{ border: `1px solid ${cfg.border}`, borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: cfg.bgcolor, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Chip label={gap.severity} color={cfg.color} size="small" />
          <Typography variant="subtitle2">{gap.area}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>CURRENT PROCEDURE</Typography>
            <Typography variant="body2" mt={0.5}>{gap.acmeProcedure}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>STANDARD REQUIREMENT</Typography>
            <Typography variant="body2" mt={0.5}>{gap.standardRequirement}</Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <WarningAmberIcon fontSize="small" color="warning" sx={{ mt: 0.3 }} />
          <Box>
            <Typography variant="caption" fontWeight={600}>RECOMMENDATION</Typography>
            <Typography variant="body2">{gap.recommendation}</Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default function GapAnalysisPanel({ currentDocId, allDocs }: Props) {
  const [compareDocId, setCompareDocId] = useState('');
  const [result, setResult] = useState<GapAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readyDocs = allDocs.filter(d => d.status === 'ready' && d.id !== currentDocId);

  const handleRun = async () => {
    if (!compareDocId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analysisApi.gapAnalysis(currentDocId, compareDocId);
      setResult(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Gap analysis failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>Compare against...</InputLabel>
          <Select
            value={compareDocId}
            label="Compare against..."
            onChange={e => setCompareDocId(e.target.value)}
          >
            {readyDocs.length === 0 && (
              <MenuItem disabled>No other analyzed documents</MenuItem>
            )}
            {readyDocs.map(d => (
              <MenuItem key={d.id} value={d.id}>{d.originalName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CompareArrowsIcon />}
          onClick={handleRun}
          disabled={!compareDocId || loading}
          disableElevation
        >
          {loading ? 'Analyzing...' : 'Run Gap Analysis'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box>
          <LinearProgress sx={{ mb: 1.5 }} />
          <Typography variant="body2" color="text.secondary">
            Comparing documents with AI — this takes 10-20 seconds...
          </Typography>
        </Box>
      )}

      {result && (
        <Box>
          <Paper elevation={0} sx={{ border: '1px solid #e0e7f0', borderRadius: 2, p: 3, mb: 3, display: 'flex', alignItems: 'center' }}>
            <ScoreRing score={result.overallScore} rating={result.overallComplianceRating} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Compliance: {result.overallComplianceRating}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {result.summary}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                {(['Critical', 'Major', 'Minor'] as const).map(s => {
                  const count = result.gaps.filter(g => g.severity === s).length;
                  return (
                    <Chip
                      key={s}
                      label={`${count} ${s}`}
                      color={severityConfig[s].color}
                      size="small"
                      variant="outlined"
                    />
                  );
                })}
              </Box>
            </Box>
          </Paper>

          <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
            Priority Actions
          </Typography>
          <Paper elevation={0} sx={{ border: '1px solid #e0e7f0', borderRadius: 2, p: 2, mb: 3 }}>
            <List dense disablePadding>
              {result.priorityActions.map((action, i) => (
                <ListItem key={i} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <PriorityHighIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary={action} />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
            Identified Gaps ({result.totalGapsFound})
          </Typography>
          {result.gaps.map((gap, i) => (
            <GapRow key={i} gap={gap} />
          ))}

          {result.strengths.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
                Strengths
              </Typography>
              <Paper elevation={0} sx={{ border: '1px solid #c8e6c9', borderRadius: 2, p: 2 }}>
                <List dense disablePadding>
                  {result.strengths.map((s, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleOutlineIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary={s} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
