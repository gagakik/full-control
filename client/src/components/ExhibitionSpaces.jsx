
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Alert,
  Snackbar, Fab, Grid, Card, CardContent
} from '@mui/material';
import { Add, Edit, Delete, Museum, ArrowBack } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function ExhibitionSpaces({ onBack }) {
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
    area_sqm: '',
    ceiling_height: ''
  });

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/spaces/exhibition`);
      setSpaces(response.data);
    } catch (error) {
      setError('გამოფენის სივრცეების ჩატვირთვა ვერ მოხერხდა');
      console.error('Error fetching exhibition spaces:', error);
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
        ceiling_height: parseFloat(formData.ceiling_height) || 0
      };

      if (editMode) {
        await axios.put(`${API_BASE_URL}/spaces/exhibition/${selectedSpace.id}`, data);
        setSuccess('გამოფენის სივრცე წარმატებით განახლდა');
      } else {
        await axios.post(`${API_BASE_URL}/spaces/exhibition`, data);
        setSuccess('გამოფენის სივრცე წარმატებით შეიქმნა');
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
      area_sqm: space.area_sqm || '',
      ceiling_height: space.ceiling_height || ''
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (spaceId) => {
    if (window.confirm('დარწმუნებული ხართ რომ გსურთ ამ სივრცის წაშლა?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_BASE_URL}/spaces/exhibition/${spaceId}`);
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
      area_sqm: '',
      ceiling_height: ''
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
            <Museum sx={{ mr: 2, verticalAlign: 'middle' }} />
            გამოფენის სივრცეები
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
                ჯამური ფართობი
              </Typography>
              <Typography variant="h4">
                {spaces.reduce((sum, space) => sum + (parseFloat(space.area_sqm) || 0), 0).toFixed(1)} მ²
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
                <TableCell>ფართობი (მ²)</TableCell>
                <TableCell>ჭერის სიმაღლე (მ)</TableCell>
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
                  <TableCell>{space.area_sqm || 0}</TableCell>
                  <TableCell>{space.ceiling_height || 0}</TableCell>
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
            label="ფართობი (მ²)"
            type="number"
            value={formData.area_sqm}
            onChange={(e) => setFormData({...formData, area_sqm: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="ჭერის სიმაღლე (მ)"
            type="number"
            value={formData.ceiling_height}
            onChange={(e) => setFormData({...formData, ceiling_height: e.target.value})}
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

export default ExhibitionSpaces;
