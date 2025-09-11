
import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Paper, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Alert,
  IconButton, Menu, MenuItem, Chip, Card, CardContent, Grid,
  FormControl, InputLabel, Select, Snackbar
} from '@mui/material';
import {
  AccountCircle, Add, Edit, Delete, ExitToApp, AdminPanelSettings,
  Person, Dashboard
} from '@mui/icons-material';
import axios from 'axios';
import MainContent from './pages/MainContent';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Auth form states
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  
  // Navigation state
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'admin'
  
  // User management states
  const [editDialog, setEditDialog] = useState(false);
  const [editUser, setEditUser] = useState({ id: '', username: '', role: '' });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      setError('მომხმარებლების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const endpoint = isLogin ? 'login' : 'register';
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, authForm);
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      setSuccess(isLogin ? 'წარმატებით შეხვედით' : 'რეგისტრაცია წარმატებულია');
      
    } catch (error) {
      setError(error.response?.data?.message || 'ავტორიზაციის შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setUsers([]);
    setAnchorEl(null);
  };

  const handleEditUser = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/users/${editUser.id}`, {
        username: editUser.username,
        role: editUser.role
      });
      
      setSuccess('მომხმარებელი განახლდა');
      setEditDialog(false);
      fetchUsers();
    } catch (error) {
      setError('მომხმარებლის განახლება ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/users/${deleteUserId}`);
      setSuccess('მომხმარებელი წაიშალა');
      setDeleteDialog(false);
      fetchUsers();
    } catch (error) {
      setError('მომხმარებლის წაშლა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user) => {
    setEditUser({ id: user.id, username: user.username, role: user.role });
    setEditDialog(true);
  };

  const openDeleteDialog = (userId) => {
    setDeleteUserId(userId);
    setDeleteDialog(true);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            <AdminPanelSettings sx={{ fontSize: 40, mr: 1 }} />
            Admin Panel
          </Typography>
          
          <Box component="form" onSubmit={handleAuth} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="მომხმარებლის სახელი"
              value={authForm.username}
              onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="პაროლი"
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              margin="normal"
              required
            />
            
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {isLogin ? 'შესვლა' : 'რეგისტრაცია'}
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setAuthForm({ username: '', password: '' });
              }}
            >
              {isLogin ? 'რეგისტრაცია' : 'შესვლა'}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, width: '100%', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ width: '100%' }}>
        <Toolbar sx={{ width: '100%', maxWidth: 'none', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setCurrentView('main')}>
            <Dashboard sx={{ mr: 2 }} />
            <Typography variant="h6" component="div">
              სისტემა
            </Typography>
          </Box>
          
          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Header buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Admin Panel button - only for admins */}
            {user?.role === 'admin' && (
              <Button
                color="inherit"
                startIcon={<AdminPanelSettings />}
                onClick={() => setCurrentView('admin')}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                ადმინ პანელი
              </Button>
            )}
            
            {/* Profile menu */}
            <IconButton
              sx={{ marginRight: 3, display: { xs: 'none', sm: 'flex' } }}
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2">{user?.username}</Typography>
                  <Chip
                    label={user?.role}
                    color={user?.role === 'admin' ? 'secondary' : 'default'}
                    size="small"
                  />
                </Box>
              </MenuItem>
              {user?.role === 'admin' && (
                <MenuItem onClick={() => { setCurrentView('admin'); setAnchorEl(null); }} sx={{ display: { xs: 'flex', sm: 'none' } }}>
                  <AdminPanelSettings sx={{ mr: 1 }} />
                  ადმინ პანელი
                </MenuItem>
              )}
              <MenuItem onClick={() => { setCurrentView('main'); setAnchorEl(null); }}>
                <Dashboard sx={{ mr: 1 }} />
                მთავარი გვერდი
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                გამოსვლა
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{ width: '100%', flex: 1 }}>
        {currentView === 'main' ? (
          <MainContent 
            user={user} 
            onAdminPanelClick={() => setCurrentView('admin')}
          />
        ) : (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      მთლიანი მომხმარებლები
                    </Typography>
                    <Typography variant="h4">
                      {users.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="secondary">
                      ადმინისტრატორები
                    </Typography>
                    <Typography variant="h4">
                      {users.filter(u => u.role === 'admin').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary">
                      მომხმარებლები
                    </Typography>
                    <Typography variant="h4">
                      {users.filter(u => u.role === 'user').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  მომხმარებლების მენეჯმენტი
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>მომხმარებლის სახელი</TableCell>
                      <TableCell>როლი</TableCell>
                      <TableCell>შექმნის თარიღი</TableCell>
                      <TableCell align="right">მოქმედებები</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Person sx={{ mr: 1, color: 'text.secondary' }} />
                            {user.username}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={user.role === 'admin' ? 'secondary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('ka-GE')}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => openEditDialog(user)}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(user.id)}
                            size="small"
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
          </Container>
        )}
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>მომხმარებლის რედაქტირება</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="მომხმარებლის სახელი"
            value={editUser.username}
            onChange={(e) => setEditUser({...editUser, username: e.target.value})}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>როლი</InputLabel>
            <Select
              value={editUser.role}
              onChange={(e) => setEditUser({...editUser, role: e.target.value})}
              label="როლი"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>გაუქმება</Button>
          <Button onClick={handleEditUser} variant="contained" disabled={loading}>
            შენახვა
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>მომხმარებლის წაშლა</DialogTitle>
        <DialogContent>
          <Typography>
            დარწმუნებული ხართ რომ გსურთ ამ მომხმარებლის წაშლა?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>გაუქმება</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained" disabled={loading}>
            წაშლა
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
