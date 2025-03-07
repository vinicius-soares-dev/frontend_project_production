import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  useTheme,
  styled
} from '@mui/material';
import {
  Factory,
  GroupWork,
  AssignmentTurnedIn,
  Timeline,
  LockPerson,
  VerifiedUser,
  CorporateFare,
  Link
} from '@mui/icons-material';

// Configuração das animações
const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUpVariants: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const HeroSection = styled(motion.div)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.common.white,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const FeatureCard = styled(motion(Paper))(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[6],
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
  },
}));


const Home = () => {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: theme.palette.background.default,
              zIndex: 9999
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            >
              <Factory sx={{ fontSize: 80, color: theme.palette.primary.main }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)' }}>
        <Toolbar sx={{ py: 2 }}>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
          >
            <Factory sx={{ fontSize: 40, mr: 2, color: theme.palette.secondary.main }} />
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              INDUSTRIAL<span style={{ color: theme.palette.secondary.main }}>CONTROL</span>
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LockPerson />}
              sx={{ mx: 2, borderRadius: 3 }}
              href="/admin-login"
            >
              Painel Gerencial
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<VerifiedUser />}
              sx={{ borderRadius: 3 }}
              href="/colab-login"
            >
              Acesso Colaborador
            </Button>
          </motion.div>
        </Toolbar>
      </AppBar>

      <HeroSection
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        <Container>
          <Grid container spacing={6}>
            <Grid item xs={12} md={7}>
              <motion.div variants={slideUpVariants}>
                <Typography variant="h2" gutterBottom sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  Controle Industrial<br/>
                  <span style={{ color: theme.palette.secondary.main }}>Premium</span>
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                  Solução integrada para gestão de produção em larga escala
                </Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ px: 6, py: 2 }}
                    href="/colab-login"
                  >
                    Acessar Sistema
                  </Button>
                </motion.div>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      <Box py={10} bgcolor="background.default">
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }
            }}
          >
            <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700 }}>
              Benefícios Exclusivos
            </Typography>
            
            <Grid container spacing={4} mt={4}>
              {[
                {
                  icon: <GroupWork sx={{ fontSize: 50 }} color="secondary" />,
                  title: 'Gestão Unificada',
                  text: 'Controle completo de colaboradores, setores e ordens de serviço'
                },
                {
                  icon: <Timeline sx={{ fontSize: 50 }} color="secondary" />,
                  title: 'Otimização de Processos',
                  text: 'Algoritmos inteligentes para máxima eficiência produtiva'
                },
                {
                  icon: <AssignmentTurnedIn sx={{ fontSize: 50 }} color="secondary" />,
                  title: 'Rastreabilidade Completa',
                  text: 'Monitoramento detalhado em todas as etapas da produção'
                }
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <FeatureCard
                    variants={slideUpVariants}
                  >
                    <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {feature.text}
                    </Typography>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      <Box py={10} sx={{ background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` }}>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
                <Box
                  component="img"
                  src="dashboard-preview.png"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: theme.shadows[12]
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
                Controle Total da Produção
              </Typography>
              <Box component="ul" sx={{ color: 'white', pl: 3, '& li': { mb: 2 } }}>
                <li>Alocação inteligente de recursos</li>
                <li>Relatórios executivos em tempo real</li>
                <li>Integração com sistemas corporativos</li>
                <li>Segurança industrial nível enterprise</li>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box py={10} bgcolor="background.default">
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <CorporateFare sx={{ fontSize: 80, mb: 4, color: theme.palette.secondary.main }} />
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                Solução Corporativa Integrada
              </Typography>
              <Typography variant="h6" sx={{ mb: 4 }}>
                Desenvolvida exclusivamente para operações industriais de grande porte
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                sx={{ px: 8, py: 2 }}
              >
                Solicitar Demonstração
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="footer" sx={{ bgcolor: 'primary.dark', color: 'white', py: 8 }}>
        <Container>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Factory sx={{ fontSize: 40, mr: 2, color: theme.palette.secondary.main }} />
                <Typography variant="h5">VG TECH SOLUTIONS</Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                Especialistas em soluções tecnológicas para indústria 4.0
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
              <Button
                color="inherit"
                href="https://www.vgtechsolutions.com.br"
                target="_blank"
                endIcon={<Link />}
                sx={{ mb: 2 }}
              >
                Visite nossa sede digital
              </Button>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                © 2024 VG TECH SOLUTIONS. Todos os direitos reservados.<br/>
                Sistema desenvolvido para uso corporativo exclusivo
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;