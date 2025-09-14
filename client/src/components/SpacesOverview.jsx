
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Paper, Alert,
  CircularProgress, List, ListItem, ListItemText, Divider,
  Tab, Tabs, Container
} from '@mui/material';
import { Museum, LocalParking, Home, TrendingUp } from '@mui/icons-material';
import axios from 'axios';
import ExhibitionSpaces from './ExhibitionSpaces';
import ParkingSpaces from './ParkingSpaces';
import RentSpaces from './RentSpaces';

const API_BASE_URL = 'http://localhost:5000/api';

function SpacesOverview() {
  const [statistics, setStatistics] = useState({
    exhibition: 0,
    parking: 0,
    rent: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [recentSpaces, setRecentSpaces] = useState([]);

  useEffect(() => {
    fetchStatistics();
    fetchRecentSpaces();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/spaces/statistics`);
      setStatistics(response.data);
    } catch (error) {
      setError('სტატისტიკის ჩატვირთვა ვერ მოხერხდა');
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentSpaces = async () => {
    try {
      const [exhibitionRes, parkingRes, rentRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/spaces/exhibition`),
        axios.get(`${API_BASE_URL}/spaces/parking`),
        axios.get(`${API_BASE_URL}/spaces/rent`)
      ]);

      const allSpaces = [
        ...exhibitionRes.data.slice(0, 3).map(space => ({ ...space, type: 'exhibition' })),
        ...parkingRes.data.slice(0, 3).map(space => ({ ...space, type: 'parking' })),
        ...rentRes.data.slice(0, 3).map(space => ({ ...space, type: 'rent' }))
      ];

      // Sort by created_at and take first 5
      allSpaces.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentSpaces(allSpaces.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent spaces:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getSpaceTypeLabel = (type) => {
    switch (type) {
      case 'exhibition': return 'გამოფენა';
      case 'parking': return 'პარკინგი';
      case 'rent': return 'ქირავნობა';
      default: return type;
    }
  };

  const getSpaceTypeIcon = (type) => {
    switch (type) {
      case 'exhibition': return <Museum />;
      case 'parking': return <LocalParking />;
      case 'rent': return <Home />;
      default: return null;
    }
  };

  const tabContent = [
    { label: 'მიმოხილვა', value: 0 },
    { label: 'გამოფენის სივრცეები', value: 1 },
    { label: 'პარკინგის სივრცეები', value: 2 },
    { label: 'ქირავნობის სივრცეები', value: 3 }
  ];

  if (activeTab === 1) return <ExhibitionSpaces onBack={() => setActiveTab(0)} />;
  if (activeTab === 2) return <ParkingSpaces onBack={() => setActiveTab(0)} />;
  if (activeTab === 3) return <RentSpaces onBack={() => setActiveTab(0)} />;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {tabContent.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      <Container maxWidth="lg" sx={{ px: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <TrendingUp sx={{ mr: 2, verticalAlign: 'middle' }} />
          სივრცეების მიმოხილვა
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" component="div">
                          {statistics.exhibition}
                        </Typography>
                        <Typography variant="body2">
                          გამოფენის სივრცეები
                        </Typography>
                      </Box>
                      <Museum sx={{ fontSize: 40, opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" component="div">
                          {statistics.parking}
                        </Typography>
                        <Typography variant="body2">
                          პარკინგის სივრცეები
                        </Typography>
                      </Box>
                      <LocalParking sx={{ fontSize: 40, opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" component="div">
                          {statistics.rent}
                        </Typography>
                        <Typography variant="body2">
                          ქირავნობის სივრცეები
                        </Typography>
                      </Box>
                      <Home sx={{ fontSize: 40, opacity: 0.7 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}

export default SpacesOverview;
