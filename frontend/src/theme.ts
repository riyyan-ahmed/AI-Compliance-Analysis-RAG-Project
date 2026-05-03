import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a4fa0',
      light: '#4a75c9',
      dark: '#0d2f6e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e8611a',
      light: '#f08c50',
      dark: '#b54210',
    },
    background: {
      default: '#f4f6fb',
      paper: '#ffffff',
    },
    error: { main: '#c62828' },
    warning: { main: '#e65100' },
    success: { main: '#2e7d32' },
    text: {
      primary: '#0f1c2e',
      secondary: '#5a6a80',
    },
    divider: '#e0e7f0',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.5px' },
    h2: { fontWeight: 800, letterSpacing: '-0.5px' },
    h3: { fontWeight: 700, letterSpacing: '-0.3px' },
    h4: { fontWeight: 700, letterSpacing: '-0.3px' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.02em' },
    overline: { fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.72rem' },
    button: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 3px rgba(15,28,46,0.06)',
    '0 2px 8px rgba(15,28,46,0.08)',
    '0 4px 16px rgba(15,28,46,0.10)',
    '0 6px 24px rgba(15,28,46,0.12)',
    '0 8px 32px rgba(15,28,46,0.14)',
    '0 10px 40px rgba(15,28,46,0.16)',
    '0 12px 48px rgba(15,28,46,0.18)',
    '0 14px 56px rgba(15,28,46,0.20)',
    '0 16px 64px rgba(15,28,46,0.22)',
    '0 18px 72px rgba(15,28,46,0.24)',
    '0 20px 80px rgba(15,28,46,0.26)',
    '0 22px 88px rgba(15,28,46,0.28)',
    '0 24px 96px rgba(15,28,46,0.30)',
    '0 26px 104px rgba(15,28,46,0.32)',
    '0 28px 112px rgba(15,28,46,0.34)',
    '0 30px 120px rgba(15,28,46,0.36)',
    '0 32px 128px rgba(15,28,46,0.38)',
    '0 34px 136px rgba(15,28,46,0.40)',
    '0 36px 144px rgba(15,28,46,0.42)',
    '0 38px 152px rgba(15,28,46,0.44)',
    '0 40px 160px rgba(15,28,46,0.46)',
    '0 42px 168px rgba(15,28,46,0.48)',
    '0 44px 176px rgba(15,28,46,0.50)',
    '0 46px 184px rgba(15,28,46,0.52)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        'html, body': { scrollBehavior: 'smooth' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          letterSpacing: 0,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1a4fa0 0%, #2563eb 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0d2f6e 0%, #1a4fa0 100%)',
          },
        },
        sizeLarge: { padding: '10px 24px', fontSize: '0.95rem' },
        sizeSmall: { padding: '5px 14px', fontSize: '0.82rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(15,28,46,0.07)',
          borderRadius: 14,
          border: '1px solid #e8eef6',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #0d2f6e 0%, #1a4fa0 100%)',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: 6 },
        sizeSmall: { fontSize: '0.75rem' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1a4fa0',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&.Mui-expanded': { margin: 0 },
          '&:before': { display: 'none' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

export default theme;
