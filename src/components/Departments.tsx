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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Edit,  Close, Delete } from '@mui/icons-material';

interface Department {
  id: number;
  name: string;
}



const DepartmentsTable = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://toprint-project.vercel.app/api/departments?page=${page + 1}&limit=${rowsPerPage}&search=${searchTerm}`,
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
      
      let departmentsData: Department[] = [];
      let totalCount = 0;

      if (Array.isArray(responseData)) {
        departmentsData = responseData;
        totalCount = responseData.length;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        departmentsData = responseData.data;
        totalCount = responseData.total || responseData.data.length;
      } else {
        throw new Error('Formato de dados inválido');
      }

      setDepartments(departmentsData);
      setTotal(totalCount);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;

    try {
      const response = await fetch(`https://toprint-project.vercel.app/api/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDepartment),
      });

      if (!response.ok) throw new Error('Erro ao atualizar');
      
      fetchDepartments();
      setEditingDepartment(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm('Tem certeza que deseja excluir este departamento?');
      if (!confirmDelete) return;
  
      const response = await fetch(`https://toprint-project.vercel.app/api/departments/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir departamento');
      }
      
      // Atualiza o estado local
      setDepartments(prev => prev.filter(department => department.id !== id));
      setTotal(prev => prev - 1);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir';
      setError(errorMessage);
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
          Setores Cadastrados
        </Typography>
        <TextField
          label="Pesquisar setores"
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
                  <TableCell sx={{ fontWeight: '600' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.id}</TableCell>
                    <TableCell>{department.name}</TableCell>

                    <TableCell>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        sx={{ mr: 1 }}
                        onClick={() => handleEditClick(department)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(department.id)}
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
        open={!!editingDepartment}
        onClose={() => setEditingDepartment(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Editar Departamento
            <IconButton onClick={() => setEditingDepartment(null)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {editingDepartment && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                label="Nome do Departamento"
                fullWidth
                value={editingDepartment.name}
                onChange={(e) => setEditingDepartment({
                  ...editingDepartment,
                  name: e.target.value
                })}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateDepartment}
            startIcon={<Edit />}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DepartmentsTable;