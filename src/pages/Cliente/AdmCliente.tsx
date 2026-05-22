import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { MagnifyingGlass,PencilSimple,Plus,Trash,X } from '@phosphor-icons/react'
import { AxiosError } from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { api } from '../../services/Service'

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

const obterTokenSalvo = () =>
  localStorage.getItem('token') ??
  localStorage.getItem('authToken') ??
  localStorage.getItem('accessToken') ??
  ''

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
      return 'A API recusou a requisicao. Verifique se o token de login esta salvo.'
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
  const [token, setToken] = useState(() => obterTokenSalvo())
  const [tokenDigitado, setTokenDigitado] = useState('')
  const [formulario, setFormulario] = useState<ClienteForm>(formularioInicial)
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEditandoId, setClienteEditandoId] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function carregarClientes() {
    if (!obterTokenSalvo()) {
      toast.warning('Cole e salve o token de acesso para carregar os clientes.')
      setClientes([])
      return
    }

    try {
      setCarregando(true)

      const resposta = await api.get<UsuarioApi[]>('/usuario')
      setClientes(resposta.data.map(normalizarCliente))
    } catch (error) {
      toast.error(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (token) {
      carregarClientes()
    } else {
      toast.warning('Cole e salve o token de acesso para carregar os clientes.')
    }
  }, [])

  function salvarToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const novoToken = tokenDigitado.trim().replace(/^Bearer\s+/i, '')

    if (!novoToken) {
      toast.error('Informe um token valido.')
      return
    }

    localStorage.setItem('token', novoToken)
    setToken(novoToken)
    setTokenDigitado('')
    toast.success('Token salvo com sucesso.')
    carregarClientes()
  }

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
    setModalAberto(true)
  }

  function fecharFormulario() {
    setModalAberto(false)
    setFormulario(formularioInicial)
    setClienteEditandoId(null)
  }

  async function salvarCliente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      toast.error('Salve o token de acesso antes de cadastrar cliente.')
      return
    }

    const payload = {
      cpf: apenasNumeros(formulario.cpf),
      nome: formulario.nome,
      tipo: 'CLIENTE',
      dataNascimento: formulario.dataNascimento,
      email: formulario.email,
      senha: formulario.senha,
      numeroTelefone: apenasNumeros(formulario.numeroTelefone),
      apolice: [],
    }

    try {
      setCarregando(true)

      if (clienteEditandoId) {
        await api.put(`/usuario/${clienteEditandoId}`, payload)
        toast.success('Cliente atualizado com sucesso.')
      } else {
        await api.post('/usuario', payload)
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

  async function buscarClientePorCpf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      toast.error('Salve o token de acesso antes de buscar cliente.')
      return
    }

    const cpf = apenasNumeros(buscaCpf)

    if (!cpf) {
      carregarClientes()
      return
    }

    try {
      setCarregando(true)

      const resposta = await api.get<UsuarioApi>(`/usuario/${cpf}`)
      setClientes([normalizarCliente(resposta.data)])
    } catch (error) {
      setClientes([])
      toast.error(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  async function confirmarExclusao(cliente: Cliente) {
    if (!token) {
      toast.error('Salve o token de acesso antes de excluir cliente.')
      return
    }

    toast(
      ({ closeToast }) => (
        <div>
          <p className="mb-3 font-medium text-white">
            Tem certeza que deseja excluir este cliente?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeToast}
              className="rounded border border-zinc-600 px-3 py-1 text-sm font-bold text-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                closeToast()
                excluirCliente(cliente)
              }}
              className="rounded bg-rose-600 px-3 py-1 text-sm font-bold text-white"
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

      await api.delete(`/usuario/${apenasNumeros(cliente.cpf)}`)
      toast.success('Cliente excluido com sucesso.')
      await carregarClientes()
    } catch (error) {
      toast.error(obterMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>

      <section className="px-4 py-10 sm:px-8 lg:px-14">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.5em] text-zinc-400">
              Gestao
            </span>
            <h1 className="font-display text-5xl leading-none tracking-tight text-white sm:text-6xl">
              CLIENTES
            </h1>
          </div>

          <button
            type="button"
            onClick={abrirCadastro}
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-rose-600 px-5 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={carregando || !token}
          >
            <Plus size={18} weight="bold" />
            Adicionar cliente
          </button>
        </div>

        {!token && (
          <form
            onSubmit={salvarToken}
            className="mb-6 max-w-3xl rounded-md border border-rose-500/40 bg-rose-950/20 p-4"
          >
            <label className="mb-3 block text-sm font-medium text-zinc-200">
              Token de acesso
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={tokenDigitado}
                onChange={(event) => setTokenDigitado(event.target.value)}
                placeholder="Cole aqui o token Bearer do Swagger"
                className="h-10 flex-1 rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-rose-500"
              />
              <button
                type="submit"
                className="h-10 rounded-md bg-rose-600 px-5 text-sm font-bold text-white transition hover:bg-rose-500"
              >
                Salvar token
              </button>
            </div>
          </form>
        )}

        <form
          onSubmit={buscarClientePorCpf}
          className="mb-6 flex max-w-[560px] flex-col gap-3 sm:flex-row"
        >
          <label className="flex h-10 flex-1 items-center gap-3 rounded-md border border-white/15 bg-zinc-950 px-3 text-zinc-500 focus-within:border-rose-500">
            <MagnifyingGlass size={18} />
            <input
              type="search"
              value={buscaCpf}
              onChange={(event) => setBuscaCpf(event.target.value)}
              placeholder="Buscar cliente por CPF..."
              className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-400"
            />
          </label>

          <button
            type="submit"
            className="h-10 rounded-md border border-white/15 px-5 text-sm font-bold text-white transition hover:border-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={carregando || !token}
          >
            Buscar
          </button>
        </form>

        <div className="overflow-hidden rounded-md border border-white/15">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="w-16 px-3 py-3 font-medium">ID</th>
                  <th className="px-3 py-3 font-medium">Nome</th>
                  <th className="px-3 py-3 font-medium">CPF</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Telefone</th>
                  <th className="w-28 px-3 py-3 text-right font-medium">Acoes</th>
                </tr>
              </thead>

              <tbody>
                {clientes.length > 0 ? (
                  clientes.map((cliente, index) => (
                    <tr key={`${cliente.id}-${cliente.cpf}`} className="border-b border-white/10 last:border-b-0">
                      <td className="px-3 py-4 font-mono text-xs text-zinc-400">#{index + 1}</td>
                      <td className="px-3 py-4 font-bold text-white">{cliente.nome}</td>
                      <td className="px-3 py-4 font-mono font-bold text-white">{cliente.cpf}</td>
                      <td className="px-3 py-4 text-zinc-400">{cliente.email}</td>
                      <td className="px-3 py-4 text-zinc-400">{cliente.telefone}</td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-5">
                          <button
                            type="button"
                            onClick={() => abrirEdicao(cliente)}
                            className="text-white transition hover:text-rose-400"
                            aria-label={`Editar ${cliente.nome}`}
                          >
                            <PencilSimple size={18} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmarExclusao(cliente)}
                            className="text-rose-500 transition hover:text-rose-300"
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
                    <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">
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
            className="w-full max-w-xl rounded-md border border-white/15 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.35em] text-rose-500">
                  Cliente
                </span>
                <h2 className="mt-2 text-2xl font-bold">
                  {clienteEditandoId ? 'Editar cliente' : 'Cadastrar cliente'}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharFormulario}
                className="rounded-md p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Fechar formulario"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-zinc-300">Nome</span>
                <input
                  required
                  value={formulario.nome}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, nome: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-rose-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-300">CPF</span>
                <input
                  required
                  value={formulario.cpf}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, cpf: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-rose-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-300">Nascimento</span>
                <input
                  required
                  type="date"
                  value={formulario.dataNascimento}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, dataNascimento: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-rose-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-300">Telefone</span>
                <input
                  required
                  value={formulario.numeroTelefone}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, numeroTelefone: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-rose-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-300">Senha</span>
                <input
                  required={!clienteEditandoId}
                  type="password"
                  value={formulario.senha}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, senha: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-rose-500"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-zinc-300">Email</span>
                <input
                  required
                  type="email"
                  value={formulario.email}
                  onChange={(event) =>
                    setFormulario((dados) => ({ ...dados, email: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-rose-500"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={fecharFormulario}
                className="h-11 rounded-md border border-white/15 px-5 text-sm font-bold text-zinc-300 transition hover:border-white/30 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-11 rounded-md bg-rose-600 px-5 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={carregando}
              >
                {clienteEditandoId ? 'Salvar alteracoes' : 'Cadastrar cliente'}
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
    </>
  )
}

export default AdmCliente
