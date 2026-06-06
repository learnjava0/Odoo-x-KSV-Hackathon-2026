import { LocalShipping } from '@mui/icons-material';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { setCredentials } from '../store/store.js';

const demoUsers = [
  'admin@vendorbridge.local',
  'procurement@vendorbridge.local',
  'vendor@vendorbridge.local',
  'manager@vendorbridge.local'
];

export default function LoginPage() {
  const { register, handleSubmit, setValue } = useForm({ defaultValues: { email: demoUsers[1], password: 'password' } });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      setError('');
      const { data } = await api.post('/api/auth/login', values);
      dispatch(setCredentials({ token: data.token, user: { name: data.name, email: data.email, role: data.role } }));
      navigate('/');
    } catch {
      setError('Login failed. Use one of the seeded accounts with password: password.');
    }
  };

  return (
    <Box className="app-shell" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper sx={{ width: 'min(960px, 100%)', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' }, overflow: 'hidden', borderRadius: 2 }}>
        <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: '#25636f', color: '#fff' }}>
          <LocalShipping sx={{ fontSize: 42, mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>VendorBridge</Typography>
          <Typography sx={{ color: '#d9eef1', maxWidth: 420 }}>
            Procurement workspace for RFQs, quotations, approvals, purchase orders, invoices, and analytics.
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: { xs: 3, md: 5 }, display: 'grid', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Sign in</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" {...register('email', { required: true })} />
          <TextField label="Password" type="password" {...register('password', { required: true })} />
          <Button type="submit" variant="contained" size="large">Login</Button>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {demoUsers.map((email) => (
              <Button key={email} variant="text" size="small" onClick={() => setValue('email', email)}>
                {email}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
