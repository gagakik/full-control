
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Alert,
  Snackbar, Grid, Card, CardContent
} from '@mui/material';
import { Add, Edit, Delete, Home, ArrowBack } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function RentSpaces({ onBack }) {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [formData, setFormData] = useState({
    building_name: '',
    spaces_name: '',
    description: '',
    area_sqm: '',
    electricity_subscriber_number: '',
    water_subscriber_number: '',
    gas_subscriber_number: ''
  });

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/spaces/rent`);
      setSpaces(response.data);
    } catch (error) {
      setError('ქირავნობის სივრცეების ჩატვირთვა ვერ მოხერხდა');
      console.error('Error fetching rent spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const data = {
        ...formData,
        area_sqm: parseFloat(formData.area_sqm) || 0,
        electricity_subscriber_number: parseInt(formData.electricity_subscriber_number) || 0,
        water_subscriber_number: parseInt(formData.water_subscriber_number) || 0,
        gas_subscriber_number: parseInt(formData.gas_subscriber_number) || 0
      };

      if (editMode) {
        await axios.put(`${API_BASE_URL}/spaces/rent/${selectedSpace.id}`, data);
        setSuccess('ქირავნობის სივრცე წარმატებით განახლდა');
      } else {
        await axios.post(`${API_BASE_URL}/spaces/rent`, data);
        setSuccess('ქირავნობის სივრცე წარმატებით შეიქმნა');
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
      spaces_name: space.spaces_name || '',
      description: space.description || '',
      area_sqm: space.area_sqm || '',
      electricity_subscriber_number: space.electricity_subscriber_number || '',
      water_subscriber_number: space.water_subscriber_number || '',
      gas_subscriber_number: space.gas_subscriber_number || ''
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (spaceId) => {
    if (window.confirm('დარწმუნებული ხართ რომ გსურთ ამ სივრცის წაშლა?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_BASE_URL}/spaces/rent/${spaceId}`);
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
      spaces_name: '',
      description: '',
      area_sqm: '',
      electricity_subscriber_number: '',
      water_subscriber_number: '',
      gas_subscriber_number: ''
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
            <IconButton onClick={onBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h4" component="h1">
            <Home sx={{ mr: 2, verticalAlign: 'middle' }} />
            ქირავნობის სივრცეები
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
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="secondary">
                ჯამური ფართობი
              </Typography>
              <Typography variant="h4">
                {spaces.reduce((sum, space) => sum + (parseFloat(space.area_sqm) || 0), 0).toFixed(1)} მ²
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                ელექტრო აბონენტები
              </Typography>
              <Typography variant="h4">
                {spaces.filter(space => space.electricity_subscriber_number > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                წყლის აბონენტები
              </Typography>
              <Typography variant="h4">
                {spaces.filter(space => space.water_subscriber_number > 0).length}
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
                <TableCell>შენობა</TableCell>
                <TableCell>სივრცის სახელი</TableCell>
                <TableCell>ფართობი (მ²)</TableCell>
                <TableCell>ელექტრო</TableCell>
                <TableCell>წყალი</TableCell>
                <TableCell>გაზი</TableCell>
                <TableCell>შექმნის თარიღი</TableCell>
                <TableCell align="right">მოქმედებები</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spaces.map((space) => (
                <TableRow key={space.id}>
                  <TableCell>{space.id}</TableCell>
                  <TableCell>{space.building_name}</TableCell>
                  <TableCell>{space.spaces_name || '-'}</TableCell>
                  <TableCell>{space.area_sqm || 0}</TableCell>
                  <TableCell>{space.electricity_subscriber_number || 0}</TableCell>
                  <TableCell>{space.water_subscriber_number || 0}</TableCell>
                  <TableCell>{space.gas_subscriber_number || 0}</TableCell>
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="შენობის დასახელება *"
                value={formData.building_name}
                onChange={(e) => setFormData({...formData, building_name: e.target.value})}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="სივრცის სახელი"
                value={formData.spaces_name}
                onChange={(e) => setFormData({...formData, spaces_name: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="აღწერა"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ფართობი (მ²)"
                type="number"
                value={formData.area_sqm}
                onChange={(e) => setFormData({...formData, area_sqm: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ელექტროენერგიის აბონენტის ნომერი"
                type="number"
                value={formData.electricity_subscriber_number}
                onChange={(e) => setFormData({...formData, electricity_subscriber_number: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="წყლის აბონენტის ნომერი"
                type="number"
                value={formData.water_subscriber_number}
                onChange={(e) => setFormData({...formData, water_subscriber_number: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="გაზის აბონენტის ნომერი"
                type="number"
                value={formData.gas_subscriber_number}
                onChange={(e) => setFormData({...formData, gas_subscriber_number: e.target.value})}
                margin="normal"
              />
            </Grid>
          </Grid>
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

export default RentSpaces;
