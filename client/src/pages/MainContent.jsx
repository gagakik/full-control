
import React from 'react';
import { Box, Container, Card, CardContent, Typography, Button, Grid } from '@mui/material';
import { AdminPanelSettings, Dashboard } from '@mui/icons-material';
import SpacesOverview from '../components/SpacesOverview';

function MainContent({ user, onAdminPanelClick }) {
  return (
    <Box sx={{ 
      width: '100%',
      minHeight: 'calc(100vh - 64px)', // Full height minus header
      backgroundColor: '#f5f5f5',
      py: 4
    }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={3}>
          {/* Additional content sections can be added here */}
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <SpacesOverview user={user} />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  სისტემის სტატუსი
                </Typography>
                <Typography variant="body2" color="success.main">
                  ● ონლაინ რეჟიმი
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ყველაფერი მუშაობს სწორად
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  მხარდაჭერა
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  თუ დახმარება გჭირდებათ, დაგვიკავშირდით:
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MainContent;
