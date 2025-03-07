// CreateDepartmentForm.tsx
import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Typography, 
  IconButton,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import { AddCircleOutline, Close } from '@mui/icons-material';
import axios, { isAxiosError } from 'axios';
import { useTheme } from '@mui/material/styles';

interface DepartmentFormData {
  name: string;

}

const CreateDepartmentForm = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post('https://toprint-project.vercel.app/api/departments', {
        name: formData.name,
      });

      if (response.status === 201) {
        setSuccess(true);
        setFormData({ name: ''  });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      // Verificar se é um erro do Axios
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Ocorreu um erro ao criar o departamento');
      } 
      // Verificar se é um Error genérico
      else if (err instanceof Error) {
        setError(err.message);
      }
      // Caso seja outro tipo de erro
      else {
        setError('Ocorreu um erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{
      p: 4,
      borderRadius: 4,
      background: theme.palette.background.paper,
      boxShadow: theme.shadows[3],
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <Typography variant="h5" component="div" sx={{
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        color: theme.palette.primary.main
      }}>
        <AddCircleOutline fontSize="large" />
        Novo Departamento
      </Typography>

      <Collapse in={!!error}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setError(null)}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Collapse>

      <Collapse in={success}>
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess(false)}
        >
          Departamento criado com sucesso!
        </Alert>
      </Collapse>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome do Departamento"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              required
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>


          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Cadastrar Departamento'
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateDepartmentForm;