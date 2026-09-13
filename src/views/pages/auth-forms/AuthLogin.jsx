import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Checkbox, FormControlLabel, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography, CircularProgress } from '@mui/material';

import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { useAuth } from 'hooks/useAuth';
import { login } from 'services/authService';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function AuthLogin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!email || !password) {
        setError('Email e senha são obrigatórios');
        return;
      }
      const userData = await login(email, password);
      setUser({ email: userData.email, name: userData.name, role: userData.role });
      navigate('/tickets');
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Box sx={{ mb: 2 }}><Alert severity="error">{error}</Alert></Box>}
      <form onSubmit={handleSubmit}>
        <CustomFormControl fullWidth>
          <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
          <OutlinedInput id="outlined-adornment-email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} name="email" disabled={loading} />
        </CustomFormControl>
        <CustomFormControl fullWidth>
          <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password-login"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            disabled={loading}
            endAdornment={<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end" size="large" disabled={loading}>{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment>}
            label="Password"
          />
        </CustomFormControl>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid><FormControlLabel control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" disabled={loading} />} label="Keep me logged in" /></Grid>
          <Grid><Typography variant="subtitle1" component={Link} to="#!" sx={{ textDecoration: 'none', color: 'secondary.main' }}>Forgot Password?</Typography></Grid>
        </Grid>
        <Box sx={{ mt: 2 }}><AnimateButton><Button color="secondary" fullWidth size="large" type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Sign In'}</Button></AnimateButton></Box>
      </form>
    </>
  );
}
