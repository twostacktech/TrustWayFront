import { useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { CircleNotch, X } from "@phosphor-icons/react"

import { api, atualizar, cadastrar, obterHeaderAutenticado } from "../../services/Service"
import type Apolice from "../../models/Apolice"

const FIPE_API_BASE = "https://parallelum.com.br/fipe/api/v1/carros"
const PERCENTUAL_COBERTURA_PADRAO = 80

type MarcaFipe = {
  codigo: string
  nome: string
}

type ModeloFipe = {
  codigo: number
  nome: string
}

type ModelosFipeResponse = {
  modelos: ModeloFipe[]
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
  MesReferencia: string
}

type ComboboxOption = {
  value: string
  label: string
}

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

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)

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

const obterValorNumericoFipe = (valor: string) =>
  Number(valor.replace(/\./g, "").replace(/[^\d,]/g, "").replace(",", "."))

const apenasNumeros = (valor: string) => valor.replace(/\D/g, "")

const limitarTexto = (valor: string, limite: number) => valor.slice(0, limite)

const limitarNumeroInteiro = (valor: string, limite: number) =>
  apenasNumeros(valor).slice(0, limite)

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

const normalizarNomeMarca = (nome: string) =>
  nome === "GM - Chevrolet" ? "Chevrolet" : nome

const normalizarBusca = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

function Combobox({
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
    .slice(0, 12)

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onFocus={() => setAberto(true)}
        onChange={(event) => {
          onInputChange(event.target.value)
          setAberto(true)
        }}
        onBlur={() => {
          window.setTimeout(() => setAberto(false), 120)
        }}
        className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
      />

      {aberto && !disabled && inputValue && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 max-h-56 overflow-y-auto rounded-md border border-[#22D3EE]/25 bg-[#0b0b10] p-1 shadow-2xl">
          {opcoesFiltradas.length > 0 ? (
            opcoesFiltradas.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`block w-full rounded px-3 py-2 text-left text-sm transition ${
                  value === option.value
                    ? "bg-[#22D3EE]/15 text-[#22D3EE]"
                    : "text-[#FAFAFA] hover:bg-white/[0.06]"
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
            <span className="block px-3 py-2 text-sm text-[#A1A1AA]">
              Nenhuma opção encontrada
            </span>
          )}
        </div>
      )}
    </div>
  )
}

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
  const [carregandoFipe, setCarregandoFipe] = useState(false)
  const [erroFipe, setErroFipe] = useState("")
  const [marcasFipe, setMarcasFipe] = useState<MarcaFipe[]>([])
  const [modelosFipe, setModelosFipe] = useState<ModeloFipe[]>([])
  const [anosFipe, setAnosFipe] = useState<AnoFipe[]>([])
  const [fipeSelecionada, setFipeSelecionada] = useState({
    marca: "",
    modelo: "",
    ano: "",
  })
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
    label: normalizarNomeMarca(marca.nome),
  }))
  const opcoesModelo = modelosFipe.map((modelo) => ({
    value: String(modelo.codigo),
    label: modelo.nome,
  }))
  const opcoesAno = anosFipe.map((ano) => ({
    value: ano.codigo,
    label: ano.nome,
  }))

  const veiculoComDescontoAntiguidade =
    formData.veiculoAno ? new Date().getFullYear() - Number(formData.veiculoAno) > 10 : false
  const valorFipeAtual = obterValorMonetario(formData.veiculoPrecoFip)
  const percentualCoberturaAtual = Number(formData.percentualCobertura) || PERCENTUAL_COBERTURA_PADRAO
  const mensalidadeSemDesconto = Math.max(
    49.9,
    valorFipeAtual * 0.0042 * (percentualCoberturaAtual / 100)
  )

  const preencherValoresCalculados = (valorFipe: number, percentual: string, anoModelo?: number) => {
    const percentualNumerico = Number(percentual) || PERCENTUAL_COBERTURA_PADRAO
    const fatorCobertura = percentualNumerico / 100
    const mensalidade = Math.max(49.9, valorFipe * 0.0042 * fatorCobertura)
    const mensalidadeComDesconto =
      anoModelo && new Date().getFullYear() - anoModelo > 10 ? mensalidade * 0.8 : mensalidade
    const franquia = valorFipe * 0.05 * fatorCobertura

    return {
      mensalidade: mensalidadeComDesconto.toFixed(2),
      valorFranquia: franquia.toFixed(2),
    }
  }

  useEffect(() => {
    async function buscarMarcas() {
      try {
        setErroFipe("")
        const resposta = await fetch(`${FIPE_API_BASE}/marcas`)
        if (!resposta.ok) throw new Error("Erro ao buscar marcas")
        const marcas = (await resposta.json()) as MarcaFipe[]
        setMarcasFipe(marcas)
      } catch (error) {
        console.error("Erro ao buscar marcas FIPE:", error)
        setErroFipe("Não foi possível carregar as marcas agora.")
      }
    }

    buscarMarcas()
  }, [])

  useEffect(() => {
    async function buscarModelos() {
      if (!fipeSelecionada.marca) {
        setModelosFipe([])
        return
      }

      try {
        setCarregandoFipe(true)
        setErroFipe("")
        const resposta = await fetch(`${FIPE_API_BASE}/marcas/${fipeSelecionada.marca}/modelos`)
        if (!resposta.ok) throw new Error("Erro ao buscar modelos")
        const dados = (await resposta.json()) as ModelosFipeResponse
        setModelosFipe(dados.modelos)
      } catch (error) {
        console.error("Erro ao buscar modelos FIPE:", error)
        setErroFipe("Não foi possível carregar os modelos desta marca.")
      } finally {
        setCarregandoFipe(false)
      }
    }

    buscarModelos()
  }, [fipeSelecionada.marca])

  useEffect(() => {
    async function buscarAnos() {
      if (!fipeSelecionada.modelo) {
        setAnosFipe([])
        return
      }

      try {
        setCarregandoFipe(true)
        setErroFipe("")
        const resposta = await fetch(
          `${FIPE_API_BASE}/marcas/${fipeSelecionada.marca}/modelos/${fipeSelecionada.modelo}/anos`
        )
        if (!resposta.ok) throw new Error("Erro ao buscar anos")
        const anos = (await resposta.json()) as AnoFipe[]
        setAnosFipe(anos)
      } catch (error) {
        console.error("Erro ao buscar anos FIPE:", error)
        setErroFipe("Não foi possível carregar os anos deste modelo.")
      } finally {
        setCarregandoFipe(false)
      }
    }

    buscarAnos()
  }, [fipeSelecionada.marca, fipeSelecionada.modelo])

  useEffect(() => {
    async function buscarPreco() {
      if (!fipeSelecionada.marca || !fipeSelecionada.modelo || !fipeSelecionada.ano) {
        return
      }

      try {
        setCarregandoFipe(true)
        setErroFipe("")
        const resposta = await fetch(
          `${FIPE_API_BASE}/marcas/${fipeSelecionada.marca}/modelos/${fipeSelecionada.modelo}/anos/${fipeSelecionada.ano}`
        )
        if (!resposta.ok) throw new Error("Erro ao buscar preço FIPE")
        const preco = (await resposta.json()) as PrecoFipe
        const valorFipe = obterValorNumericoFipe(preco.Valor)

        setFormData((atual) => ({
          ...atual,
          ...preencherValoresCalculados(valorFipe, atual.percentualCobertura, preco.AnoModelo),
          veiculoMarca: preco.Marca,
          veiculoModelo: preco.Modelo,
          veiculoAno: String(preco.AnoModelo),
          veiculoPrecoFip: valorFipe.toFixed(2),
        }))
      } catch (error) {
        console.error("Erro ao buscar preço FIPE:", error)
        setErroFipe("Não foi possível carregar o valor FIPE deste veículo.")
      } finally {
        setCarregandoFipe(false)
      }
    }

    buscarPreco()
  }, [fipeSelecionada.marca, fipeSelecionada.modelo, fipeSelecionada.ano])

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

  const atualizarCampo = (evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    setFormData((atual) => {
      const novoValor = formatadores[name]?.(value) ?? value
      const novosDados = {
        ...atual,
        [name]: novoValor,
      }

      if (name === "percentualCobertura" && atual.veiculoPrecoFip) {
        return {
          ...novosDados,
          ...preencherValoresCalculados(
            obterValorMonetario(atual.veiculoPrecoFip),
            novoValor,
            Number(atual.veiculoAno)
          ),
        }
      }

      return novosDados
    })
  }

  async function sincronizarVeiculo(veiculoParaEnviar: {
    placa: string
    marca: string
    modelo: string
    ano: number
    precoFip: number
  }) {
    try {
      await api.get(`/veiculos/${veiculoParaEnviar.placa}`, obterHeaderAutenticado())

      try {
        await atualizar(
          `/veiculos/${veiculoParaEnviar.placa}`,
          veiculoParaEnviar,
          () => {},
          obterHeaderAutenticado()
        )
      } catch (erroAtualizacaoVeiculo) {
        console.warn("Não foi possível atualizar os dados do veículo existente:", erroAtualizacaoVeiculo)
      }
    } catch (error) {
      if (!erroNaoEncontrado(error)) throw error

      try {
        await cadastrar("/veiculos", veiculoParaEnviar, () => {}, obterHeaderAutenticado())
      } catch (erroCadastroVeiculo) {
        const detalhe = obterDetalheErro(erroCadastroVeiculo)
        throw new Error(
          detalhe
            ? `Erro ao cadastrar veículo: ${detalhe}`
            : "Erro ao cadastrar veículo antes da apólice."
        )
      }
    }
  }

  async function salvarApolice(evento: FormEvent<HTMLFormElement>) {
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
        await sincronizarVeiculo(veiculoParaEnviar)

        apoliceSalva = await atualizar(
          `/apolices/${apoliceEditando.id}`,
          { id: apoliceEditando.id, ...dadosParaEnviar },
          () => {},
          obterHeaderAutenticado()
        )
        toast.success("Apólice atualizada com sucesso!")
      } else {
        await sincronizarVeiculo(veiculoParaEnviar)

        try {
          apoliceSalva = await cadastrar(
            "/apolices",
            dadosParaEnviar,
            () => {},
            obterHeaderAutenticado()
          )
        } catch (erroCadastroApolice) {
          if (axios.isAxiosError(erroCadastroApolice)) {
            const status = erroCadastroApolice.response?.status
            const msgBackEnd = String(erroCadastroApolice.response?.data?.message || "").toLowerCase()
            const erroDeCliente =
              status === 404 ||
              status === 500 ||
              (status === 400 &&
                (msgBackEnd.includes("usuario") ||
                  msgBackEnd.includes("cpf") ||
                  msgBackEnd.includes("cliente")))

            if (erroDeCliente) {
              throw new Error("O CPF informado nao pertence a nenhum cliente cadastrado.")
            }

            if (
              status === 404 ||
              (status === 400 &&
                (msgBackEnd.includes("usuario") ||
                  msgBackEnd.includes("cpf") ||
                  msgBackEnd.includes("cliente")))
            ) {
              toast.warning("O CPF informado não pertence a nenhum cliente cadastrado!")
              throw new Error("CPF do cliente não cadastrado.")
            }

            if (status === 500) {
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

  const formularioIncompleto =
    !formData.dataInicio ||
    !apenasNumeros(formData.usuarioCpf) ||
    !formData.veiculoPlaca ||
    !formData.veiculoMarca ||
    !formData.veiculoModelo ||
    !formData.veiculoAno ||
    !formData.veiculoPrecoFip ||
    !formData.mensalidade ||
    !formData.percentualCobertura ||
    !formData.valorFranquia

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-white/10 bg-[#16151E] p-6 font-['Inter'] text-[#FAFAFA] shadow-2xl">
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
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
              />
            </div>

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
          </div>

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
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm uppercase text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
            />
          </div>

          <div className="hidden">
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

          <div className="hidden">
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
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
            />
          </div>

          <div className="hidden">
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
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#FF4FD8] focus:shadow-[0_0_15px_rgba(255,79,216,0.3)] disabled:opacity-50"
            />
          </div>

          <div className="hidden">
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
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
            />
          </div>

          <div className="hidden">
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
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
              />
            </div>

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
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm uppercase text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                Marca
              </label>
              <Combobox
                value={fipeSelecionada.marca}
                inputValue={buscaFipe.marca || formData.veiculoMarca}
                options={opcoesMarca}
                placeholder="Digite a marca"
                disabled={salvando}
                onInputChange={(value) => {
                  setBuscaFipe({ marca: value, modelo: "", ano: "" })
                  setFipeSelecionada({ marca: "", modelo: "", ano: "" })
                  setModelosFipe([])
                  setAnosFipe([])
                  setFormData((atual) => ({
                    ...atual,
                    veiculoMarca: limitarTexto(value, 40),
                    veiculoModelo: "",
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                }}
                onSelect={(option) => {
                  setBuscaFipe({ marca: option.label, modelo: "", ano: "" })
                  setFipeSelecionada({ marca: option.value, modelo: "", ano: "" })
                  setModelosFipe([])
                  setAnosFipe([])
                  setFormData((atual) => ({
                    ...atual,
                    veiculoMarca: option.label,
                    veiculoModelo: "",
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                Modelo
              </label>
              <Combobox
                value={fipeSelecionada.modelo}
                inputValue={buscaFipe.modelo || formData.veiculoModelo}
                options={opcoesModelo}
                placeholder={fipeSelecionada.marca ? "Digite o modelo" : "Escolha uma marca primeiro"}
                disabled={!fipeSelecionada.marca || carregandoFipe || salvando}
                onInputChange={(value) => {
                  setBuscaFipe((atual) => ({ ...atual, modelo: value, ano: "" }))
                  setFipeSelecionada((atual) => ({ ...atual, modelo: "", ano: "" }))
                  setAnosFipe([])
                  setFormData((atual) => ({
                    ...atual,
                    veiculoModelo: limitarTexto(value, 60),
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                }}
                onSelect={(option) => {
                  setBuscaFipe((atual) => ({ ...atual, modelo: option.label, ano: "" }))
                  setFipeSelecionada((atual) => ({ ...atual, modelo: option.value, ano: "" }))
                  setAnosFipe([])
                  setFormData((atual) => ({
                    ...atual,
                    veiculoModelo: option.label,
                    veiculoAno: "",
                    veiculoPrecoFip: "",
                  }))
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                Ano
              </label>
              <Combobox
                value={fipeSelecionada.ano}
                inputValue={buscaFipe.ano || formData.veiculoAno}
                options={opcoesAno}
                placeholder={fipeSelecionada.modelo ? "Digite o ano" : "Escolha um modelo primeiro"}
                disabled={!fipeSelecionada.modelo || carregandoFipe || salvando}
                onInputChange={(value) => {
                  setBuscaFipe((atual) => ({ ...atual, ano: value }))
                  setFipeSelecionada((atual) => ({ ...atual, ano: "" }))
                  setFormData((atual) => ({
                    ...atual,
                    veiculoAno: limitarNumeroInteiro(value, 4),
                    veiculoPrecoFip: "",
                  }))
                }}
                onSelect={(option) => {
                  setBuscaFipe((atual) => ({ ...atual, ano: option.label }))
                  setFipeSelecionada((atual) => ({ ...atual, ano: option.value }))
                }}
              />
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
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
              />
            </div>
          </div>

          {erroFipe && <p className="text-sm font-semibold text-red-300">{erroFipe}</p>}

          {carregandoFipe && (
            <p className="text-sm font-semibold text-[#22D3EE]">Carregando dados FIPE...</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
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
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#FF4FD8] focus:shadow-[0_0_15px_rgba(255,79,216,0.3)] disabled:opacity-50"
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
                className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all placeholder:text-[#A1A1AA] focus:border-[#22D3EE] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
              />
            </div>
          </div>

          {formData.veiculoPrecoFip && formData.mensalidade && formData.valorFranquia && (
            <div className="grid gap-3 rounded-md border border-[#22D3EE]/20 bg-[#22D3EE]/[0.04] p-4 text-sm sm:grid-cols-3">
              <p className="m-0">
                <span className="block text-[#A1A1AA]">Valor FIPE</span>
                <strong>{formatarMoeda(Number(formData.veiculoPrecoFip))}</strong>
              </p>
              <p className="m-0">
                <span className="block text-[#A1A1AA]">Mensalidade</span>
                {veiculoComDescontoAntiguidade && (
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <strong className="text-[#FAFAFA]/45 line-through decoration-[#FAFAFA]/55 decoration-2">
                      {formatarMoeda(mensalidadeSemDesconto)}
                    </strong>
                    <span className="rounded border border-[#22D3EE]/35 bg-[#22D3EE]/10 px-2 py-0.5 text-[0.68rem] font-black tracking-[0.08rem] text-[#22D3EE]">
                      -20%
                    </span>
                  </span>
                )}
                <strong>{formatarMoeda(Number(formData.mensalidade))}</strong>
                {veiculoComDescontoAntiguidade && (
                  <small className="hidden">
                    -20% por veículo com mais de 10 anos
                  </small>
                )}
              </p>
              {veiculoComDescontoAntiguidade && (
                <small className="mt-1 block font-bold text-[#FAFAFA]/60 sm:col-span-3">
                  *Desconto aplicado para veiculos com mais de 10 anos.
                </small>
              )}
              <p className="m-0">
                <span className="block text-[#A1A1AA]">Franquia</span>
                <strong>{formatarMoeda(Number(formData.valorFranquia))}</strong>
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={atualizarCampo}
              disabled={salvando}
              className="h-11 w-full appearance-none rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none transition-all focus:border-[#4F46E5] focus:shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
            >
              <option value="Ativa" className="bg-[#16151E] text-[#FAFAFA]">
                Ativa
              </option>
              <option value="Pendente" className="bg-[#16151E] text-[#FAFAFA]">
                Pendente
              </option>
              <option value="Cancelada" className="bg-[#16151E] text-[#FAFAFA]">
                Cancelada
              </option>
            </select>
          </div>

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
              disabled={salvando || carregandoFipe || formularioIncompleto}
              className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-md border border-[#22D3EE]/25 bg-[#F0F2F4]/[0.035] px-5 text-center text-sm font-black shadow-[0_0_15px_rgba(34,211,238,0.05)] transition duration-200 hover:border-[#22D3EE]/45 hover:bg-[#F0F2F4]/[0.055] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {salvando || carregandoFipe ? (
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
