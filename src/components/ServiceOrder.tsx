import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Container,
  Grid,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Box,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { AddCircleOutline, DeleteOutline, Schedule } from '@mui/icons-material';
import axios from 'axios';
import { SelectChangeEvent } from '@mui/material';

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
}

interface DepartmentForm {
  department_id: number;
  execution_start: string;
  execution_end: string;
  collaborator_ids: number[];
}

interface FormData {
  os_number: string;
  service_days: number[];
  departments: DepartmentForm[];
}

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const CreateServiceOrder = () => {
  const [formData, setFormData] = useState<FormData>({
    os_number: '',
    service_days: [],
    departments: []
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptResponse, empResponse] = await Promise.all([
          axios.get('https://toprint-project.vercel.app/api/departments'),
          axios.get('https://toprint-project.vercel.app/api/employee/all')
        ]);
        
        setDepartments(deptResponse.data);
        setEmployees(empResponse.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados necessários');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.service_days.length === 0) {
        setError('Selecione pelo menos um dia da semana');
        return;
      }

      const response = await axios.post('https://toprint-project.vercel.app/api/service-orders/', {
        ...formData,
        service_days: formData.service_days
      });
      console.log(response);
      setSuccess('OS criada com sucesso!');
      setError('');
      setFormData({
        os_number: '',
        service_days: [],
        departments: []
      });
    } catch (err) {
      console.error(err);
      setError('Erro ao criar OS. Verifique os dados e tente novamente.');
      setSuccess('');
    }
  };

  const addDepartment = () => {
    setFormData(prev => ({
      ...prev,
      departments: [
        ...prev.departments,
        { department_id: 0, execution_start: '', execution_end: '', collaborator_ids: [] }
      ]
    }));
  };

  const removeDepartment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentChange = (
    index: number,
    field: keyof DepartmentForm,
    value: string | number | number[]
  ) => {
    setFormData(prev => {
      const newDepartments = [...prev.departments];
      newDepartments[index] = {
        ...newDepartments[index],
        [field]: value
      };
      return {
        ...prev,
        departments: newDepartments
      };
    });
  };

  const handleDaysChange = (event: SelectChangeEvent<number[]>) => {
    const values = event.target.value as number[];
    setFormData(prev => ({
      ...prev,
      service_days: values
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <CircularProgress sx={{ mt: 4, mx: 'auto', display: 'block' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, p: 3, backgroundColor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h5" gutterBottom>
        Criar Nova Ordem de Serviço
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          name="os_number"
          label="Número da OS"
          value={formData.os_number}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Dias de Execução</InputLabel>
          <Select
            multiple
            value={formData.service_days}
            onChange={handleDaysChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as number[]).map((value) => (
                  <Chip
                    key={value}
                    label={daysOfWeek.find(d => d.value === value)?.label}
                  />
                ))}
              </Box>
            )}
          >
            {daysOfWeek.map((day) => (
              <MenuItem key={day.value} value={day.value}>
                {day.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {formData.departments.map((dept, index) => (
          <Box key={index} sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={dept.department_id}
                    onChange={(e) => handleDepartmentChange(index, 'department_id', Number(e.target.value))}
                    label="Departamento"
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label="Início"
                  type="time"
                  value={dept.execution_start}
                  onChange={(e) => handleDepartmentChange(index, 'execution_start', e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label="Término"
                  type="time"
                  value={dept.execution_end}
                  onChange={(e) => handleDepartmentChange(index, 'execution_end', e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Colaboradores</InputLabel>
                  <Select
                    multiple
                    value={dept.collaborator_ids}
                    onChange={(e) => handleDepartmentChange(index, 'collaborator_ids', e.target.value as number[])}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as number[]).map((value) => (
                          <Chip
                            key={value}
                            label={employees.find(e => e.id === value)?.name}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {employees.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <IconButton onClick={() => removeDepartment(index)} color="error">
                  <DeleteOutline /> Remover Departamento
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddCircleOutline />}
            onClick={addDepartment}
          >
            Adicionar Departamento
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<Schedule />}
          >
            Criar Ordem de Serviço
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CreateServiceOrder;