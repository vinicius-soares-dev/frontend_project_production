import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/PanelAdmin";

function App() {

  return (  
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/administrador" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App;
