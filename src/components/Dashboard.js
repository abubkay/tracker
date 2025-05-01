// src/components/Dashboard.js
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import LiveMap from './LiveMap';
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
        <Typography variant="h4" component="h1">
          GPS Tracker Admin
        </Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <LiveMap />
    </Container>
  );
};

export default Dashboard;