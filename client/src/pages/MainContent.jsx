
import React from 'react';
import { Box, Container, Card, CardContent, Typography, Button, Grid } from '@mui/material';
import { AdminPanelSettings, Dashboard } from '@mui/icons-material';

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
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Dashboard sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                  მთავარი გვერდი
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                  მოგესალმებით, {user?.username}!
                </Typography>
                
                {user?.role === 'admin' && (
                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AdminPanelSettings />}
                      onClick={onAdminPanelClick}
                      sx={{
                        px: 4,
                        py: 2,
                        fontSize: '1.2rem',
                        borderRadius: 2,
                        boxShadow: 3,
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ადმინისტრაციული პანელი
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Additional content sections can be added here */}
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  სისტემის ინფორმაცია
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  მომხმარებლის როლი: <strong>{user?.role}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  რეგისტრაციის თარიღი: <strong>{user?.created_at ? new Date(user.created_at).toLocaleDateString('ka-GE') : 'N/A'}</strong>
                </Typography>
              </CardContent>
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
        </Grid>
      </Container>
    </Box>
  );
}

export default MainContent;
