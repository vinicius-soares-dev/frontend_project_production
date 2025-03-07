import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { CalendarToday, Assignment, Schedule } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

interface Department {
  id: number;
  department_id: number;
  execution_start: string;
  execution_end: string;
  department_name: string;
  collaborators: number[];
}

interface ServiceOrder {
  id: number;
  os_number: string;
  created_at: string;
  service_days: number[];
  departments: Department[];
}

interface Employee {
  id: number;
  name: string;
  username: string;
  departments: string;
  // Adicione outros campos conforme necessário da sua API
}

const DashboardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 800,
  margin: '2rem auto',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const ServiceDayChip = styled(Chip)({
  margin: '0.3rem',
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
});

const ColabDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const mapDayNumberToName = (dayNumber: number): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayNumber] || 'Dia inválido';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = localStorage.getItem('username');
        if (!username) {
          navigate('/login');
          return;
        }

        const employeeResponse = await axios.get<Employee>(
          `https://toprint-project.vercel.app/api/employees/${username}`
        );

        if (!employeeResponse.data) {
          throw new Error('Colaborador não encontrado');
        }

        const employeeData = employeeResponse.data;
        setEmployee(employeeData);

        const ordersResponse = await axios.get<ServiceOrder[]>('https://toprint-project.vercel.app/api/service-orders/');
        const allOrders = ordersResponse.data;

        const userOrders = allOrders.filter(order => 
          order.departments.some(dept => 
            dept.collaborators.includes(employeeData.id)
          )
        );

        setServiceOrders(userOrders);

      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados do dashboard');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Adicione esta verificação antes de renderizar
  if (!employee) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={3} mx={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <DashboardPaper>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          <Assignment sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
          Dashboard do Colaborador
        </Typography>
        
        <Typography variant="h6" color="textSecondary">
          {employee?.name} ({employee?.username})
        </Typography>
      </Box>

      {serviceOrders.length === 0 ? (
        <Alert severity="info" sx={{ my: 3 }}>
          Nenhuma ordem de serviço atribuída a você no momento
        </Alert>
      ) : (
        <List>
          {serviceOrders.map((order) => (
            <React.Fragment key={order.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                        OS: {order.os_number}
                      </Typography>
                      <Chip
                        icon={<CalendarToday />}
                        label={new Date(order.created_at).toLocaleDateString()}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      {order.departments.map((dept: Department) => (
                        dept.collaborators.includes(employee.id) && (
                          <Box key={dept.id} mt={2}>
                            <Typography variant="subtitle1" gutterBottom>
                              <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                              {dept.department_name} - {dept.execution_start} às {dept.execution_end}
                            </Typography>
                            
                            <Box display="flex" flexWrap="wrap">
                              {order.service_days.map((day: number) => (
                                <ServiceDayChip
                                  key={day}
                                  label={mapDayNumberToName(day)}
                                />
                              ))}
                            </Box>
                        </Box>
    )
  ))}
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </DashboardPaper>
  );
};

export default ColabDashboard;