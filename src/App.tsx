import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/PanelAdmin";
import ColabLogin from "./pages/ColabLogin";
import AdminLogin from "./pages/AdminLogin";
import ColabDashboard from "./pages/ColabDashboard";
import { useEffect, useState } from "react";


function App() {

  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('role'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  return (  
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/administrador" element={ role === 'admin' ? <AdminDashboard /> : <Home />} />
        <Route path="/colab-login" element={<ColabLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/colab/dashboard" element={<ColabDashboard />} /> 
      </Routes>
    </Router>
  )
}

export default App;
