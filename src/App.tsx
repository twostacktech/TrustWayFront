import { BrowserRouter, Route, Routes } from "react-router-dom"
import Relatorios from "./pages/relatorios/Relatorio"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Relatorios />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App