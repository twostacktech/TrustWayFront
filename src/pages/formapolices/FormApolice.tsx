import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { CircleNotch, X } from "@phosphor-icons/react"

import { api, atualizar, cadastrar, obterHeaderAutenticado } from "../../services/Service"
import type Apolice from "../../models/Apolice"

const obterMensagemErro = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const mensagem = error.response?.data?.message

    if (Array.isArray(mensagem)) {
      return mensagem.join(" ")
    }

    if (typeof mensagem === "string") {
      return mensagem
    }

    if (error.response?.status) {
      return `Erro ${error.response.status} ao salvar apólice.`
    }
  }

  return "Erro ao salvar apólice. Verifique os dados."
}

const obterDetalheErro = (error: unknown) => {
  if (!axios.isAxiosError(error)) return ""

  const mensagem = error.response?.data?.message

  if (Array.isArray(mensagem)) return mensagem.join(" ")
  if (typeof mensagem === "string") return mensagem
  if (error.response?.data?.error) return String(error.response.data.error)
  if (error.response?.status) return `Erro ${error.response.status}`

  return ""
}

const erroNaoEncontrado = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404

const obterValorMonetario = (valor: string) => {
  const textoLimpo = valor.trim().replace(/[^\d,.-]/g, "")

  if (!textoLimpo) return 0

  const temVirgula = textoLimpo.includes(",")
  const textoNormalizado = temVirgula
    ? textoLimpo.replace(/\./g, "").replace(",", ".")
    : textoLimpo.replace(/\.(?=\d{3}(?:\D|$))/g, "")

  const valorNumerico = Number(textoNormalizado)
  return Number.isNaN(valorNumerico) ? 0 : valorNumerico
}

const apenasNumeros = (valor: string) => valor.replace(/\D/g, "")

const limitarTexto = (valor: string, limite: number) => valor.slice(0, limite)

const formatarCpf = (valor: string) => {
  const numeros = apenasNumeros(valor).slice(0, 11)

  if (numeros.length <= 3) return numeros
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`
  if (numeros.length <= 9) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`
  }

  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`
}

const formatarPlaca = (valor: string) =>
  valor
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7)

const limitarNumeroInteiro = (valor: string, limite: number) =>
  apenasNumeros(valor).slice(0, limite)

type FormApoliceProps = {
  fecharModal: () => void
  atualizarListagem: () => Promise<void> | void
  adicionarApolice: (apolice: Apolice) => void
  apoliceEditando?: Apolice | null
}

function FormApolice({
  fecharModal,
  atualizarListagem,
  adicionarApolice,
  apoliceEditando,
}: FormApoliceProps) {
  const [salvando, setSalvando] = useState(false)

  const [formData, setFormData] = useState({
    dataInicio: "",
    mensalidade: "",
    status: "Ativa",
    percentualCobertura: "",
    valorFranquia: "",
    usuarioCpf: "",
    veiculoPlaca: "",
    veiculoMarca: "",
    veiculoModelo: "",
    veiculoAno: "",
    veiculoPrecoFip: "",
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!apoliceEditando) return

      setFormData({
        dataInicio:
          typeof apoliceEditando.dataInicio === "string"
            ? apoliceEditando.dataInicio.split("T")[0]
            : "",
        mensalidade: apoliceEditando.mensalidade.toString(),
        status: apoliceEditando.status,
        percentualCobertura: apoliceEditando.percentualCobertura.toString(),
        valorFranquia: apoliceEditando.valorFranquia.toString(),
        usuarioCpf: formatarCpf(apoliceEditando.usuario?.cpf ?? ""),
        veiculoPlaca: formatarPlaca(apoliceEditando.veiculo?.placa ?? ""),
        veiculoMarca: apoliceEditando.veiculo?.marca ?? "",
        veiculoModelo: apoliceEditando.veiculo?.modelo ?? "",
        veiculoAno: apoliceEditando.veiculo?.ano?.toString() ?? "",
        veiculoPrecoFip: apoliceEditando.veiculo?.precoFip?.toString() ?? "",
      })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [apoliceEditando])

  const atualizarCampo = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = evento.target
    const formatadores: Record<string, (valor: string) => string> = {
      usuarioCpf: formatarCpf,
      veiculoPlaca: formatarPlaca,
      veiculoAno: (valor) => limitarNumeroInteiro(valor, 4),
      veiculoMarca: (valor) => limitarTexto(valor, 40),
      veiculoModelo: (valor) => limitarTexto(valor, 60),
      mensalidade: (valor) => limitarTexto(valor, 12),
      valorFranquia: (valor) => limitarTexto(valor, 12),
      percentualCobertura: (valor) => limitarTexto(valor, 6),
      veiculoPrecoFip: (valor) => limitarTexto(valor, 16),
    }

    setFormData({
      ...formData,
      [name]: formatadores[name]?.(value) ?? value,
    })
  }

  async function salvarApolice(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return

    setSalvando(true)

    const veiculoParaEnviar = {
      placa: formData.veiculoPlaca.toUpperCase(),
      marca: formData.veiculoMarca,
      modelo: formData.veiculoModelo,
      ano: Number(formData.veiculoAno),
      precoFip: obterValorMonetario(formData.veiculoPrecoFip),
    }

    const dadosParaEnviar = {
      dataInicio: formData.dataInicio,
      mensalidade: Number(formData.mensalidade),
      status: formData.status,
      percentualCobertura: Number(formData.percentualCobertura),
      valorFranquia: Number(formData.valorFranquia),
      usuario: {
        cpf: apenasNumeros(formData.usuarioCpf),
      },
      veiculo: {
        placa: veiculoParaEnviar.placa,
      },
    }

    try {
      let apoliceSalva: Apolice

      if (apoliceEditando) {
        apoliceSalva = await atualizar(
          `/apolices/${apoliceEditando.id}`,
          { id: apoliceEditando.id, ...dadosParaEnviar },
          () => { },
          obterHeaderAutenticado()
        )
        toast.success("Apólice atualizada com sucesso!")
      } else {
        try {
          await api.get(`/veiculos/${veiculoParaEnviar.placa}`, obterHeaderAutenticado())
        } catch (error) {
          if (!erroNaoEncontrado(error)) throw error

          try {
            await cadastrar("/veiculos", veiculoParaEnviar, () => { }, obterHeaderAutenticado())
          } catch (erroCadastroVeiculo) {
            const detalhe = obterDetalheErro(erroCadastroVeiculo)
            throw new Error(
              detalhe
                ? `Erro ao cadastrar veículo: ${detalhe}`
                : "Erro ao cadastrar veículo antes da apólice."
            )
          }
        }

        // try {
        //   apoliceSalva = await cadastrar("/apolices", dadosParaEnviar, () => { }, obterHeaderAutenticado())
        // } catch (erroCadastroApolice) {
        //   const detalhe = obterDetalheErro(erroCadastroApolice)
        //   throw new Error(
        //     detalhe
        //       ? `Erro ao cadastrar apólice: ${detalhe}`
        //       : "Erro ao cadastrar apólice."
        //   )
        // }

        try {
          apoliceSalva = await cadastrar("/apolices", dadosParaEnviar, () => { }, obterHeaderAutenticado())
        } catch (erroCadastroApolice) {
          // Captura erros do Axios para isolar a validação do CPF
          if (axios.isAxiosError(erroCadastroApolice)) {
            const status = erroCadastroApolice.response?.status
            const msgBackEnd = String(erroCadastroApolice.response?.data?.message || "").toLowerCase()

            // 1. Captura erros normais do NestJS (404 ou 400)
            if (status === 404 || (status === 400 && (msgBackEnd.includes("usuario") || msgBackEnd.includes("cpf") || msgBackEnd.includes("cliente")))) {
              toast.warning("O CPF informado não pertence a nenhum cliente cadastrado!")
              throw new Error("CPF do cliente não cadastrado.")
            }

            // 2. Intercepta o Erro 500 que o banco estourou por causa do CPF incorreto
            if (status === 500) {
              // toast.error("Erro interno no servidor. Verifique se o CPF do cliente está correto e cadastrado!")
              throw new Error("Falha no servidor ao associar a apólice. Verifique o CPF.")
            }
          }

          const detalhe = obterDetalheErro(erroCadastroApolice)
          throw new Error(
            detalhe ? `Erro ao cadastrar apólice: ${detalhe}` : "Erro ao cadastrar apólice."
          )
        }

        adicionarApolice(apoliceSalva)
        toast.success("Apólice cadastrada com sucesso!")
      }

      await atualizarListagem()
      fecharModal()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : obterMensagemErro(error))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-white/10 bg-[#16151E] p-6 text-[#FAFAFA] shadow-2xl font-['Inter']">
        {/* Header do Modal */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#22D3EE]">
              Apólice
            </span>
            <h2 className="mt-2 text-2xl font-bold text-[#FAFAFA]">
              {apoliceEditando ? "Editar apólice" : "Nova apólice"}
            </h2>
          </div>

          <button
            type="button"
            onClick={fecharModal}
            disabled={salvando}
            className="rounded-md p-2 text-[#A1A1AA] transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
            aria-label="Fechar formulário"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={salvarApolice} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
              Data de início
            </label>
            <input
              type="date"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={atualizarCampo}
              required
              disabled={salvando}
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
              Mensalidade
            </label>
            <input
              type="number"
              name="mensalidade"
              placeholder="R$ 0,00"
              value={formData.mensalidade}
              onChange={atualizarCampo}
              min="0"
              step="0.01"
              maxLength={12}
              required
              disabled={salvando}
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
              Percentual de cobertura (%)
            </label>
            <input
              type="number"
              name="percentualCobertura"
              placeholder="000"
              value={formData.percentualCobertura}
              onChange={atualizarCampo}
              min="0"
              max="100"
              step="0.01"
              maxLength={6}
              required
              disabled={salvando}
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#FF4FD8] focus:shadow-[0_0_15px_rgba(255,79,216,0.3)] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
              Valor da franquia
            </label>
            <input
              type="number"
              name="valorFranquia"
              placeholder="R$ 0,00"
              value={formData.valorFranquia}
              onChange={atualizarCampo}
              min="0"
              step="0.01"
              maxLength={12}
              required
              disabled={salvando}
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
              CPF do cliente
            </label>
            <input
              type="text"
              name="usuarioCpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={formData.usuarioCpf}
              onChange={atualizarCampo}
              maxLength={14}
              required
              disabled={salvando}
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                Placa
              </label>
              <input
                type="text"
                name="veiculoPlaca"
                placeholder="ABC1D23"
                value={formData.veiculoPlaca}
                onChange={atualizarCampo}
                maxLength={7}
                required
                disabled={salvando}
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm uppercase text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                Ano
              </label>
              <input
                type="number"
                name="veiculoAno"
                placeholder="2024"
                value={formData.veiculoAno}
                onChange={atualizarCampo}
                min="1900"
                max="2099"
                maxLength={4}
                required
                disabled={salvando}
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                Marca
              </label>
              <input
                type="text"
                name="veiculoMarca"
                placeholder="Honda"
                value={formData.veiculoMarca}
                onChange={atualizarCampo}
                maxLength={40}
                required
                disabled={salvando}
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#FF4FD8] focus:shadow-[0_0_15px_rgba(255,79,216,0.3)] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                Modelo
              </label>
              <input
                type="text"
                name="veiculoModelo"
                placeholder="Civic"
                value={formData.veiculoModelo}
                onChange={atualizarCampo}
                maxLength={60}
                required
                disabled={salvando}
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#FF4FD8] focus:shadow-[0_0_15px_rgba(255,79,216,0.3)] disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
              Preço FIPE
            </label>
            <input
              type="text"
              inputMode="decimal"
              name="veiculoPrecoFip"
              placeholder="Digite o valor FIPE"
              value={formData.veiculoPrecoFip}
              onChange={atualizarCampo}
              maxLength={16}
              required
              disabled={salvando}
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={atualizarCampo}
              disabled={salvando}
              className="h-11 w-full appearance-none rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"            >
              <option value="Ativa" className="bg-[#16151E] text-[#FAFAFA]">Ativa</option>
              <option value="Pendente" className="bg-[#16151E] text-[#FAFAFA]">Pendente</option>
              <option value="Cancelada" className="bg-[#16151E] text-[#FAFAFA]">Cancelada</option>
            </select>
          </div>

          {/* Botões de Ação */}
          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={fecharModal}
              disabled={salvando}
              className="h-11 rounded-md border border-white/10 px-5 text-sm uppercase font-bold text-[#A1A1AA] transition hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="h-11 min-w-[140px] inline-flex items-center justify-center rounded-md border border-[#22D3EE]/25 bg-[#F0F2F4]/[0.035] px-5 text-center text-sm font-black shadow-[0_0_15px_rgba(34,211,238,0.05)] transition duration-200 hover:border-[#22D3EE]/45 hover:bg-[#F0F2F4]/[0.055] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {salvando ? (
                <CircleNotch size={18} weight="bold" className="animate-spin text-[#22D3EE]" />
              ) : (
                <span className="animated-gradient-text uppercase tracking-[0.08rem] font-bold">
                  {apoliceEditando ? 'Salvar' : 'Cadastrar'}
                </span>
              )}
            </button>

            {/* <button
              type="submit"
              disabled={salvando}
              className="h-11 rounded-md bg-[#D946EF] px-5 text-sm font-bold text-white transition duration-300 ease-out hover:scale-105 hover:bg-[#FF4FD8] hover:shadow-[0_0_20px_rgba(217,70,239,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button> */}
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormApolice

