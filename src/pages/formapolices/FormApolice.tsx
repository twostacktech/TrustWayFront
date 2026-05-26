import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { CircleNotch, X } from "@phosphor-icons/react"

import { api, atualizar, cadastrar, obterHeaderAutenticado } from "../../services/Service"
import type Apolice from "../../models/Apolice"

const FIPE_API_ROOT = "https://parallelum.com.br/fipe/api/v1"
const FATOR_MENSALIDADE_BASE = 0.0042
const PERCENTUAL_COBERTURA_PADRAO = 80

type TipoVeiculoFipe = "carros" | "motos"

type MarcaFipe = {
  codigo: string
  nome: string
}

type ModeloFipe = {
  codigo: number
  nome: string
}

type AnoFipe = {
  codigo: string
  nome: string
}

type PrecoFipe = {
  Valor: string
  Marca: string
  Modelo: string
  AnoModelo: number
  CodigoFipe: string
}

type ComboboxOption = {
  value: string
  label: string
}

type FormApoliceProps = {
  fecharModal: () => void
  atualizarListagem: () => Promise<void> | void
  adicionarApolice: (apolice: Apolice) => void
  apoliceEditando?: Apolice | null
}

const obterMensagemErro = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const mensagem = error.response?.data?.message

    if (Array.isArray(mensagem)) return mensagem.join(" ")
    if (typeof mensagem === "string") return mensagem
    if (error.response?.status) return `Erro ${error.response.status} ao salvar apólice.`
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

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)

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

const obterFipeApiBase = (tipoVeiculo: TipoVeiculoFipe) =>
  `${FIPE_API_ROOT}/${tipoVeiculo}`

const normalizarBusca = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

function FipeCombobox({
  value,
  inputValue,
  options,
  placeholder,
  disabled = false,
  onInputChange,
  onSelect,
}: {
  value: string
  inputValue: string
  options: ComboboxOption[]
  placeholder: string
  disabled?: boolean
  onInputChange: (value: string) => void
  onSelect: (option: ComboboxOption) => void
}) {
  const [aberto, setAberto] = useState(false)
  const buscaNormalizada = normalizarBusca(inputValue)
  const opcoesFiltradas = options
    .filter((option) => normalizarBusca(option.label).includes(buscaNormalizada))
    .slice(0, 18)

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        required
        onFocus={() => setAberto(true)}
        onChange={(event) => {
          onInputChange(event.target.value)
          setAberto(true)
        }}
        onBlur={() => {
          window.setTimeout(() => setAberto(false), 120)
        }}
        className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none transition-all focus:border-[#FF4FD8] focus:shadow-[0_0_15px_rgba(255,79,216,0.3)] disabled:opacity-50"
      />

      {aberto && !disabled && inputValue && (
        <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-30 grid max-h-52 overflow-y-auto rounded-md border border-white/10 bg-[#111018] p-1 shadow-2xl">
          {opcoesFiltradas.length > 0 ? (
            opcoesFiltradas.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`rounded px-3 py-2 text-left text-sm font-bold transition hover:bg-white/[0.08] ${
                  value === option.value ? "bg-white/[0.08] text-[#22D3EE]" : "text-[#FAFAFA]/80"
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(option)
                  setAberto(false)
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <span className="px-3 py-2 text-sm font-bold text-[#A1A1AA]">
              Nenhuma opção encontrada
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function FormApolice({
  fecharModal,
  atualizarListagem,
  adicionarApolice,
  apoliceEditando,
}: FormApoliceProps) {
  const [salvando, setSalvando] = useState(false)
  const [carregandoFipe, setCarregandoFipe] = useState(false)
  const [erroFipe, setErroFipe] = useState("")
  const [marcasFipe, setMarcasFipe] = useState<MarcaFipe[]>([])
  const [modelosFipe, setModelosFipe] = useState<ModeloFipe[]>([])
  const [anosFipe, setAnosFipe] = useState<AnoFipe[]>([])
  const [tipoVeiculoFipe, setTipoVeiculoFipe] = useState<TipoVeiculoFipe>("carros")
  const [codigoMarcaSelecionada, setCodigoMarcaSelecionada] = useState("")
  const [codigoModeloSelecionado, setCodigoModeloSelecionado] = useState("")
  const [codigoAnoSelecionado, setCodigoAnoSelecionado] = useState("")
  const [buscaFipe, setBuscaFipe] = useState({
    marca: "",
    modelo: "",
    ano: "",
  })

  const [formData, setFormData] = useState({
    dataInicio: "",
    mensalidade: "",
    status: "Ativa",
    percentualCobertura: String(PERCENTUAL_COBERTURA_PADRAO),
    valorFranquia: "",
    usuarioCpf: "",
    veiculoPlaca: "",
    veiculoMarca: "",
    veiculoModelo: "",
    veiculoAno: "",
    veiculoPrecoFip: "",
  })

  const opcoesMarca = marcasFipe.map((marca) => ({
    value: marca.codigo,
    label: marca.nome,
  }))
  const opcoesModelo = modelosFipe.map((modelo) => ({
    value: String(modelo.codigo),
    label: modelo.nome,
  }))
  const opcoesAno = anosFipe.map((ano) => ({
    value: ano.codigo,
    label: ano.nome,
  }))

  const valorFipeNumerico = obterValorMonetario(formData.veiculoPrecoFip)
  const percentualCoberturaNumerico =
    Number(formData.percentualCobertura) || PERCENTUAL_COBERTURA_PADRAO
  const fatorCobertura = percentualCoberturaNumerico / 100
  const anoVeiculoNumerico = Number(formData.veiculoAno)
  const temDescontoAntiguidade =
    Boolean(anoVeiculoNumerico) && new Date().getFullYear() - anoVeiculoNumerico > 10
  const mensalidadeOriginal = valorFipeNumerico * FATOR_MENSALIDADE_BASE * fatorCobertura
  const mensalidadeFinal = temDescontoAntiguidade
    ? mensalidadeOriginal * 0.8
    : mensalidadeOriginal
  const valorFranquiaCalculado = valorFipeNumerico * 0.05 * fatorCobertura

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
      setBuscaFipe({
        marca: apoliceEditando.veiculo?.marca ?? "",
        modelo: apoliceEditando.veiculo?.modelo ?? "",
        ano: apoliceEditando.veiculo?.ano?.toString() ?? "",
      })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [apoliceEditando])

  useEffect(() => {
    async function buscarMarcasFipe() {
      try {
        setCarregandoFipe(true)
        setErroFipe("")
        const resposta = await fetch(`${obterFipeApiBase(tipoVeiculoFipe)}/marcas`)
        if (!resposta.ok) throw new Error("Erro ao buscar marcas FIPE")
        const marcas = (await resposta.json()) as MarcaFipe[]
        setMarcasFipe(marcas)
      } catch (error) {
        console.error("Erro ao buscar marcas FIPE:", error)
        setErroFipe("Não foi possível carregar marcas FIPE agora.")
      } finally {
        setCarregandoFipe(false)
      }
    }

    buscarMarcasFipe()
  }, [tipoVeiculoFipe])

  useEffect(() => {
    if (!valorFipeNumerico) return

    const proximaMensalidade = mensalidadeFinal.toFixed(2)
    const proximaFranquia = valorFranquiaCalculado.toFixed(2)

    setFormData((atual) => {
      if (
        atual.mensalidade === proximaMensalidade &&
        atual.valorFranquia === proximaFranquia
      ) {
        return atual
      }

      return {
        ...atual,
        mensalidade: proximaMensalidade,
        valorFranquia: proximaFranquia,
      }
    })
  }, [valorFipeNumerico, mensalidadeFinal, valorFranquiaCalculado])

  async function buscarModelosFipe(codigoMarca: string) {
    if (!codigoMarca) return

    try {
      setCarregandoFipe(true)
      setErroFipe("")
      const resposta = await fetch(
        `${obterFipeApiBase(tipoVeiculoFipe)}/marcas/${codigoMarca}/modelos`
      )
      if (!resposta.ok) throw new Error("Erro ao buscar modelos FIPE")
      const dados = (await resposta.json()) as { modelos: ModeloFipe[] }
      setModelosFipe(dados.modelos)
    } catch (error) {
      console.error("Erro ao buscar modelos FIPE:", error)
      setErroFipe("Não foi possível carregar modelos desta marca.")
    } finally {
      setCarregandoFipe(false)
    }
  }

  async function buscarAnosFipe(codigoModelo: string) {
    if (!codigoModelo || !codigoMarcaSelecionada) return

    try {
      setCarregandoFipe(true)
      setErroFipe("")
      const resposta = await fetch(
        `${obterFipeApiBase(tipoVeiculoFipe)}/marcas/${codigoMarcaSelecionada}/modelos/${codigoModelo}/anos`
      )
      if (!resposta.ok) throw new Error("Erro ao buscar anos FIPE")
      const anos = (await resposta.json()) as AnoFipe[]
      setAnosFipe(anos)
    } catch (error) {
      console.error("Erro ao buscar anos FIPE:", error)
      setErroFipe("Não foi possível carregar os anos deste modelo.")
    } finally {
      setCarregandoFipe(false)
    }
  }

  async function buscarPrecoFipe(codigoAno: string) {
    if (!codigoAno || !codigoMarcaSelecionada || !codigoModeloSelecionado) return

    try {
      setCarregandoFipe(true)
      setErroFipe("")
      const resposta = await fetch(
        `${obterFipeApiBase(tipoVeiculoFipe)}/marcas/${codigoMarcaSelecionada}/modelos/${codigoModeloSelecionado}/anos/${codigoAno}`
      )
      if (!resposta.ok) throw new Error("Erro ao buscar preço FIPE")
      const preco = (await resposta.json()) as PrecoFipe
      setFormData((atual) => ({
        ...atual,
        veiculoAno: String(preco.AnoModelo),
        veiculoPrecoFip: preco.Valor,
      }))
    } catch (error) {
      console.error("Erro ao buscar preço FIPE:", error)
      setErroFipe("Não foi possível carregar o preço FIPE deste veículo.")
    } finally {
      setCarregandoFipe(false)
    }
  }

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
                : "Erro ao cadastrar veículo antes da apólice.",
              { cause: erroCadastroVeiculo }
            )
          }
        }

        try {
          apoliceSalva = await cadastrar("/apolices", dadosParaEnviar, () => { }, obterHeaderAutenticado())
        } catch (erroCadastroApolice) {
          if (axios.isAxiosError(erroCadastroApolice)) {
            const status = erroCadastroApolice.response?.status
            const msgBackEnd = String(erroCadastroApolice.response?.data?.message || "").toLowerCase()

            if (status === 404 || (status === 400 && (msgBackEnd.includes("usuario") || msgBackEnd.includes("cpf") || msgBackEnd.includes("cliente")))) {
              toast.warning("O CPF informado não pertence a nenhum cliente cadastrado!")
              throw new Error("CPF do cliente não cadastrado.", { cause: erroCadastroApolice })
            }

            if (status === 500) {
              throw new Error("Falha no servidor ao associar a apólice. Verifique o CPF.", { cause: erroCadastroApolice })
            }
          }

          const detalhe = obterDetalheErro(erroCadastroApolice)
          throw new Error(
            detalhe ? `Erro ao cadastrar apólice: ${detalhe}` : "Erro ao cadastrar apólice.",
            { cause: erroCadastroApolice }
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
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-md border border-white/10 bg-[#16151E] p-6 text-[#FAFAFA] shadow-2xl font-['Inter']">
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

        <form onSubmit={salvarApolice} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">CPF do cliente</span>
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
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Data de início</span>
              <input
                type="date"
                name="dataInicio"
                value={formData.dataInicio}
                onChange={atualizarCampo}
                required
                disabled={salvando}
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 [color-scheme:dark]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[0.7fr_1.3fr]">
            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Tipo de veículo</span>
              <select
                value={tipoVeiculoFipe}
                onChange={(evento) => {
                  const tipoVeiculo = evento.target.value as TipoVeiculoFipe
                  setTipoVeiculoFipe(tipoVeiculo)
                  setCodigoMarcaSelecionada("")
                  setCodigoModeloSelecionado("")
                  setCodigoAnoSelecionado("")
                  setModelosFipe([])
                  setAnosFipe([])
                  setBuscaFipe({ marca: "", modelo: "", ano: "" })
                  setFormData((atual) => ({
                    ...atual,
                    veiculoMarca: "",
                    veiculoModelo: "",
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                }}
                disabled={salvando || carregandoFipe}
                className="h-11 w-full appearance-none rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
              >
                <option value="carros" className="bg-[#16151E] text-[#FAFAFA]">Carro</option>
                <option value="motos" className="bg-[#16151E] text-[#FAFAFA]">Moto</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Placa</span>
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
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Marca</span>
              <FipeCombobox
                value={codigoMarcaSelecionada}
                inputValue={buscaFipe.marca}
                options={opcoesMarca}
                placeholder="Digite ou selecione a marca"
                disabled={salvando || carregandoFipe || marcasFipe.length === 0}
                onInputChange={(value) => {
                  setBuscaFipe({ marca: value, modelo: "", ano: "" })
                  setCodigoMarcaSelecionada("")
                  setCodigoModeloSelecionado("")
                  setCodigoAnoSelecionado("")
                  setModelosFipe([])
                  setAnosFipe([])
                  setFormData((atual) => ({
                    ...atual,
                    veiculoMarca: "",
                    veiculoModelo: "",
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                }}
                onSelect={(option) => {
                  setBuscaFipe({ marca: option.label, modelo: "", ano: "" })
                  setCodigoMarcaSelecionada(option.value)
                  setCodigoModeloSelecionado("")
                  setCodigoAnoSelecionado("")
                  setModelosFipe([])
                  setAnosFipe([])
                  setFormData((atual) => ({
                    ...atual,
                    veiculoMarca: option.label,
                    veiculoModelo: "",
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                  buscarModelosFipe(option.value)
                }}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Modelo</span>
              <FipeCombobox
                value={codigoModeloSelecionado}
                inputValue={buscaFipe.modelo}
                options={opcoesModelo}
                placeholder={codigoMarcaSelecionada ? "Digite ou selecione o modelo" : "Escolha uma marca primeiro"}
                disabled={salvando || carregandoFipe || modelosFipe.length === 0}
                onInputChange={(value) => {
                  setBuscaFipe((atual) => ({ ...atual, modelo: value, ano: "" }))
                  setCodigoModeloSelecionado("")
                  setCodigoAnoSelecionado("")
                  setAnosFipe([])
                  setFormData((atual) => ({
                    ...atual,
                    veiculoModelo: "",
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                }}
                onSelect={(option) => {
                  setBuscaFipe((atual) => ({ ...atual, modelo: option.label, ano: "" }))
                  setCodigoModeloSelecionado(option.value)
                  setCodigoAnoSelecionado("")
                  setAnosFipe([])
                  setFormData((atual) => ({
                    ...atual,
                    veiculoModelo: option.label,
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                  buscarAnosFipe(option.value)
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Ano</span>
              <FipeCombobox
                value={codigoAnoSelecionado}
                inputValue={buscaFipe.ano}
                options={opcoesAno}
                placeholder={codigoModeloSelecionado ? "Digite ou selecione o ano" : "Escolha um modelo primeiro"}
                disabled={salvando || carregandoFipe || anosFipe.length === 0}
                onInputChange={(value) => {
                  setBuscaFipe((atual) => ({ ...atual, ano: value }))
                  setCodigoAnoSelecionado("")
                  setFormData((atual) => ({
                    ...atual,
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                }}
                onSelect={(option) => {
                  setBuscaFipe((atual) => ({ ...atual, ano: option.label }))
                  setCodigoAnoSelecionado(option.value)
                  setFormData((atual) => ({
                    ...atual,
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                  buscarPrecoFipe(option.value)
                }}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Preço FIPE</span>
              <input
                type="text"
                value={formData.veiculoPrecoFip ? valorFipeNumerico.toFixed(2) : ""}
                placeholder="Escolha um ano primeiro"
                readOnly
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] outline-none"
              />
            </label>
          </div>

          {erroFipe && (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {erroFipe}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Mensalidade</span>
              <input
                type="number"
                name="mensalidade"
                value={formData.mensalidade}
                onChange={atualizarCampo}
                min="0"
                step="0.01"
                required
                disabled={salvando}
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Percentual de cobertura (%)</span>
              <input
                type="number"
                name="percentualCobertura"
                value={formData.percentualCobertura}
                onChange={atualizarCampo}
                min="0"
                max="100"
                step="0.01"
                required
                disabled={salvando}
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all focus:border-[#FF4FD8] focus:shadow-[0_0_15px_rgba(255,79,216,0.3)] disabled:opacity-50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Valor da franquia</span>
              <input
                type="number"
                name="valorFranquia"
                value={formData.valorFranquia}
                onChange={atualizarCampo}
                min="0"
                step="0.01"
                required
                disabled={salvando}
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
              />
            </label>
          </div>

          {valorFipeNumerico > 0 && (
            <div className="rounded-md border border-[#22D3EE]/20 bg-[#0f1720]/80 p-5 shadow-[0_0_20px_rgba(34,211,238,0.08)]">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <span className="block text-sm font-bold text-[#A1A1AA]">Valor FIPE</span>
                  <strong className="mt-1 block text-base text-[#FAFAFA]">
                    {formatarMoeda(valorFipeNumerico)}
                  </strong>
                </div>

                <div>
                  <span className="block text-sm font-bold text-[#A1A1AA]">Mensalidade</span>
                  {temDescontoAntiguidade && (
                    <div className="mt-1 flex items-center gap-2">
                      <strong className="text-sm text-[#FAFAFA]/45 line-through decoration-[#FAFAFA]/55 decoration-2">
                        {formatarMoeda(mensalidadeOriginal)}
                      </strong>
                      <span className="rounded-md border border-[#22D3EE]/35 bg-[#22D3EE]/10 px-2 py-0.5 text-xs font-black text-[#22D3EE]">
                        -20%
                      </span>
                    </div>
                  )}
                  <strong className="mt-1 block text-base text-[#FAFAFA]">
                    {formatarMoeda(mensalidadeFinal)}
                  </strong>
                </div>
              </div>

              {temDescontoAntiguidade && (
                <p className="mt-5 text-xs font-bold text-[#FAFAFA]/70">
                  *Desconto aplicado para veículos com mais de 10 anos.
                </p>
              )}

              <div className="mt-5">
                <span className="block text-sm font-bold text-[#A1A1AA]">Franquia</span>
                <strong className="mt-1 block text-base text-[#FAFAFA]">
                  {formatarMoeda(valorFranquiaCalculado)}
                </strong>
              </div>
            </div>
          )}

          <label>
            <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">Status</span>
            <select
              name="status"
              value={formData.status}
              onChange={atualizarCampo}
              disabled={salvando}
              className="h-11 w-full appearance-none rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
            >
              <option value="Ativa" className="bg-[#16151E] text-[#FAFAFA]">Ativa</option>
              <option value="Pendente" className="bg-[#16151E] text-[#FAFAFA]">Pendente</option>
              <option value="Cancelada" className="bg-[#16151E] text-[#FAFAFA]">Cancelada</option>
            </select>
          </label>

          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={fecharModal}
              disabled={salvando}
              className="h-11 rounded-md border border-white/10 px-5 text-sm font-bold uppercase text-[#A1A1AA] transition hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-md border border-[#22D3EE]/25 bg-[#F0F2F4]/[0.035] px-5 text-center text-sm font-black shadow-[0_0_15px_rgba(34,211,238,0.05)] transition duration-200 hover:border-[#22D3EE]/45 hover:bg-[#F0F2F4]/[0.055] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {salvando ? (
                <CircleNotch size={18} weight="bold" className="animate-spin text-[#22D3EE]" />
              ) : (
                <span className="animated-gradient-text font-bold uppercase tracking-[0.08rem]">
                  {apoliceEditando ? "Salvar" : "Cadastrar"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormApolice
