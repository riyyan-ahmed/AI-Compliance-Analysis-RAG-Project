import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Avatar,
  Tooltip,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e7f0' }}>
        <Toolbar>
          <VerifiedIcon sx={{ mr: 1.2, fontSize: 26 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: 'pointer', letterSpacing: '-0.3px' }}
            onClick={() => navigate('/dashboard')}
          >
            Compliance Analyzer
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title={user.username}>
                <Avatar
                  sx={{ width: 34, height: 34, bgcolor: 'primary.dark', fontSize: 14 }}
                >
                  {user.username[0].toUpperCase()}
                </Avatar>
              </Tooltip>
              <Button
                color="inherit"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ opacity: 0.85 }}
              >
                Sign out
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
