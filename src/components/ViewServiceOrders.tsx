import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Typography,
  Collapse,
  Box,
  Modal,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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
}

interface ApiDepartment {
  id: number;
  name: string;
}

interface EditOSForm {
  os_number: string;
  service_days: number[];
  departments: Array<{
    id?: number;
    department_id: number;
    execution_start: string;
    execution_end: string;
    collaborators: number[];
  }>;
}

const mapDayNumberToName = (dayNumber: number): string => {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[dayNumber] || 'Dia inválido';
};

const ServiceOrderList: React.FC = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditOSForm>({
    os_number: '',
    service_days: [],
    departments: [],
  });
  const [allDepartments, setAllDepartments] = useState<ApiDepartment[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [osRes, deptRes, empRes] = await Promise.all([
          axios.get('https://toprint-project.vercel.app/api/service-orders/'),
          axios.get('https://toprint-project.vercel.app/api/departments'),
          axios.get('https://toprint-project.vercel.app/api/employee/all')
        ]);

        setServiceOrders(osRes.data);
        setAllDepartments(deptRes.data);
        setAllEmployees(empRes.data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://toprint-project.vercel.app/api/service-orders/${id}`);
      setServiceOrders(serviceOrders.filter((order) => order.id !== id));
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir a ordem de serviço.');
    }
  };

  const handleEditClick = (order: ServiceOrder) => {
    setEditingOrder(order);
    setEditFormData({
      os_number: order.os_number,
      service_days: order.service_days,
      departments: order.departments.map(dept => ({
        id: dept.id,
        department_id: dept.department_id,
        execution_start: dept.execution_start.split(':').slice(0, 2).join(':'), // Formata hora
        execution_end: dept.execution_end.split(':').slice(0, 2).join(':'),
        collaborators: dept.collaborators
      }))
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingOrder) return;
  
    try {
      // Corrigir o payload para corresponder exatamente à estrutura esperada
      const payload = {
        os_number: editFormData.os_number,
        service_days: editFormData.service_days,
        departments: editFormData.departments.map(dept => ({
  
          department_id: dept.department_id,
          execution_start: dept.execution_start,
          execution_end: dept.execution_end,
          collaborator_ids: dept.collaborators // Renomear para o campo correto
          
        }))
      };
  
      // DEBUG: Verificar o payload final
      console.log('Payload corrigido:', JSON.stringify(payload, null, 2));
  
      const response = await axios.put(
        `http://localhost:21151/api/service-orders/${editingOrder.id}`,
        payload
      );
  
      setServiceOrders(serviceOrders.map(order => 
        order.id === editingOrder.id ? response.data : order
      ));
      setEditModalOpen(false);
    } catch (err) {
      console.error('Erro detalhado:', {
        request: err
      });
      setError('Erro na atualização');
    }
  };

  const handleFormChange = <K extends keyof EditOSForm>(
    field: K,
    value: EditOSForm[K]
  ) => {
    setEditFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const EditModal = () => (
    <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Editar Ordem de Serviço</DialogTitle>
      <DialogContent>
        <TextField
          label="Número da OS"
          value={editFormData.os_number}
          onChange={(e) => handleFormChange('os_number', e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Dias de Serviço
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={editFormData.service_days.includes(day)}
                  onChange={(e) => {
                    const newDays = e.target.checked
                      ? [...editFormData.service_days, day]
                      : editFormData.service_days.filter(d => d !== day);
                    handleFormChange('service_days', newDays);
                  }}
                />
              }
              label={mapDayNumberToName(day)}
            />
          ))}
        </Box>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          Departamentos
        </Typography>
        {editFormData.departments.map((dept, index) => (
          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Select
              value={dept.department_id}
              onChange={(e) => {
                const newDepts = [...editFormData.departments];
                newDepts[index].department_id = Number(e.target.value);
                handleFormChange('departments', newDepts);
              }}
              fullWidth
              margin="dense"
              variant="outlined"
            >
              {allDepartments.map(d => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Início"
                type="time"
                value={dept.execution_start}
                onChange={(e) => {
                  const newDepts = [...editFormData.departments];
                  newDepts[index].execution_start = e.target.value;
                  handleFormChange('departments', newDepts);
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                variant="outlined"
                inputProps={{ step: 300 }} // Intervalo de 5 minutos
              />

              <TextField
                label="Fim"
                type="time"
                value={dept.execution_end}
                onChange={(e) => {
                  const newDepts = [...editFormData.departments];
                  newDepts[index].execution_end = e.target.value;
                  handleFormChange('departments', newDepts);
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                variant="outlined"
                inputProps={{ step: 300 }}
              />
            </Box>

            <Select
              multiple
              value={dept.collaborators}
              onChange={(e) => {
                const newDepts = [...editFormData.departments];
                newDepts[index].collaborators = e.target.value as number[];
                handleFormChange('departments', newDepts);
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as number[]).map(id => 
                    allEmployees.find(e => e.id === id)?.name || id
                  ).join(', ')}
                </Box>
              )}
              fullWidth
              sx={{ mt: 2 }}
              variant="outlined"
            >
              {allEmployees.map(emp => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditModalOpen(false)} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleUpdate} color="primary" variant="contained">
          Salvar Alterações
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Gerenciamento de Ordens de Serviço
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Número OS</TableCell>
              <TableCell>Criação</TableCell>
              <TableCell>Dias</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {serviceOrders.map((order) => (
              <React.Fragment key={order.id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => setExpandedRows(prev =>
                        prev.includes(order.id) 
                          ? prev.filter(id => id !== order.id) 
                          : [...prev, order.id]
                      )}
                    >
                      {expandedRows.includes(order.id) ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{order.os_number}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {order.service_days.map(mapDayNumberToName).join(', ')}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(order.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleEditClick(order)} 
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>

                {expandedRows.includes(order.id) && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Collapse in={true}>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Detalhes dos Departamentos
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Departamento</TableCell>
                                <TableCell>Início</TableCell>
                                <TableCell>Fim</TableCell>
                                <TableCell>Colaboradores</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.departments?.map((department) => (
                                <TableRow key={department.id}>
                                  <TableCell>
                                    {allDepartments.find(d => d.id === department.department_id)?.name || 'Departamento não encontrado'}
                                  </TableCell>
                                  <TableCell>{department.execution_start || '--:--'}</TableCell>
                                  <TableCell>{department.execution_end || '--:--'}</TableCell>
                                  <TableCell>
                                    {department.collaborators?.map(id => (
                                      <Button
                                        key={id}
                                        onClick={() => {
                                          const employee = allEmployees.find(e => e.id === id);
                                          if (employee) {
                                            setSelectedEmployee(employee);
                                            setModalOpen(true);
                                          }
                                        }}
                                      >
                                        {allEmployees.find(e => e.id === id)?.name || `ID ${id}`}
                                      </Button>
                                    )) || 'Nenhum colaborador'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 4, 
          borderRadius: 2, 
          maxWidth: 500,
          width: '90%'
        }}>
          {selectedEmployee && (
            <>
              <Typography variant="h6" gutterBottom>
                Detalhes do Colaborador
              </Typography>
              <Typography><strong>Nome:</strong> {selectedEmployee.name}</Typography>
              <Typography><strong>ID:</strong> {selectedEmployee.id}</Typography>
              <Typography><strong>Username:</strong> {selectedEmployee.username}</Typography>
              <Button 
                onClick={() => setModalOpen(false)} 
                sx={{ mt: 2 }}
                variant="contained"
              >
                Fechar
              </Button>
            </>
          )}
        </Box>
      </Modal>

      <EditModal />
    </Container>
  );
};

export default ServiceOrderList;