import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdmCliente from './pages/Cliente/AdmCliente'
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Home from "./pages/home/Home";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Apolices from "./pages/apolices/Apolices";
import NavBarAdm from "./navbaradm/NavBarAdm";
import Relatorios from "./pages/relatorios/Relatorio";
import CustomCursor from "./components/cursor/CustomCursor";
import type { ReactNode } from "react";
import { MinhasApolices } from "./pages/Usuario/MinhasApolice";

function HomeLayout() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <div className="min-h-[80vh]">
        <Home />
      </div>
      <Footer />
    </>
  )
}

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#16151E] text-[#FAFAFA]">
      <NavBarAdm />
      {children}
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout />} />
        <Route path="/home" element={<HomeLayout />} />
        <Route path="/admcliente" element={<AdminLayout><AdmCliente /></AdminLayout>} />
        <Route path="/apolices" element={<AdminLayout><Apolices /></AdminLayout>} />
        <Route path="/relatorios" element={<AdminLayout><Relatorios /></AdminLayout>} />
        <Route path="/minhasapolices" element={<AdminLayout><Apolices /></AdminLayout>} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/minhas-apolices" element={<MinhasApolices />} />
        <Route path="/minhasapolices" element={<MinhasApolices />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
