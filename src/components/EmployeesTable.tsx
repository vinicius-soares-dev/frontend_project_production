import { useEffect, useState, useCallback, useMemo } from 'react';
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
  IconButton,
} from '@mui/material';
import { Edit, Delete, Close } from '@mui/icons-material';

interface Employee {
  id: number;
  name: string;
  username: string;
  departments: string;
  work_schedule: string;
}

interface ServiceOrder {
  id: number;
  departments: {
    department_name: string;
    collaborators: number[];
  }[];
}

const EmployeesTable = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Busca os colaboradores
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://toprint-project.vercel.app/api/employee?page=${page + 1}&limit=${rowsPerPage}&search=${searchTerm}`,
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

  // Busca as ordens de serviço
  const fetchServiceOrders = useCallback(async () => {
    try {
      const response = await fetch('https://toprint-project.vercel.app/api/service-orders/');
      if (!response.ok) throw new Error('Erro ao buscar ordens de serviço');
      const data = await response.json();
      setServiceOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar ordens de serviço');
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchEmployees();
      await fetchServiceOrders();
    };
    fetchAllData();
  }, [fetchEmployees, fetchServiceOrders]);

  // Calcula colaboradores ocupados
  const busyCollaborators = useMemo(() => {
    const ids = new Set<number>();
    serviceOrders.forEach(order => {
      order.departments.forEach(dept => {
        dept.collaborators.forEach(id => ids.add(id));
      });
    });
    return ids;
  }, [serviceOrders]);

  const employeeDepartments = useMemo(() => {
    const departmentsMap: Record<number, string[]> = {};
    
    serviceOrders.forEach(order => {
      order.departments.forEach(dept => { // Corrigido typo 'depts' para 'departments'
        dept.collaborators.forEach(employeeId => {
          if (!departmentsMap[employeeId]) {
            departmentsMap[employeeId] = [];
          }
          if (!departmentsMap[employeeId].includes(dept.department_name)) {
            departmentsMap[employeeId].push(dept.department_name);
          }
        });
      });
    });
    
    return departmentsMap;
  }, [serviceOrders]);

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;
  
    try {
      const response = await fetch(`https://toprint-project.vercel.app/api/employee/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingEmployee.name,
          username: editingEmployee.username,
        })
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

      const response = await fetch(`https://toprint-project.vercel.app/api/employee/${id}`, {
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
                <TableCell sx={{ fontWeight: '600' }}>Username</TableCell>
                <TableCell sx={{ fontWeight: '600' }}>Setores Atuantes</TableCell> {/* Nova coluna */}
                <TableCell sx={{ fontWeight: '600' }}>Disponibilidade</TableCell>
                <TableCell sx={{ fontWeight: '600' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
              
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name || 'N/A'}</TableCell>
                    <TableCell>{employee.username || 'N/A'}</TableCell>
                    <TableCell>
                      {employeeDepartments[employee.id]?.join(', ') || 'Nenhum setor'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={busyCollaborators.has(employee.id) ? 'Indisponível' : 'Disponível'}
                        color={busyCollaborators.has(employee.id) ? 'error' : 'success'}
                        variant="outlined"
                      />
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