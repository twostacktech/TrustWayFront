import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { MagnifyingGlass, PencilSimple, Plus, Trash, X } from '@phosphor-icons/react'
import { AxiosError } from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { api, obterHeaderAutenticado } from '../../services/Service'

type UsuarioApi = {
  id?: number
  idUsuario?: number
  cpf: string
  nome: string
  tipo?: string
  dataNascimento?: string
  email: string
  senha?: string
  numeroTelefone?: string
  telefone?: string
  apolice?: unknown
}

type Cliente = {
  id: number
  nome: string
  cpf: string
  email: string
  telefone: string
  dataNascimento: string
}

type ClienteForm = {
  nome: string
  cpf: string
  email: string
  senha: string
  numeroTelefone: string
  dataNascimento: string
}

const formularioInicial: ClienteForm = {
  nome: '',
  cpf: '',
  email: '',
  senha: '',
  numeroTelefone: '',
  dataNascimento: '',
}

const apenasNumeros = (valor: string) => valor.replace(/\D/g, '')

const normalizarCliente = (usuario: UsuarioApi): Cliente => ({
  id: usuario.id ?? usuario.idUsuario ?? Date.now(),
  nome: usuario.nome,
  cpf: usuario.cpf,
  email: usuario.email,
  telefone: usuario.numeroTelefone ?? usuario.telefone ?? '',
  dataNascimento: usuario.dataNascimento ?? '',
})

const obterMensagemErro = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return 'A API recusou a requisicao. Faca login como administrador e tente novamente.'
    }

    if (error.response?.status) {
      return `Nao foi possivel concluir a operacao. Erro ${error.response.status}.`
    }

    return 'Nao foi possivel concluir a operacao. Confira sua conexao e tente novamente.'
  }

  return 'Ocorreu um erro inesperado.'
}

function AdmCliente() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [buscaCpf, setBuscaCpf] = useState('')
  const [formulario, setFormulario] = useState<ClienteForm>(formularioInicial)
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEditandoId, setClienteEditandoId] = useState<number | null>(null)
  const [clienteEditandoCpf, setClienteEditandoCpf] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const clientesFiltrados = clientes.filter((cliente) => {
    const termoBusca = buscaCpf.trim().toLowerCase()
    if (!termoBusca) return true

    const nomeCliente = cliente.nome.toLowerCase()
    const emailCliente = cliente.email.toLowerCase()
    const cpfClienteLimpo = apenasNumeros(cliente.cpf)
    const termoBuscaApenasNumeros = apenasNumeros(termoBusca)

    // 1. Se o termo digitado contiver letras, filtra apenas por nome e email
    if (!termoBuscaApenasNumeros) {
      return nomeCliente.includes(termoBusca) || emailCliente.includes(termoBusca)
    }

    // 2. Se contiver números, filtra pelas lógicas de CPF
    return (
      cpfClienteLimpo.includes(termoBuscaApenasNumeros) ||
      cliente.cpf.toLowerCase().includes(termoBusca)
    )
  })

  const carregarClientes = useCallback(async () => {
    try {
      setCarregando(true)

      const resposta = await api.get<UsuarioApi[]>('/usuario', obterHeaderAutenticado())

      // FILTRO: Filtra e remove os administradores deixando APENAS quem não é ADM/ADMINISTRADOR
      const apenasClientes = resposta.data.filter((usuario) => {
        const tipoLimpo = String(usuario.tipo ?? '').toUpperCase().trim();
        return tipoLimpo !== 'ADM' && tipoLimpo !== 'ADMINISTRADOR';
      });

      setClientes(apenasClientes.map(normalizarCliente))
    } catch (error) {
      toast.error(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void carregarClientes()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [carregarClientes])

  function abrirCadastro() {
    setFormulario(formularioInicial)
    setClienteEditandoId(null)
    setModalAberto(true)
  }

  function abrirEdicao(cliente: Cliente) {
    setFormulario({
      nome: cliente.nome,
      cpf: cliente.cpf,
      email: cliente.email,
      senha: '',
      numeroTelefone: cliente.telefone,
      dataNascimento: cliente.dataNascimento,
    })
    setClienteEditandoId(cliente.id)
    setClienteEditandoCpf(apenasNumeros(cliente.cpf))
    setModalAberto(true)
  }

  function fecharFormulario() {
    setModalAberto(false)
    setFormulario(formularioInicial)
    setClienteEditandoId(null)
    setClienteEditandoCpf(null)
  }

  async function salvarCliente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payloadBase = {
      cpf: apenasNumeros(formulario.cpf),
      nome: formulario.nome,
      tipo: 'CLIENTE',
      dataNascimento: formulario.dataNascimento,
      email: formulario.email,
      numeroTelefone: apenasNumeros(formulario.numeroTelefone),
    }

    try {
      setCarregando(true)

      if (clienteEditandoId) {
        const payloadEdicao = {
          ...payloadBase,
          ...(formulario.senha ? { senha: formulario.senha } : {}),
        }

        await api.put(
          `/usuario/${clienteEditandoCpf}`,
          payloadEdicao,
          obterHeaderAutenticado()
        )
        toast.success('Cliente atualizado com sucesso.')
      } else {
        await api.post(
          '/usuario',
          { ...payloadBase, senha: formulario.senha, apolice: [] },
          obterHeaderAutenticado()
        )
        toast.success('Cliente cadastrado com sucesso.')
      }

      fecharFormulario()
      await carregarClientes()
    } catch (error) {
      toast.error(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  async function confirmarExclusao(cliente: Cliente) {
    toast(
      ({ closeToast }: { closeToast?: () => void }) => (
        <div>
          <p className="mb-3 font-medium text-white">
            Tem certeza que deseja excluir este cliente?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => closeToast?.()}
              className="rounded border border-white/10 px-3 py-1 text-sm font-bold text-[#FAFAFA]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                closeToast?.()
                excluirCliente(cliente)
              }}
              className="rounded bg-[#FF4FD8] px-3 py-1 text-sm font-bold text-white hover:bg-[#D946EF]"
            >
              Excluir
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      },
    )
  }

  async function excluirCliente(cliente: Cliente) {
    try {
      setCarregando(true)

      await api.delete(`/usuario/${apenasNumeros(cliente.cpf)}`, obterHeaderAutenticado())
      toast.success('Cliente excluido com sucesso.')
      await carregarClientes()
    } catch (error) {
      toast.error(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] px-6 py-12 text-[#FAFAFA] antialiased md:px-16 font-['Inter']">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">
              Gestão
            </span>
            <h1 className="mt-1 font-['Anton'] text-5xl uppercase tracking-wide text-[#FAFAFA]">
              CLIENTES
            </h1>
          </div>

          <button
            type="button"
            onClick={abrirCadastro}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#D946EF] px-6 py-2.5 text-sm font-bold tracking-wider text-white transition-all duration-300 ease-out hover:scale-105 hover:bg-[#FF4FD8] hover:shadow-[0_0_20px_rgba(217,70,239,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={carregando}
          >
            <Plus size={18} weight="bold" />
            Adicionar cliente
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="mb-6 max-w-[560px] relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlass size={18} className="text-[#A1A1AA] group-focus-within:text-[#22D3EE] transition-colors" />
          </span>
          <input
            type="text"
            placeholder="Buscar cliente por nome, CPF ou email..."
            value={buscaCpf}
            onChange={(event) => setBuscaCpf(event.target.value)}
            className="w-full h-10 rounded-md border border-white/10 bg-white/[0.05] py-2 pl-10 pr-10 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] transition-all focus:border-[#22D3EE] focus:bg-[#22D3EE]/10 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] focus:outline-none font-['Inter']"
          />
          {buscaCpf && (
            <button
              type="button"
              onClick={() => setBuscaCpf('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#A1A1AA] hover:text-[#FF4FD8] transition-colors cursor-pointer"
              title="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* <form
          onSubmit={(e) => e.preventDefault()}
          className="mb-6 flex max-w-[560px] flex-col gap-3 sm:flex-row"
        >
          <label className="flex h-10 flex-1 items-center gap-3 rounded-md border border-white/10 bg-white/[0.05] px-3 text-[#A1A1AA] focus-within:border-[#22D3EE]">
            <MagnifyingGlass size={18} />
            <input
              type="search"
              value={buscaCpf}
              onChange={(event) => setBuscaCpf(event.target.value)}
              placeholder="Buscar cliente por nome, CPF ou email..."
              className="h-full w-full bg-transparent text-sm text-[#FAFAFA] outline-none placeholder:text-[#A1A1AA]"
            />
          </label> */}

        {/* <button
            type="submit"
            className="h-10 rounded-md border border-white/10 bg-white/[0.05] px-5 text-sm font-bold text-[#FAFAFA] transition duration-300 ease-out hover:border-[#22D3EE] hover:bg-[#22D3EE]/10 hover:text-[#22D3EE] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={carregando}
          >
            Buscar
          </button> */}
        {/* </form> */}

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#0a0a0a]/40 text-xs uppercase text-[#A1A1AA]">
                  <th className="w-16 px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">CPF</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Telefone</th>
                  <th className="w-28 px-6 py-4 text-right font-medium">Acoes</th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cliente) => (
                    <tr key={`${cliente.id}-${cliente.cpf}`} className="border-b border-white/10 transition hover:bg-white/[0.04] last:border-b-0">
                      <td className="px-6 py-4 font-['JetBrains_Mono'] font-mono text-xs text-[#A1A1AA]">#{cliente.id}</td>
                      <td className="px-6 py-4 font-medium text-[#FAFAFA]">{cliente.nome}</td>
                      <td className="px-6 py-4 font-['JetBrains_Mono'] font-mono text-sm font-bold text-[#22D3EE]">{cliente.cpf}</td>
                      <td className="px-6 py-4 text-[#A1A1AA]">{cliente.email}</td>
                      <td className="px-6 py-4 text-[#A1A1AA]">{cliente.telefone}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-5">
                          <button
                            type="button"
                            onClick={() => abrirEdicao(cliente)}
                            className="text-[#FAFAFA] transition hover:text-[#22D3EE]"
                            aria-label={`Editar ${cliente.nome}`}
                          >
                            <PencilSimple size={18} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmarExclusao(cliente)}
                            className="text-[#A1A1AA] transition hover:text-[#FF4FD8]"
                            aria-label={`Excluir ${cliente.nome}`}
                          >
                            <Trash size={18} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-[#A1A1AA]">
                      {carregando ? 'Carregando clientes...' : 'Nenhum cliente encontrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6">
          <form
            onSubmit={salvarCliente}
            className="w-full max-w-xl rounded-md border border-white/10 bg-[#16151E] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#22D3EE]">
                  Cliente
                </span>
                <h2 className="mt-2 text-2xl font-bold text-[#FAFAFA]">
                  {clienteEditandoId ? 'Editar cliente' : 'Cadastrar cliente'}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharFormulario}
                className="rounded-md p-2 text-[#A1A1AA] transition hover:bg-white/[0.05] hover:text-white"
                aria-label="Fechar formulario"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-[#A1A1AA]">Nome</span>
                <input
                  required
                  value={formulario.nome}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, nome: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none focus:border-[#9D4EDD]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#A1A1AA]">CPF</span>
                <input
                  required
                  value={formulario.cpf}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, cpf: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none focus:border-[#22D3EE]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#A1A1AA]">Nascimento</span>
                <input
                  required
                  type="date"
                  value={formulario.dataNascimento}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, dataNascimento: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none focus:border-[#4F46E5]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#A1A1AA]">Telefone</span>
                <input
                  required
                  value={formulario.numeroTelefone}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, numeroTelefone: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none focus:border-[#4F46E5]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[#A1A1AA]">Senha</span>
                <input
                  required={!clienteEditandoId}
                  type="password"
                  value={formulario.senha}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, senha: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none focus:border-[#FF4FD8]"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-[#A1A1AA]">Email</span>
                <input
                  required
                  type="email"
                  value={formulario.email}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, email: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-[#FAFAFA] outline-none focus:border-[#22D3EE]"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={fecharFormulario}
                className="h-11 rounded-md border border-white/10 px-5 text-sm font-bold text-[#A1A1AA] transition hover:border-white/30 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-11 rounded-md bg-[#D946EF] px-5 text-sm font-bold text-white transition duration-300 ease-out hover:bg-[#FF4FD8] hover:shadow-[0_0_20px_rgba(217,70,239,0.6)] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={carregando}
              >
                {clienteEditandoId ? 'Salvar alterações' : 'Cadastrar cliente'}
              </button>
            </div>
          </form>
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
    </div>
  )
}
export default AdmCliente
