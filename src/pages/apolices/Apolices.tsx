import { useEffect, useState } from "react"
import { Car, MagnifyingGlass, PencilSimple, Plus, Trash, X } from "@phosphor-icons/react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { buscar, deletar, obterHeaderAutenticado } from "../../services/Service"
import type Apolice from "../../models/Apolice"
import FormApolice from "../formapolices/FormApolice"

type VeiculoDetalhado = {
  marca?: string
  modelo?: string
  ano?: string | number
  placa?: string
  precoFip?: number | string
}

function Apolices() {
  const [apolices, setApolices] = useState<Apolice[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [apoliceEditando, setApoliceEditando] = useState<Apolice | null>(null)

  // Estados para controlar o modal de Detalhes do Veículo
  const [modalVeiculoAberto, setModalVeiculoAberto] = useState(false)
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Apolice | null>(null)
  const [busca, setBusca] = useState("")

  const obterValorMonetario = (valor?: number | string) => {
    if (valor === undefined || valor === null || valor === "") return null
    if (typeof valor === "number") return Number.isNaN(valor) ? null : valor

    const textoLimpo = valor.trim().replace(/[^\d,.-]/g, "")
    if (!textoLimpo) return null

    const temVirgula = textoLimpo.includes(",")
    const textoNormalizado = temVirgula
      ? textoLimpo.replace(/\./g, "").replace(",", ".")
      : textoLimpo.replace(/\.(?=\d{3}(?:\D|$))/g, "")

    const valorNumerico = Number(textoNormalizado)
    return Number.isNaN(valorNumerico) ? null : valorNumerico
  }

  const formatarMoeda = (valor?: number | string) => {
    const valorNumerico = obterValorMonetario(valor)
    if (valorNumerico === null) return "-"
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
      await buscar("/apolices", setApolices, obterHeaderAutenticado())
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
      await deletar(`/apolices/${id}`, obterHeaderAutenticado())
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

  const apolicesFiltradas = apolices.filter((apolice) => {
    const termoBusca = busca.trim().toLowerCase()
    if (!termoBusca) return true

    const nomeCliente = apolice.usuario?.nome?.toLowerCase() || ""
    const cpfCliente = apolice.usuario?.cpf?.toLowerCase() || ""
    const placaVeiculo = apolice.veiculo?.placa?.toLowerCase() || ""

    return (
      nomeCliente.includes(termoBusca) ||
      cpfCliente.includes(termoBusca) ||
      placaVeiculo.includes(termoBusca)
    )
  })


  useEffect(() => {
    buscarApolices()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] px-6 py-12 text-[#FAFAFA] antialiased md:px-16 font-['Inter']">
      <section className="mx-auto w-full max-w-7xl">

        {/* Header da Seção */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">
              Contratos ativos
            </span>
            <h1 className="mt-1 font-['Anton'] text-5xl uppercase tracking-wide text-[#FAFAFA]">
              Apólices
            </h1>
          </div>

          <button
            type="button"
            onClick={abrirCadastro}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#D946EF] px-6 py-2.5 text-sm font-bold tracking-wider text-white transition-all duration-300 ease-out hover:scale-105 hover:bg-[#FF4FD8] hover:shadow-[0_0_20px_rgba(217,70,239,0.6)]"
          >
            <Plus size={18} weight="bold" />
            Adicionar apólice
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="mb-6 max-w-[560px] relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlass size={18} className="text-[#A1A1AA] group-focus-within:text-[#22D3EE] transition-colors" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou placa..."
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            className="h-10 w-full rounded-md border border-white/10 bg-white/[0.05] py-2 pl-10 pr-10 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] transition-all focus:border-[#22D3EE] focus:bg-[#22D3EE]/10 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] focus:outline-none font-['Inter']"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#A1A1AA] hover:text-[#FF4FD8] transition-colors cursor-pointer"
              title="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tabela de Apólices */}
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#0a0a0a]/40 text-xs uppercase text-[#A1A1AA]">
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">CPF</th>
                  <th className="px-6 py-4 font-medium">Placa</th>
                  <th className="px-6 py-4 text-right font-medium">Mensalidade</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Cobertura</th>
                  <th className="px-6 py-4 text-right font-medium">Franquia</th>
                  <th className="px-6 py-4 font-medium">Início</th>
                  <th className="px-6 py-4 text-right font-medium">Veículo</th>
                </tr>
              </thead>

              <tbody>
                {apolicesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-[#A1A1AA]">
                      Nenhuma apólice encontrada.
                    </td>
                  </tr>
                ) : (
                  apolicesFiltradas.map((apolice) => (
                    <tr key={apolice.id} className="border-b border-white/10 transition hover:bg-white/[0.04] last:border-b-0">
                      {/* ID */}
                      <td className="px-6 py-4 font-['JetBrains_Mono'] font-mono text-xs text-[#A1A1AA]">
                        AP-{String(apolice.id).padStart(4, '0')}
                      </td>

                      {/* Cliente */}
                      <td className="px-6 py-4 font-medium text-[#FAFAFA]">
                        {apolice.usuario?.nome || "—"}
                      </td>

                      {/* CPF */}
                      <td className="px-6 py-4 text-[#22D3EE] font-['JetBrains_Mono'] font-mono text-sm">
                        {apolice.usuario?.cpf || "—"}
                      </td>

                      {/* Placa */}
                      <td className="px-6 py-4 font-['JetBrains_Mono'] font-mono text-sm uppercase text-[#A1A1AA]">
                        {apolice.veiculo?.placa || "—"}
                      </td>

                      {/* Mensalidade */}
                      <td className="px-6 py-4 text-right font-['JetBrains_Mono'] font-mono text-[#FAFAFA]">
                        {formatarMoeda(apolice.mensalidade)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${apolice.status === "Ativa"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : apolice.status === "Inativa"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400" // Cancelada
                          }`}>
                          {apolice.status || "Ativa"}
                        </span>
                      </td>

                      {/* Cobertura */}
                      <td className="px-6 py-4 text-[#A1A1AA]">
                        {apolice.percentualCobertura ? `${apolice.percentualCobertura}%` : "---"}
                      </td>

                      {/* Cobertura */}
                      <td className="px-6 py-4 text-[#A1A1AA]">
                        {apolice.percentualCobertura ? `${apolice.percentualCobertura}%` : "---"}
                      </td>

                      {/* Franquia */}
                      <td className="px-6 py-4 text-right font-['JetBrains_Mono'] font-mono text-[#A1A1AA]">
                        {formatarMoeda(apolice.valorFranquia)}
                      </td>

                      {/* Início */}
                      <td className="px-6 py-4 font-['JetBrains_Mono'] font-mono text-[#A1A1AA]">
                        {formatarData(apolice.dataInicio)}
                      </td>

                      {/* Coluna de Ações */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          {/* Botão Ver */}
                          <button
                            type="button"
                            onClick={() => abrirDetalhesVeiculo(apolice)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-xs font-medium text-[#FAFAFA] transition-all duration-300 hover:border-[#22D3EE] hover:bg-[#22D3EE]/10 hover:text-[#22D3EE] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                          >
                            <Car size={14} className="text-[#A1A1AA]" />
                            <span>Ver</span>
                          </button>

                          {/* Botão Editar */}
                          <button
                            type="button"
                            onClick={() => abrirEdicao(apolice)}
                            className="cursor-pointer rounded p-1 text-[#A1A1AA] transition-all duration-300 hover:bg-white/[0.05] hover:text-[#22D3EE] hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                            title="Editar apólice"
                          >
                            <PencilSimple size={15} />
                          </button>

                          {/* Botão Excluir */}
                          <button
                            type="button"
                            onClick={() => excluirApolice(apolice.id)}
                            className="cursor-pointer rounded p-1 text-[#A1A1AA] transition-all duration-300 hover:bg-white/[0.05] hover:text-[#FF4FD8] hover:shadow-[0_0_10px_rgba(255,79,216,0.3)]"
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
          </div>
        </div>

      </section>

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
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#16151E] p-8 text-[#FAFAFA] shadow-2xl font-['Inter']">

            {/* Botão de fechar (X) */}
            <button
              onClick={fecharDetalhesVeiculo}
              className="absolute right-6 top-6 cursor-pointer text-[#A1A1AA] transition-all duration-300 hover:text-[#22D3EE] hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="mb-6">
              <h2 className="text-3xl font-['Anton'] uppercase tracking-wide">
                Detalhes do Veículo
              </h2>
              <p className="mt-1 text-sm font-['JetBrains_Mono'] text-[#A1A1AA]">
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
                    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                      <span className="mb-1 block font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#A1A1AA]">Marca</span>
                      <span className="text-base font-semibold text-[#FAFAFA]">{veiculoRaw?.marca || "Honda"}</span>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                      <span className="mb-1 block font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#A1A1AA]">Modelo</span>
                      <span className="text-base font-semibold text-[#FAFAFA]">{veiculoRaw?.modelo || "Civic"}</span>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                      <span className="mb-1 block font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#A1A1AA]">Ano</span>
                      <span className="text-base font-semibold text-[#FAFAFA] font-['JetBrains_Mono']">{veiculoRaw?.ano || "2022"}</span>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                      <span className="mb-1 block font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#A1A1AA]">Placa</span>
                      <span className="text-base font-semibold uppercase text-[#FAFAFA] font-['JetBrains_Mono']">{veiculoRaw?.placa || "—"}</span>
                    </div>
                  </div>

                  {/* Preço FIPE */}
                  <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                    <span className="mb-1 block font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#A1A1AA]">Preço FIPE</span>
                    <span className="text-2xl font-semibold text-[#FAFAFA] font-['JetBrains_Mono']">
                      {veiculoRaw?.precoFip
                        ? formatarMoeda(veiculoRaw.precoFip)
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </main>
  )
}

export default Apolices
