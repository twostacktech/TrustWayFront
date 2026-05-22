import { useEffect, useState } from "react"
import { Car, MagnifyingGlass, PencilSimple, Trash, X } from "@phosphor-icons/react"
import { toast } from "react-toastify"

import { buscar, deletar } from "../../services/Service"
import type Apolice from "../../models/Apolice"
import FormApolice from "../formapolices/FormApolice"

type VeiculoDetalhado = {
  marca?: string
  modelo?: string
  ano?: string | number
  placa?: string
  precoFipe?: number
}

function Apolices() {
  const [apolices, setApolices] = useState<Apolice[]>([
    {
      id: 1,
      dataInicio: "2026-05-22T00:00:00.000Z",
      mensalidade: 320.00,
      status: "Ativo",
      percentualCobertura: 80,
      valorFranquia: 2800.00,
      usuario: {
        id: 1,
        nome: "Ana Beatriz Costa",
        cpf: "123.456.789-00"
      },
      veiculo: {
        id: 1,
        placa: "ABC-1D23"
      }
    }
  ]);
  const [modalAberto, setModalAberto] = useState(false)
  const [apoliceEditando, setApoliceEditando] = useState<Apolice | null>(null)
  
  // Estados para controlar o modal de Detalhes do Veículo
  const [modalVeiculoAberto, setModalVeiculoAberto] = useState(false)
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Apolice | null>(null)

  const formatarMoeda = (valor?: number | string) => {
    const valorNumerico = Number(valor)
    if (Number.isNaN(valorNumerico)) return "-"
    return valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    })
  }

  const formatarData = (data?: Date | string) => {
    if (!data) return "-"
    if (typeof data === "string" && data.includes("-")) {
      const [ano, mes, dia] = data.split("T")[0].split("-")
      return `${dia}/${mes}/${ano}`
    }
    const dataFormatada = new Date(data)
    if (Number.isNaN(dataFormatada.getTime())) return "-"
    return dataFormatada.toLocaleDateString("pt-BR")
  }

  async function buscarApolices() {
    try {
      await buscar("/apolices", setApolices)
    } catch (error) {
      console.log("Erro ao buscar apólices:", error)
      toast.error("Erro ao buscar apólices.")
    }
  }

  async function excluirApolice(id: number) {
    if (!window.confirm("Deseja realmente excluir esta apólice?")) {
      return
    }

    try {
      await deletar(`/apolices/${id}`)
      setApolices((apolicesAtuais) =>
        apolicesAtuais.filter((apolice) => apolice.id !== id)
      )
      toast.success("Apólice excluída com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir apólice.")
    }
  }

  function abrirCadastro() {
    setApoliceEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(apolice: Apolice) {
    setApoliceEditando(apolice)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setTimeout(() => {
      setApoliceEditando(null)
    }, 150)
  }

  // Funções de controle do modal de veículo
  function abrirDetalhesVeiculo(apolice: Apolice) {
    setVeiculoSelecionado(apolice)
    setModalVeiculoAberto(true)
  }

  function fecharDetalhesVeiculo() {
    setModalVeiculoAberto(false)
    setVeiculoSelecionado(null)
  }

  useEffect(() => {
    // buscarApolices()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] text-white px-6 py-12 md:px-16 font-['Inter'] antialiased">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header da Seção */}
        <section className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="font-['JetBrains_Mono'] font-mono text-xs text-zinc-500 uppercase tracking-widest">
              Contratos ativos
            </p>
            <h1 className="text-5xl font-['Anton'] uppercase tracking-wide mt-1 text-white">
              Apólices
            </h1>
          </div>

          <button
            onClick={abrirCadastro}
            className="rounded-lg bg-[#D946EF] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 ease-out hover:bg-[#FF4FD8] hover:shadow-[0_0_20px_rgba(217,70,239,0.6)] hover:scale-105 active:scale-98 cursor-pointer"
          >
            + Adicionar apólice
          </button>
        </section>

        {/* Barra de Busca */}
        <div className="mb-6 max-w-md relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlass size={16} className="text-zinc-500 group-focus-within:text-[#22D3EE] transition-colors" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou placa..."
            className="w-full bg-[#0a0a0a]/40 text-sm text-white placeholder-zinc-600 pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#22D3EE] focus:bg-[#0a0a0a]/80 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all font-['Inter']"
          />
        </div>

        {/* Tabela de Apólices */}
        <section className="rounded-lg border border-white/10 bg-[#0a0a0a]/40 overflow-hidden">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-xs uppercase font-medium bg-[#0a0a0a]/80">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">CPF</th>
                <th className="px-6 py-4">Placa</th>
                <th className="px-6 py-4 text-right">Mensalidade</th>
                <th className="px-6 py-4">Cobertura</th>
                <th className="px-6 py-4 text-right">Franquia</th>
                <th className="px-6 py-4">Início</th>
                <th className="px-6 py-4 text-right">Veículo</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {apolices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-zinc-500">
                    Nenhuma apólice encontrada.
                  </td>
                </tr>
              ) : (
                apolices.map((apolice) => (
                  <tr key={apolice.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    {/* ID */}
                    <td className="px-6 py-4 font-['JetBrains_Mono'] font-mono text-xs text-zinc-500">
                      AP-{String(apolice.id).padStart(4, '0')}
                    </td>
                    
                    {/* Cliente */}
                    <td className="px-6 py-4 font-medium text-white">
                      {apolice.usuario?.nome || "—"}
                    </td>
                    
                    {/* CPF */}
                    <td className="px-6 py-4 text-[#22D3EE] font-['JetBrains_Mono'] font-mono text-sm">
                      {apolice.usuario?.cpf || "—"}
                    </td>
                    
                    {/* Placa */}
                    <td className="px-6 py-4 text-zinc-300 font-['JetBrains_Mono'] font-mono text-sm uppercase">
                      {apolice.veiculo?.placa || "—"}
                    </td>
                    
                    {/* Mensalidade */}
                    <td className="px-6 py-4 text-right font-['JetBrains_Mono'] font-mono text-white">
                      {formatarMoeda(apolice.mensalidade)}
                    </td>
                    
                    {/* Cobertura */}
                    <td className="px-6 py-4 text-zinc-300">
                      {apolice.percentualCobertura ? `${apolice.percentualCobertura}%` : "---"}
                    </td>
                    
                    {/* Franquia */}
                    <td className="px-6 py-4 text-right font-['JetBrains_Mono'] font-mono text-zinc-400">
                      {formatarMoeda(apolice.valorFranquia)}
                    </td>
                    
                    {/* Início */}
                    <td className="px-6 py-4 text-zinc-400 font-['JetBrains_Mono'] font-mono">
                      {formatarData(apolice.dataInicio)}
                    </td>
                    
                    {/* Coluna de Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        {/* Botão Ver */}
                        <button 
                          type="button"
                          onClick={() => abrirDetalhesVeiculo(apolice)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-[#22D3EE] transition-all duration-300 bg-white/5 hover:bg-[#22D3EE]/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] rounded px-2.5 py-1.5 border border-white/10 hover:border-[#22D3EE] cursor-pointer"
                        >
                          <Car size={14} className="text-zinc-400" />
                          <span>Ver</span>
                        </button>

                        {/* Botão Editar */}
                        <button
                          type="button"
                          onClick={() => abrirEdicao(apolice)}
                          className="rounded p-1 text-zinc-400 hover:bg-white/5 hover:text-[#22D3EE] hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 cursor-pointer"
                          title="Editar apólice"
                        >
                          <PencilSimple size={15} />
                        </button>

                        {/* Botão Excluir */}
                        <button
                          type="button"
                          onClick={() => excluirApolice(apolice.id)}
                          className="rounded p-1 text-zinc-400 hover:bg-white/5 hover:text-[#FF4FD8] hover:shadow-[0_0_10px_rgba(255,79,216,0.3)] transition-all duration-300 cursor-pointer"
                          title="Excluir apólice"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

      </div>

      {/* Modal de Formulário (Cadastro/Edição) */}
      {modalAberto && (
        <FormApolice
          fecharModal={fecharModal}
          atualizarListagem={buscarApolices}
          apoliceEditando={apoliceEditando}
          adicionarApolice={(apolice: Apolice) =>
            setApolices((apolicesAtuais) => {
              if (apolicesAtuais.some((a) => a.id === apolice.id)) return apolicesAtuais;
              return [...apolicesAtuais, apolice]
            })
          }
        />
      )}

      {/* Modal de Detalhes do Veículo ajustado de acordo com image_400170.png */}
      {modalVeiculoAberto && veiculoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-[#050505] border border-white/10 p-8 rounded-xl relative shadow-2xl text-white font-['Inter']">
            
            {/* Botão de fechar (X) */}
            <button 
              onClick={fecharDetalhesVeiculo}
              className="absolute top-6 right-6 text-zinc-500 hover:text-[#22D3EE] hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="mb-6">
              <h2 className="text-3xl font-['Anton'] uppercase tracking-wide">
                Detalhes do Veículo
              </h2>
              <p className="text-sm font-['JetBrains_Mono'] text-zinc-500 mt-1">
                Apólice AP-{String(veiculoSelecionado.id).padStart(4, '0')}
              </p>
            </div>

            {/* Escopo isolado com conversão segura (any) para prevenir erros do TypeScript (image_400170.png) */}
            {(() => {
              const veiculoRaw = veiculoSelecionado.veiculo as VeiculoDetalhado | undefined;
              return (
                <>
                  {/* Grid de Informações */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-lg">
                      <span className="block font-['JetBrains_Mono'] text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Marca</span>
                      <span className="text-base font-semibold text-white">{veiculoRaw?.marca || "Honda"}</span>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-lg">
                      <span className="block font-['JetBrains_Mono'] text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Modelo</span>
                      <span className="text-base font-semibold text-white">{veiculoRaw?.modelo || "Civic"}</span>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-lg">
                      <span className="block font-['JetBrains_Mono'] text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Ano</span>
                      <span className="text-base font-semibold font-['JetBrains_Mono'] text-white">{veiculoRaw?.ano || "2022"}</span>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-lg">
                      <span className="block font-['JetBrains_Mono'] text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Placa</span>
                      <span className="text-base font-semibold font-['JetBrains_Mono'] text-white uppercase">{veiculoRaw?.placa || "—"}</span>
                    </div>
                  </div>

                  {/* Preço FIPE */}
                  <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-lg">
                    <span className="block font-['JetBrains_Mono'] text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Preço FIPE</span>
                    <span className="text-2xl font-semibold font-['JetBrains_Mono'] text-white">
                      {veiculoRaw?.precoFipe 
                        ? formatarMoeda(veiculoRaw.precoFipe) 
                        : "R$ 142.500"
                      }
                    </span>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}
    </main>
  )
}

export default Apolices

// import { useEffect, useState } from "react"
// import { Pencil, Trash2, CarFront, Search } from "lucide-react"
// import { toast } from "react-toastify"

// import { buscar, deletar } from "../../services/Service"
// import type Apolice from "../../models/Apolice"
// import FormApolice from "../formapolices/FormApolice"

// function Apolices() {
//   const [apolices, setApolices] = useState<Apolice[]>([
//     {
//       id: 1,
//       dataInicio: "2026-05-22T00:00:00.000Z",
//       mensalidade: 320.00,
//       status: "Ativo",
//       percentualCobertura: 80,
//       valorFranquia: 2800.00,
//       usuario: {
//         id: 1,
//         nome: "Ana Beatriz Costa",
//         cpf: "123.456.789-00"
//       },
//       veiculo: {
//         id: 1,
//         placa: "ABC-1D23"
//       }
//     }
//   ]);
//   const [modalAberto, setModalAberto] = useState(false)
//   const [apoliceEditando, setApoliceEditando] = useState<Apolice | null>(null)

//   const formatarMoeda = (valor?: number | string) => {
//     const valorNumerico = Number(valor)
//     if (Number.isNaN(valorNumerico)) return "-"
//     return valorNumerico.toLocaleString("pt-BR", {
//       style: "currency",
//       currency: "BRL",
//       minimumFractionDigits: 0,
//     })
//   }

//   const formatarData = (data?: Date | string) => {
//     if (!data) return "-"
//     if (typeof data === "string" && data.includes("-")) {
//       const [ano, mes, dia] = data.split("T")[0].split("-")
//       return `${dia}/${mes}/${ano}`
//     }
//     const dataFormatada = new Date(data)
//     if (Number.isNaN(dataFormatada.getTime())) return "-"
//     return dataFormatada.toLocaleDateString("pt-BR")
//   }

//   async function buscarApolices() {
//     try {
//       await buscar("/apolices", setApolices)
//     } catch (error) {
//       console.log("Erro ao buscar apólices:", error)
//       toast.error("Erro ao buscar apólices.")
//     }
//   }

//   async function excluirApolice(id: number) {
//     if (!window.confirm("Deseja realmente excluir esta apólice?")) {
//       return
//     }

//     try {
//       await deletar(`/apolices/${id}`)
//       setApolices((apolicesAtuais) =>
//         apolicesAtuais.filter((apolice) => apolice.id !== id)
//       )
//       toast.success("Apólice excluída com sucesso!")
//     } catch (error) {
//       console.error(error)
//       toast.error("Erro ao excluir apólice.")
//     }
//   }

//   function abrirCadastro() {
//     setApoliceEditando(null)
//     setModalAberto(true)
//   }

//   function abrirEdicao(apolice: Apolice) {
//     setApoliceEditando(apolice)
//     setModalAberto(true)
//   }

//   function fecharModal() {
//     setModalAberto(false)
//     setTimeout(() => {
//       setApoliceEditando(null)
//     }, 150)
//   }

//   useEffect(() => {
//     // buscarApolices()
//   }, [])

//   return (
//     /* Trocado font-body por font-['Inter'] para garantir a fonte do corpo caso o alias falhe */
//     <main className="min-h-screen bg-[#050505] text-white px-6 py-12 md:px-16 font-['Inter'] antialiased">
//       <div className="max-w-7xl mx-auto w-full">
        
//         {/* Header da Seção */}
//         <section className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
//           <div>
//             <p className="font-['JetBrains_Mono'] font-mono text-xs text-zinc-500 uppercase tracking-widest">
//               Contratos ativos
//             </p>
//             {/* Forçado o uso direto da fonte 'Anton' de forma arbitrária no Tailwind */}
//             <h1 className="text-5xl font-['Anton'] uppercase tracking-wide mt-1 text-white">
//               Apólices
//             </h1>
//           </div>

//           <button
//             onClick={abrirCadastro}
//             className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-bold tracking-wider text-white transition-all hover:bg-sky-700 active:scale-98"
//           >
//             + Adicionar apólice
//           </button>
//         </section>

        
// {/* Barra de Busca baseada na image_3ff368.png */}
//         <div className="mb-6 max-w-md relative group">
//           <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//             <Search size={16} className="text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
//           </span>
//           <input
//             type="text"
//             placeholder="Buscar por nome, CPF ou placa..."
//             className="w-full bg-[#0a0a0a]/40 text-sm text-white placeholder-zinc-600 pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-zinc-500 focus:bg-[#0a0a0a]/80 transition-all font-['Inter']"
//           />
//         </div>

//         {/* Tabela de Apólices */}
//         <section className="rounded-lg border border-white/10 bg-[#0a0a0a]/40 overflow-hidden">
//           <table className="w-full border-collapse text-left text-sm">
//             <thead>
//               <tr className="border-b border-white/10 text-zinc-400 text-xs uppercase font-medium bg-[#0a0a0a]/80">
//                 <th className="px-6 py-4">ID</th>
//                 <th className="px-6 py-4">Cliente</th>
//                 <th className="px-6 py-4">CPF</th>
//                 <th className="px-6 py-4">Placa</th>
//                 <th className="px-6 py-4 text-right">Mensalidade</th>
//                 <th className="px-6 py-4">Cobertura</th>
//                 <th className="px-6 py-4 text-right">Franquia</th>
//                 <th className="px-6 py-4">Início</th>
//                 <th className="px-6 py-4 text-right">Veículo</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-white/5">
//               {apolices.length === 0 ? (
//                 <tr>
//                   <td colSpan={9} className="py-10 text-center text-zinc-500">
//                     Nenhuma apólice encontrada.
//                   </td>
//                 </tr>
//               ) : (
//                 apolices.map((apolice) => (
//                   <tr key={apolice.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
//                     {/* ID */}
//                     <td className="px-6 py-4 font-['JetBrains_Mono'] font-mono text-xs text-zinc-500">
//                       AP-{String(apolice.id).padStart(4, '0')}
//                     </td>
                    
//                     {/* Cliente */}
//                     <td className="px-6 py-4 font-medium text-white">
//                       {apolice.usuario?.nome || "—"}
//                     </td>
                    
//                     {/* CPF */}
//                     <td className="px-6 py-4 text-zinc-400 font-['JetBrains_Mono'] font-mono text-sm">
//                       {apolice.usuario?.cpf || "—"}
//                     </td>
                    
//                     {/* Placa */}
//                     <td className="px-6 py-4 text-zinc-300 font-['JetBrains_Mono'] font-mono text-sm uppercase">
//                       {apolice.veiculo?.placa || "—"}
//                     </td>
                    
//                     {/* Mensalidade */}
//                     <td className="px-6 py-4 text-right font-['JetBrains_Mono'] font-mono text-white">
//                       {formatarMoeda(apolice.mensalidade)}
//                     </td>
                    
//                     {/* Cobertura */}
//                     <td className="px-6 py-4 text-zinc-300">
//                       {apolice.percentualCobertura ? `${apolice.percentualCobertura}%` : "---"}
//                     </td>
                    
//                     {/* Franquia */}
//                     <td className="px-6 py-4 text-right font-['JetBrains_Mono'] font-mono text-zinc-400">
//                       {formatarMoeda(apolice.valorFranquia)}
//                     </td>
                    
//                     {/* Início */}
//                     <td className="px-6 py-4 text-zinc-400 font-['JetBrains_Mono'] font-mono">
//                       {formatarData(apolice.dataInicio)}
//                     </td>
                    
//                     {/* Coluna de Ações integrada com o botão "Ver" */}
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex items-center justify-end gap-4">
//                         {/* Botão Ver */}
//                         <button className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded px-2.5 py-1.5 border border-white/10">
//                           <CarFront size={14} className="text-zinc-400" />
//                           <span>Ver</span>
//                         </button>

//                         {/* Botão Editar */}
//                         <button
//                           type="button"
//                           onClick={() => abrirEdicao(apolice)}
//                           className="rounded p-1 text-zinc-400 hover:bg-white/5 hover:text-sky-400 transition-all"
//                           title="Editar apólice"
//                         >
//                           <Pencil size={15} />
//                         </button>

//                         {/* Botão Excluir */}
//                         <button
//                           type="button"
//                           onClick={() => excluirApolice(apolice.id)}
//                           className="rounded p-1 text-zinc-400 hover:bg-white/5 hover:text-red-500 transition-all"
//                           title="Excluir apólice"
//                         >
//                           <Trash2 size={15} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </section>

//       </div>

//       {/* Modal */}
//       {modalAberto && (
//         <FormApolice
//           fecharModal={fecharModal}
//           atualizarListagem={buscarApolices}
//           apoliceEditando={apoliceEditando}
//           adicionarApolice={(apolice: Apolice) =>
//             setApolices((apolicesAtuais) => {
//               if (apolicesAtuais.some((a) => a.id === apolice.id)) return apolicesAtuais;
//               return [...apolicesAtuais, apolice]
//             })
//           }
//         />
//       )}
//     </main>
//   )
// }

// export default Apolices
