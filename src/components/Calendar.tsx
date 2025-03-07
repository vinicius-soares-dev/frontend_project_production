import { useEffect, useState } from 'react';
import { 
  Box, Typography, Grid, 
  FormControl, InputLabel, Select, MenuItem, Modal,
  Card, CardContent, Avatar, List, ListItem, ListItemText,
  Chip, Skeleton, useTheme, IconButton, Button
} from '@mui/material';
import { Palette, FilterList, Close, Groups } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { startOfWeek, addDays, format } from 'date-fns';

interface Employee {
  id: number;
  name: string;
  departments: string[];
  work_schedule: Record<string, string[]>;
  avatar?: string;
}

interface ApiEmployee {
  id: number;
  name: string;
  departments: string[];
  work_schedule: string;
  username?: string;
  email?: string;
  phone?: string;
}

interface ApiDepartment {
  id: number;
  name: string;
}

interface ServiceOrder {
  id: number;
  os_number: string;
  service_days: number[]; // Dias da semana (0 = Domingo, 6 = Sábado)
  departments: Array<{
    id: number;
    department_id: number;
    execution_start: string;
    execution_end: string;
    collaborators: number[]; // IDs dos colaboradores
  }>;
}

const daysOfWeek = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']; // Domingo = 0, Sábado = 6
const departmentColors: Record<string, string> = {
  'Vendas': '#4caf50',
  'TI': '#2196f3',
  'RH': '#ff9800',
  'Marketing': '#e91e63',
  'Produção': '#9c27b0'
};

const AnimatedCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6]
  }
}));

const WeeklySchedule = () => {
  const theme = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  const getCollaboratorName = (id: number): string => {
    const collaborator = employees.find(emp => emp.id === id);
    return collaborator ? collaborator.name : 'Desconhecido';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes, osRes] = await Promise.all([
          fetch('https://toprint-project.vercel.app/api/employee/all'),
          fetch('https://toprint-project.vercel.app/api/departments'),
          fetch('https://toprint-project.vercel.app/api/service-orders')
        ]);
  
        const empData: ApiEmployee[] = await empRes.json();
        const deptData: ApiDepartment[] = await deptRes.json();
        const osData: ServiceOrder[] = await osRes.json();
  
        console.log('Employees:', empData);
        console.log('Departments:', deptData);
        console.log('Service Orders:', osData);
  
        // Converter work_schedule com segurança
        const formattedEmployees: Employee[] = empData.map((emp) => {
          try {
            return {
              ...emp,
              work_schedule: typeof emp.work_schedule === 'string' 
                ? JSON.parse(emp.work_schedule)
                : emp.work_schedule || {},
              avatar: 'data:image/jpeg;base64,...'
            };
          } catch (error) {
            console.error('Erro ao parsear work_schedule:', error);
            return {
              ...emp,
              work_schedule: {},
              avatar: 'https://cdn-icons-png.flaticon.com/512/6858/6858504.png'
            };
          }
        });
  
        setEmployees(formattedEmployees);
        setDepartments(deptData);
        setServiceOrders(osData);
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const OrderDetailsModal = () => (
    <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
      <Box sx={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 600 },
        bgcolor: 'background.paper',
        borderRadius: 4,
        p: 3,
        outline: 'none'
      }}>
        {selectedOrder && (
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" fontWeight={600}>
                  Detalhes da OS: {selectedOrder.os_number}
                </Typography>
                <IconButton onClick={() => setSelectedOrder(null)}>
                  <Close />
                </IconButton>
              </Box>
  
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="textSecondary">
                    Dias de Execução:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {selectedOrder.service_days.map(day => (
                      <Chip
                        key={day}
                        label={formatDay(daysOfWeek[day])}
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
  
                {selectedOrder.departments.map((dept, index) => (
                  <Grid item xs={12} key={index}>
                    <Typography variant="subtitle1" color="textSecondary">
                      Departamento: {departments.find(d => d.id === dept.department_id)?.name}
                    </Typography>
                    <Typography variant="body2">
                      Horário: {dept.execution_start} - {dept.execution_end}
                    </Typography>
                    <Typography variant="body2">
                      Colaboradores:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {dept.collaborators.map(collabId => (
                        <Chip
                          key={collabId}
                          label={getCollaboratorName(collabId)}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Grid>
                ))}
              </Grid>
  
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.print()}
                >
                  Imprimir
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedOrder(null)}
                >
                  Fechar
                </Button>
              </Box>
            </CardContent>
          </AnimatedCard>
        )}
      </Box>
    </Modal>
  );

  const EmployeeModal = () => (
    <Modal open={!!selectedEmployee} onClose={() => setSelectedEmployee(null)}>
      <Box sx={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 500 },
        bgcolor: 'background.paper',
        borderRadius: 4,
        p: 3,
        outline: 'none'
      }}>
        {selectedEmployee && (
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={selectedEmployee.avatar} 
                    sx={{ width: 64, height: 64, boxShadow: theme.shadows[2] }}
                  />
                  <Typography variant="h6">{selectedEmployee.name}</Typography>
                </Box>
                <IconButton onClick={() => setSelectedEmployee(null)}>
                  <Close />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    DEPARTAMENTOS
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedEmployee.departments.map(dept => (
                      <Chip
                        key={dept}
                        label={dept}
                        size="small"
                        sx={{ 
                          backgroundColor: departmentColors[dept] || '#ccc',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    HORÁRIOS
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {Object.entries(selectedEmployee.work_schedule).map(([day, times]) => (
                      <ListItem key={day} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`${formatDay(day)}:`}
                          secondary={times.join(', ')}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </AnimatedCard>
        )}
      </Box>
    </Modal>
  );

  const formatDay = (dayKey: string): string => {
    const dayMap: Record<string, string> = {
      seg: 'Segunda-feira',
      ter: 'Terça-feira',
      qua: 'Quarta-feira',
      qui: 'Quinta-feira',
      sex: 'Sexta-feira',
      sab: 'Sábado',
      dom: 'Domingo'
    };
    return dayMap[dayKey] || dayKey;
  };

  const DayColumn = ({ dayKey }: { dayKey: string }) => {
    const dayIndex = daysOfWeek.indexOf(dayKey); // Converte o dia para índice (0-6)
  
    const filteredOrders = serviceOrders.filter(order => {
      const hasDay = order.service_days.includes(dayIndex);
      const hasDepartment = selectedDepartment 
        ? order.departments.some(dept => dept.department_id === selectedDepartment)
        : true;
      
      return hasDay && hasDepartment;
    });

    return (
      <AnimatedCard sx={{ 
        height: '100%',
        background: 'linear-gradient(145deg, #f5f7fa 0%, #f0f4f8 100%)',
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          p: 2,
          background: theme.palette.primary.main,
          color: 'white',
          textAlign: 'center'
        }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {formatDay(dayKey)}
          </Typography>
        </Box>
  
        <Box sx={{ 
          p: { xs: 1, sm: 2 },
          height: { xs: 'auto', md: 'calc(100% - 64px)' },
          minHeight: 300,
          overflowY: 'auto'
        }}>
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton 
                key={i} 
                variant="rectangular" 
                height={80} 
                sx={{ mb: 2, borderRadius: 2 }} 
              />
            ))
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <Card 
                key={order.id} 
                sx={{ mb: 2, cursor: 'pointer' }} 
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    OS: {order.os_number}
                  </Typography>
                  {order.departments?.map(dept => (
                    <Box key={dept.id} sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        {departments.find(d => d.id === dept.department_id)?.name || 'Departamento Desconhecido'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {dept.execution_start} - {dept.execution_end}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {dept.collaborators?.map(collabId => (
                          <Chip
                            key={collabId}
                            label={getCollaboratorName(collabId)}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center',
              p: 3
            }}>
              <Groups sx={{ fontSize: 60, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="body2" color="textSecondary">
                Nenhuma ordem de serviço
              </Typography>
            </Box>
          )}
        </Box>
      </AnimatedCard>
    );
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 3 },
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #f5f7fa 0%, #e6e9ef 100%)',
      overflowX: 'hidden'
    }}>
      <Box sx={{ 
        maxWidth: { xs: '100%', lg: 1600 },
        margin: '0 auto',
        mb: 4,
        px: { xs: 1, sm: 3 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 3, 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: theme.shadows[2]
        }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={800} sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Palette fontSize="large" />
              Escala Semanal
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Visualize os colaboradores escalados por dia da semana
            </Typography>
          </Box>

          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList fontSize="small" />
                Filtrar por Setor
              </Box>
            </InputLabel>
            <Select
              value={selectedDepartment || ''}
              onChange={(e) => setSelectedDepartment(Number(e.target.value))}
              label="Filtrar por Setor"
              sx={{ borderRadius: 4 }}
            >
              <MenuItem value="">Todos os Setores</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept.id} value={dept.id}>
                  <Chip 
                    label={dept.name} 
                    size="small" 
                    sx={{ 
                      backgroundColor: departmentColors[dept.name] || '#eee',
                      color: departmentColors[dept.name] ? 'white' : 'inherit'
                    }} 
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={{ xs: 1, sm: 3 }}> 
          {daysOfWeek.map((dayKey, index) => {
            const baseDate = startOfWeek(new Date(), { weekStartsOn: 0 }); // Segunda como início
            const currentDate = addDays(baseDate, index);
            
            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                xl={2} 
                key={dayKey}
                sx={{ height: { xs: 'auto', md: 500 }, minHeight: 400 }}
              >
                <Box sx={{ mb: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }}}>
                    {format(currentDate, 'dd/MM')}
                  </Typography>
                </Box>
                <DayColumn dayKey={dayKey} />
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <OrderDetailsModal />
      <EmployeeModal />
    </Box>
  );
};

export default WeeklySchedule;