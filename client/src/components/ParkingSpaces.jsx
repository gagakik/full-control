
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Alert,
  Snackbar, Grid, Card, CardContent
} from '@mui/material';
import { Add, Edit, Delete, LocalParking, ArrowBack } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function ParkingSpaces({ onBack }) {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [formData, setFormData] = useState({
    building_name: '',
    description: '',
    number_of_seats: ''
  });

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/spaces/parking`);
      setSpaces(response.data);
    } catch (error) {
      setError('პარკინგის სივრცეების ჩატვირთვა ვერ მოხერხდა');
      console.error('Error fetching parking spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const data = {
        ...formData,
        number_of_seats: parseInt(formData.number_of_seats) || 0
      };

      if (editMode) {
        await axios.put(`${API_BASE_URL}/spaces/parking/${selectedSpace.id}`, data);
        setSuccess('პარკინგის სივრცე წარმატებით განახლდა');
      } else {
        await axios.post(`${API_BASE_URL}/spaces/parking`, data);
        setSuccess('პარკინგის სივრცე წარმატებით შეიქმნა');
      }

      setOpenDialog(false);
      resetForm();
      fetchSpaces();
    } catch (error) {
      setError(error.response?.data?.message || 'ოპერაცია ვერ შესრულდა');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (space) => {
    setSelectedSpace(space);
    setFormData({
      building_name: space.building_name || '',
      description: space.description || '',
      number_of_seats: space.number_of_seats || ''
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (spaceId) => {
    if (window.confirm('დარწმუნებული ხართ რომ გსურთ ამ სივრცის წაშლა?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_BASE_URL}/spaces/parking/${spaceId}`);
        setSuccess('სივრცე წარმატებით წაიშალა');
        fetchSpaces();
      } catch (error) {
        setError('სივრცის წაშლა ვერ მოხერხდა');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      building_name: '',
      description: '',
      number_of_seats: ''
    });
    setEditMode(false);
    setSelectedSpace(null);
  };

  const handleAddNew = () => {
    resetForm();
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onBack && (
            <IconButton 
              onClick={onBack} 
              sx={{ mr: 2 }}
              aria-label="უკან დაბრუნება"
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h4" component="h1">
            <LocalParking sx={{ mr: 2, verticalAlign: 'middle' }} />
            პარკინგის სივრცეები
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
          disabled={loading}
        >
          ახალი სივრცე
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                სულ სივრცეები
              </Typography>
              <Typography variant="h4">
                {spaces.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="secondary">
                ჯამური ადგილები
              </Typography>
              <Typography variant="h4">
                {spaces.reduce((sum, space) => sum + (parseInt(space.number_of_seats) || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                საშუალო ადგილები
              </Typography>
              <Typography variant="h4">
                {spaces.length > 0 
                  ? Math.round(spaces.reduce((sum, space) => sum + (parseInt(space.number_of_seats) || 0), 0) / spaces.length)
                  : 0
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>შენობის დასახელება</TableCell>
                <TableCell>აღწერა</TableCell>
                <TableCell>ადგილების რაოდენობა</TableCell>
                <TableCell>შექმნის თარიღი</TableCell>
                <TableCell align="right">მოქმედებები</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spaces.map((space) => (
                <TableRow key={space.id}>
                  <TableCell>{space.id}</TableCell>
                  <TableCell>{space.building_name}</TableCell>
                  <TableCell>{space.description || '-'}</TableCell>
                  <TableCell>{space.number_of_seats || 0}</TableCell>
                  <TableCell>
                    {new Date(space.created_at).toLocaleDateString('ka-GE')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(space)}
                      disabled={loading}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(space.id)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'სივრცის რედაქტირება' : 'ახალი სივრცის დამატება'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="შენობის დასახელება *"
            value={formData.building_name}
            onChange={(e) => setFormData({...formData, building_name: e.target.value})}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="აღწერა"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="ადგილების რაოდენობა"
            type="number"
            value={formData.number_of_seats}
            onChange={(e) => setFormData({...formData, number_of_seats: e.target.value})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>გაუქმება</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.building_name}
          >
            {editMode ? 'განახლება' : 'შენახვა'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ParkingSpaces;
