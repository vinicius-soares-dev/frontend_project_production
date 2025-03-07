import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box,
  Typography,
  TextField,
  Button,
  Link,
  useTheme,
  styled,
  Container,
  Grid,
  Alert
} from '@mui/material';
import { Factory, Security, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled(motion.div)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
}));

const LoginForm = styled(motion.div)(({ theme }) => ({
  background: theme.palette.background.paper,
  padding: theme.spacing(6),
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[10],
  width: '100%',
  maxWidth: '450px',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: theme.palette.warning.main,
  }
}));

const AdminLogin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({ 
    email: '',
    password: '' 
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if(credentials.email === 'admin1@empresa' && credentials.password === '71707170') {
      localStorage.setItem('role', 'admin');
      navigate('/administrador');
    } else {
      setError('Credenciais inválidas! Verifique os dados e tente novamente');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: theme.palette.background.default,
              zIndex: 9999
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            >
              <Factory sx={{ fontSize: 80, color: theme.palette.warning.main }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <LoginForm
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <Box textAlign="center" mb={4}>
            <Security sx={{ 
              fontSize: 50, 
              color: theme.palette.warning.main,
              filter: 'drop-shadow(0 4px 8px rgba(255, 193, 7, 0.3))'
            }} />
            <Typography variant="h3" sx={{ 
              mt: 2, 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.warning.dark}, ${theme.palette.warning.light})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Painel Administrativo
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
              Acesso restrito a usuários autorizados
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TextField
                fullWidth
                label="E-mail Administrativo"
                variant="outlined"
                margin="normal"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: 'text.disabled' }}>
                      <Login fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <TextField
                fullWidth
                label="Senha de Acesso"
                type="password"
                variant="outlined"
                margin="normal"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: 'text.disabled' }}>
                      <Security fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                fullWidth
                variant="contained"
                color="warning"
                size="large"
                type="submit"
                sx={{ 
                  mt: 3, 
                  py: 1.5,
                  fontWeight: 700,
                  letterSpacing: 1,
                  '&:hover': {
                    boxShadow: `0 8px 24px ${theme.palette.warning.main}40`
                  }
                }}
              >
                ACESSO ADMINISTRATIVO
              </Button>
            </motion.div>
          </form>
        </LoginForm>
      </LoginContainer>

      <Box component="footer" sx={{ 
        bgcolor: 'primary.dark', 
        color: 'white', 
        py: 4,
        position: 'relative',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.warning.main})`
        }
      }}>
        <Container>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="body2">
                VG TECH SOLUTIONS © {new Date().getFullYear()}
              </Typography>
            </Grid>
            <Grid item>
              <Link 
                href="https://www.vgtechsolutions.com.br" 
                color="inherit" 
                target="_blank"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    color: theme.palette.warning.main
                  }
                }}
              >
                www.vgtechsolutions.com.br
                <Box component="span" sx={{ ml: 1, display: 'flex' }}>
                  <Login fontSize="small" />
                </Box>
              </Link>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLogin;