import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdmCliente from './pages/Cliente/AdmCliente'

import Home from "./pages/home/Home";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Apolices from "./pages/apolices/Apolices";

function HomeLayout() {
  return (
    <>
      <Navbar />
      <div className="min-h-[80vh]">
        <Home />
      </div>
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout />} />
        <Route path="/home" element={<HomeLayout />} />
        <Route path="/admcliente" element={<AdmCliente />} />
        <Route path="/apolices" element={<Apolices/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
