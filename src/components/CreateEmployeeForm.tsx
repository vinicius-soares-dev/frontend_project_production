// CreateEmployeeForm.tsx
import React from 'react';
import {
  TextField,
  Button,
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save } from '@mui/icons-material';

const CreateEmployeeForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de envio do formulário
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Cadastrar Novo Colaborador
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nome Completo"
              variant="outlined"
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="E-mail"
              type="email"
              variant="outlined"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Setor</InputLabel>
              <Select label="Setor" required>
                <MenuItem value="ti">TI</MenuItem>
                <MenuItem value="rh">RH</MenuItem>
                {/* Adicionar mais setores */}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Cargo"
              variant="outlined"
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={<Save />}
              size="large"
            >
              Cadastrar Colaborador
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateEmployeeForm;