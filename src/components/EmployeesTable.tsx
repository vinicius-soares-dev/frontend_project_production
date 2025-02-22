import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  TextField,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Edit, Delete, Close  } from '@mui/icons-material';

interface WorkSchedule {
  [key: string]: string[];
}

interface Employee {
  id: number;
  name: string;
  username: string;
  departments: string;
  work_schedule: string;
}

interface Department {
  id: number;
  name: string;
}

// 
const formatWorkSchedule = (scheduleString: string) => {
  try {
    const schedule: WorkSchedule = JSON.parse(scheduleString);
    const daysMap: { [key: string]: string } = {
      seg: 'Segunda',
      ter: 'Terça',
      qua: 'Quarta',
      qui: 'Quinta',
      sex: 'Sexta',
      sab: 'Sábado',
      dom: 'Domingo'
    };

    return Object.entries(schedule).map(([day, times]) => (
      <Box key={day} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="textSecondary">
          {daysMap[day] || day.toUpperCase()}:
        </Typography>
        {times.map((time, index) => (
          <Chip
            key={index}
            label={time}
            color="primary"
            size="small"
            sx={{ mr: 1, mt: 0.5 }}
          />
        ))}
      </Box>
    ));
  } catch (error) {
    console.error(error);
    return (
      <Chip
        label="Formato inválido"
        color="error"
        variant="outlined"
        size="small"
      />
    );
  }
};

const EmployeesTable = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/employee?page=${page + 1}&limit=${rowsPerPage}&search=${searchTerm}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro HTTP: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Resposta não é JSON');
      }

      const responseData = await response.json();
      
      let employeesData: Employee[] = [];
      let totalCount = 0;

      if (Array.isArray(responseData)) {
        employeesData = responseData;
        totalCount = responseData.length;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        employeesData = responseData.data;
        totalCount = responseData.total || responseData.data.length;
      } else {
        throw new Error('Formato de dados inválido');
      }

      setEmployees(employeesData);
      setTotal(totalCount);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/departments');
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
      }
    };
    
    fetchEmployees();
    fetchDepartments();
  }, [fetchEmployees]);

  const handleEditClick = (employee: Employee) => {
    try {
      const parsedSchedule = JSON.parse(employee.work_schedule);
      setEditingEmployee({
        ...employee,
        departments: employee.departments || '',
        work_schedule: JSON.stringify(parsedSchedule, null, 2)
      });
    } catch {
      setEditingEmployee({
        ...employee,
        departments: employee.departments || '',
      });
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;
  
    try {
      // Validar o formato do horário
      let workSchedule;
      try {
        workSchedule = JSON.parse(editingEmployee.work_schedule);
      } catch (error) {
        console.error(error);
        throw new Error('Formato de horário inválido');
      }
  
      // Converter departamentos para array de IDs
      const departmentIds = departments
        .filter(dept => editingEmployee.departments.split(',').includes(dept.name))
        .map(dept => dept.id);
  
      const response = await fetch(`http://localhost:3001/api/employee/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingEmployee.name,
          username: editingEmployee.username,
          departments: departmentIds,
          work_schedule: workSchedule
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar');
      }
  
      fetchEmployees();
      setEditingEmployee(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm('Tem certeza que deseja excluir este colaborador?');
      if (!confirmDelete) return;

      const response = await fetch(`http://localhost:3001/api/employee/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir colaborador');
      
      setEmployees(prev => prev.filter(employee => employee.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const formatWorkScheduleForEdit = (schedule: string) => {
  //   try {
  //     const parsed = JSON.parse(schedule);
  //     return JSON.stringify(parsed, null, 2);
  //   } catch {
  //     return schedule;
  //   }
  // };

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" color="primary" fontWeight="600">
          Colaboradores Cadastrados
        </Typography>
        <TextField
          label="Pesquisar colaboradores"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: '600' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Setores</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Agenda</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name || 'N/A'}</TableCell>
                    <TableCell>
                      {(employee.departments?.split(',') || []).map((department, index) => (
                        <Chip
                          key={index}
                          label={department}
                          color="secondary"
                          size="small"
                          sx={{ mr: 1, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>{employee.username || 'N/A'}</TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 200 }}>
                        {formatWorkSchedule(employee.work_schedule)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        sx={{ mr: 1 }}
                        onClick={() => handleEditClick(employee)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(employee.id)}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Itens por página:"
            sx={{ borderTop: '1px solid rgba(224, 224, 224, 0.5)' }}
          />
        </>
      )}

      <Dialog
        open={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Editar Colaborador
            <IconButton onClick={() => setEditingEmployee(null)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {editingEmployee && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                label="Nome Completo"
                fullWidth
                value={editingEmployee.name}
                onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                sx={{ mb: 3 }}
              />

              <TextField
                label="Username"
                fullWidth
                value={editingEmployee.username}
                onChange={(e) => setEditingEmployee({...editingEmployee, username: e.target.value})}
                sx={{ mb: 3 }}
              />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Setores</InputLabel>
            <Select
              multiple
              value={(editingEmployee.departments || '').split(',').filter(id => id !== '')}
              onChange={(e) => {
                const selectedIds = e.target.value as string[];
                setEditingEmployee({
                  ...editingEmployee!,
                  departments: selectedIds.join(',')
                });
              }}
              renderValue={(selected) => selected
                .map(id => departments.find(d => d.id.toString() === id)?.name || '')
                .filter(name => name)
                .join(', ')}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

<Box sx={{ mb: 3 }}>
  <Typography variant="subtitle1" gutterBottom>
    Horário de Trabalho
  </Typography>
  {Object.entries({
    seg: 'Segunda',
    ter: 'Terça',
    qua: 'Quarta',
    qui: 'Quinta',
    sex: 'Sexta',
    sab: 'Sábado',
    dom: 'Domingo'
  }).map(([dayKey, dayName]) => {
    const schedule = JSON.parse(editingEmployee.work_schedule || '{}');
    const times = schedule[dayKey] || [''];

    return (
      <Box key={dayKey} sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>{dayName}</Typography>
        {times.map((time: string, index: number) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              value={time}
              onChange={(e) => {
                const newTimes = [...times];
                newTimes[index] = e.target.value;
                const newSchedule = { ...schedule, [dayKey]: newTimes };
                setEditingEmployee({
                  ...editingEmployee,
                  work_schedule: JSON.stringify(newSchedule)
                });
              }}
              placeholder="HH:MM-HH:MM"
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                const newTimes = times.filter((_: string, i: number) => i !== index);
                const newSchedule = { ...schedule, [dayKey]: newTimes };
                setEditingEmployee({
                  ...editingEmployee,
                  work_schedule: JSON.stringify(newSchedule)
                });
              }}
            >
              Remover
            </Button>
          </Box>
        ))}
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            const newTimes = [...times, ''];
            const newSchedule = { ...schedule, [dayKey]: newTimes };
            setEditingEmployee({
              ...editingEmployee,
              work_schedule: JSON.stringify(newSchedule)
            });
          }}
        >
          Adicionar Horário
        </Button>
      </Box>
    );
  })}
</Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateEmployee}
            startIcon={<Edit />}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EmployeesTable;