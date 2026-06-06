import { CheckCircleOutline, LocalShippingOutlined } from '@mui/icons-material';
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
    <Box className="login-shell" sx={{ display: 'grid', placeItems: 'center' }}>
      <Paper elevation={0} sx={{ width: 'min(980px, 100%)', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.08fr 0.92fr' }, overflow: 'hidden', borderRadius: 3, border: '1px solid rgba(255,255,255,.45)', boxShadow: '0 28px 70px rgba(8,44,31,.18)' }}>
        <Box sx={{ p: { xs: 3.5, md: 6 }, bgcolor: '#103f2e', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ display: 'inline-grid', placeItems: 'center', width: 44, height: 44, bgcolor: '#dff4e7', color: '#176344', borderRadius: 2, mb: 4 }}>
            <LocalShippingOutlined />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-.045em' }}>VendorBridge</Typography>
          <Typography sx={{ color: '#c9ded4', maxWidth: 420, lineHeight: 1.7 }}>
            One procurement workspace for sourcing, approvals, purchase orders, invoices, and analytics.
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'grid' }, gap: 1.5, mt: 5 }}>
            {['Compare vendor quotations', 'Keep approvals moving', 'Track spend and performance'].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, color: '#e8f4ed' }}>
                <CheckCircleOutline sx={{ fontSize: 18, color: '#7dd1a1' }} />
                <Typography sx={{ fontSize: '.84rem' }}>{item}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: { xs: 3.5, md: 6 }, display: 'grid', alignContent: 'center', gap: 2 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-.025em' }}>Welcome back</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.7, fontSize: '.84rem' }}>Sign in to continue to your workspace.</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" {...register('email', { required: true })} />
          <TextField label="Password" type="password" {...register('password', { required: true })} />
          <Button type="submit" variant="contained" size="large" sx={{ mt: 0.5 }}>Sign in</Button>
          <Typography color="text.secondary" sx={{ textAlign: 'center', fontSize: '.68rem', mt: 1 }}>Demo accounts</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
            {demoUsers.map((email) => (
              <Button key={email} variant="text" size="small" onClick={() => setValue('email', email)} sx={{ fontSize: '.67rem' }}>
                {email.split('@')[0]}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
