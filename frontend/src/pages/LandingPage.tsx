import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Stack,
  Divider,
  Paper,
  useTheme,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <CloudUploadIcon sx={{ fontSize: 32 }} />,
    title: 'Instant Document Ingestion',
    desc: 'Upload any PDF compliance document and get a structured summary with key obligations extracted in seconds.',
  },
  {
    icon: <QuestionAnswerIcon sx={{ fontSize: 32 }} />,
    title: 'AI-Powered Q&A',
    desc: 'Ask plain-English questions about your documents. The assistant answers using only content from the document itself.',
  },
  {
    icon: <CompareArrowsIcon sx={{ fontSize: 32 }} />,
    title: 'Gap Analysis',
    desc: 'Compare company procedures against regulatory standards side-by-side and receive a scored compliance report.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Upload your PDFs',
    desc: 'Drop in your workplace procedures, policies, or regulatory standards.',
  },
  {
    step: '02',
    title: 'AI analyses the content',
    desc: 'Claude reads and indexes every section using vector search for precision retrieval.',
  },
  {
    step: '03',
    title: 'Explore and compare',
    desc: 'Chat with your documents or run a gap analysis to identify compliance risks.',
  },
];

const badges = [
  { icon: <ShieldIcon sx={{ fontSize: 18 }} />, label: 'ISO-27001 aligned storage' },
  { icon: <SpeedIcon sx={{ fontSize: 18 }} />, label: 'Results in under 30 seconds' },
  { icon: <AutoAwesomeIcon sx={{ fontSize: 18 }} />, label: 'Powered by Claude AI' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e0e7f0',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', height: 64, gap: 1.5 }}>
            <VerifiedIcon sx={{ color: 'primary.main', fontSize: 26 }} />
            <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ flexGrow: 1 }}>
              Compliance Analyzer
            </Typography>
            <Button variant="outlined" size="small" onClick={() => navigate('/login')} sx={{ mr: 1 }}>
              Sign in
            </Button>
            <Button variant="contained" size="small" disableElevation onClick={() => navigate('/login')}>
              Get started
            </Button>
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          background: `linear-gradient(140deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, #2563eb 100%)`,
          color: '#fff',
          pt: { xs: 10, md: 16 },
          pb: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
              px: 2,
              py: 0.6,
              mb: 3,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 15, opacity: 0.9 }} />
            <Typography variant="caption" fontWeight={600} sx={{ letterSpacing: 0.5 }}>
              Built for workplace health &amp; safety teams
            </Typography>
          </Box>

          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ fontSize: { xs: '2.2rem', md: '3.4rem' }, lineHeight: 1.15, mb: 3, letterSpacing: '-0.5px' }}
          >
            Compliance analysis
            <br />
            at the speed of AI
          </Typography>

          <Typography
            variant="h6"
            sx={{ opacity: 0.82, fontWeight: 400, maxWidth: 560, mx: 'auto', lineHeight: 1.7, mb: 5 }}
          >
            Upload compliance PDFs, ask questions in plain English, and identify regulatory gaps
            — all powered by Claude AI.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              disableElevation
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#fff',
                color: 'primary.dark',
                fontWeight: 700,
                px: 4,
                '&:hover': { bgcolor: '#f0f4ff' },
              }}
            >
              Start analyzing
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: '#fff',
                fontWeight: 600,
                px: 4,
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              View demo
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={3}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mt: 6, opacity: 0.75 }}
          >
            {badges.map(b => (
              <Box key={b.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                {b.icon}
                <Typography variant="caption" fontWeight={500}>
                  {b.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant="overline" color="primary" fontWeight={700} display="block" textAlign="center" mb={1}>
          Features
        </Typography>
        <Typography variant="h4" fontWeight={800} textAlign="center" mb={1.5} sx={{ letterSpacing: '-0.3px' }}>
          Everything your compliance team needs
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={6} sx={{ maxWidth: 520, mx: 'auto' }}>
          From raw PDF to actionable compliance insights, the entire workflow lives in one place.
        </Typography>

        <Grid container spacing={3}>
          {features.map(f => (
            <Grid item xs={12} md={4} key={f.title}>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #e0e7f0',
                  borderRadius: 3,
                  p: 4,
                  height: '100%',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(26,79,160,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: '#fff',
                    mb: 2.5,
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: '#f8faff', borderTop: '1px solid #e0e7f0', borderBottom: '1px solid #e0e7f0' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Typography variant="overline" color="primary" fontWeight={700} display="block" textAlign="center" mb={1}>
            How it works
          </Typography>
          <Typography variant="h4" fontWeight={800} textAlign="center" mb={7} sx={{ letterSpacing: '-0.3px' }}>
            Three steps to compliance clarity
          </Typography>

          <Grid container spacing={4}>
            {steps.map((s, i) => (
              <Grid item xs={12} md={4} key={s.step}>
                <Box sx={{ display: 'flex', gap: 2.5 }}>
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      sx={{ color: 'primary.main', opacity: 0.18, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {s.step}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} mb={1}>
                      {s.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                      {s.desc}
                    </Typography>
                    {i < steps.length - 1 && (
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'block' },
                          mt: 3,
                          borderTop: '2px dashed #c5d3e8',
                          width: '100%',
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, #1e3a8a 100%)`,
          color: '#fff',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={800} mb={2} sx={{ letterSpacing: '-0.3px' }}>
            Ready to streamline your compliance review?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, mb: 5 }}>
            Sign in and upload your first document in under a minute.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            disableElevation
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: '#fff',
              color: 'primary.dark',
              fontWeight: 700,
              px: 5,
              py: 1.5,
              '&:hover': { bgcolor: '#f0f4ff' },
            }}
          >
            Get started free
          </Button>
        </Container>
      </Box>

      <Box component="footer" sx={{ borderTop: '1px solid #e0e7f0', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="body2" fontWeight={600} color="primary.main">
                Compliance Analyzer
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Powered by Anthropic Claude &nbsp;·&nbsp; Built for WHS professionals
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
