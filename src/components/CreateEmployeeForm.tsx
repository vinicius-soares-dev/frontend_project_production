import React, { useState  } from 'react';
import { 
  TextField,
  Button,
  Paper,
  Grid,
  Typography,

  CircularProgress,
  Alert,
  
} from '@mui/material';
import { Save } from '@mui/icons-material';
import axios from 'axios';


const CreateEmployeeForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    departments: [] as number[],
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        password: '71707170', // Senha padrão extendida para 8 caracteres
      };

      const response = await axios.post('https://toprint-project.vercel.app/api/employee', payload);
      
      if (response.status === 201) {
        setSuccess(true);
        setFormData({
          name: '',
          username: '',
          departments: [],
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h6" gutterBottom color="primary">
        Cadastrar Novo Colaborador
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Colaborador cadastrado com sucesso!</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nome Completo"
              variant="outlined"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Nome de Usuário"
              variant="outlined"
              fullWidth
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </Grid>


          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={<Save />}
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Cadastrar Colaborador'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateEmployeeForm;