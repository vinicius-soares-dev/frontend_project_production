import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Typography, 
  CircularProgress,
  Alert,
  Box,
  CssBaseline,
  Link
} from '@mui/material';
import { Lock, Person } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const GradientButton = styled(Button)({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  border: 0,
  borderRadius: 8,
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
  },
});

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 480,
  margin: '0 auto',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const StyledTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: '#2196F3',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&.Mui-focused fieldset': {
      borderColor: '#2196F3',
    },
  },
});

const LoginForm = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://toprint-project.vercel.app/api/auth/login', credentials);
      console.log(response)
      localStorage.setItem('username', credentials.username);
      localStorage.setItem('role', 'colab');
      navigate('/colab/dashboard');
    } catch (err) {
      console.error(err);
      setError('Credenciais inválidas ou erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 3
      }}
    >
      <CssBaseline />
      
      <AnimatedPaper>
        <Box textAlign="center" mb={4}>
          <Lock color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Bem-vindo Colaborador
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Acesse sua conta para continuar
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              background: 'rgba(255, 0, 0, 0.08)'
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Nome de Usuário"
                name="username"
                variant="outlined"
                required
                value={credentials.username}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1.5, color: '#2196F3' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Senha"
                name="password"
                type="password"
                variant="outlined"
                required
                value={credentials.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1.5, color: '#2196F3' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <GradientButton
                fullWidth
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Acessar Sistema'}
              </GradientButton>
            </Grid>

            <Grid item xs={12} textAlign="center">
              <Link 
                href="#" 
                variant="body2" 
                sx={{
                  color: '#2196F3',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Esqueceu sua senha?
              </Link>
            </Grid>
          </Grid>
        </form>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            © 2024 Sua Empresa. Todos os direitos reservados.
          </Typography>
        </Box>
      </AnimatedPaper>
    </Box>
  );
};

export default LoginForm;