import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
  useMediaQuery,
  Avatar,
  Divider,
  Box,
  Paper,
  Button,
} from '@mui/material';
import {
  People,
  Business,
  Add,
  Menu,
  ChevronLeft,
  AccountCircle,
  CalendarMonth,
  HomeWork
} from '@mui/icons-material';
import EmployeesTable from '../components/EmployeesTable';
import CreateEmployeeForm from '../components/CreateEmployeeForm';
import DepartmentsTable from '../components/Departments';
import WeeklySchedule from '../components/Calendar';
import CreateDepartmentForm from '../components/CreateDepartment';
import ProductionOrdersTable from '../components/ServiceOrder';
import ServiceOrderList from '../components/ViewServiceOrders';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#4fc3f7',
      light: '#8bf6ff',
      dark: '#0093c4',
    },
    background: {
      default: '#f8f9fe',
    },
  },
  typography: {
    fontFamily: [
      '"Poppins"',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontWeight: 600,
      letterSpacing: 0.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          padding: '12px 16px',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
  },
});

const AdminDashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('employees');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if(localStorage.getItem('role') !== 'admin') {
      navigate('/');
    } else {
      setRoleChecked(true);
    }
  }, [navigate]);

  if(!roleChecked) return null;

  const menuItems = [
    {
      text: 'Colaboradores',
      icon: <People />,
      value: 'employees',
    },
    {
      text: 'Setores',
      icon: <Business />,
      value: 'departments',
    },
    {
      text: 'Novo Colaborador',
      icon: <Add />,
      value: 'createEmployee',
    },
    {
      text: 'Novo Setor',
      icon: <Add />,
      value: 'createDepartment',
    },
    {
      text: 'Calendário',
      icon: <CalendarMonth />,
      value: 'calendarMonth',
    },
    {
      text: 'Ordem de Serviço',
      icon: <HomeWork />,
      value: 'orderService'
    },
    {
      text: 'Nova OS',
      icon: <Add />,
      value:'os'
    }
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'employees':
        return <EmployeesTable />;
      case 'createEmployee':
        return <CreateEmployeeForm />;
      case 'departments':
        return <DepartmentsTable />;
      case 'calendarMonth':
        return <WeeklySchedule />;
      case 'createDepartment':
        return <CreateDepartmentForm />;
      case 'orderService':
        return <ServiceOrderList />;
      case 'os':
        return <ProductionOrdersTable />;
      default:
        return <EmployeesTable />;
    }
  };

  const logout = () => {
    localStorage.removeItem('role');
    setTimeout(() => {
      window.location.href = '/'
    }, 1000);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between'}}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2 }}
            >
              {drawerOpen ? <ChevronLeft /> : <Menu />}
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Painel Administrativo
            </Typography>
            <Button 
              onClick={() => logout()}
              sx={{ padding: '1rem, 2rem', color: 'fff'}}
            >
              Sair
            </Button>
          </Toolbar>
        </AppBar>

        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              background: theme.palette.background.default,
              borderRight: 'none',
              boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: 'auto',
                bgcolor: theme.palette.secondary.main,
                mb: 2,
              }}
            >
              <AccountCircle fontSize="large" />
            </Avatar>
            <Typography variant="subtitle1" fontWeight="600">
              Administrador
            </Typography>
            <Typography variant="body2" color="textSecondary">
              admin@empresa.com
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />

          <List sx={{ px: 2 }}>
            {menuItems.map((item) => (
              <ListItem
                component="button"
                key={item.value}
                onClick={() => {
                  setSelectedMenu(item.value);
                  if (isMobile) setDrawerOpen(false);
                }}
                sx={{
                  bgcolor: selectedMenu === item.value ? 
                    theme.palette.secondary.light : 'transparent',
                  '&:hover': {
                    bgcolor: theme.palette.secondary.light,
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: selectedMenu === item.value ? 600 : 500,
                    color: theme.palette.primary.main,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            marginTop: theme.spacing(8),
            background: theme.palette.background.default,
            minHeight: '100vh',
          }}
        >
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
              minHeight: 'calc(100vh - 100px)',
            }}
          >
            {renderContent()}
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;