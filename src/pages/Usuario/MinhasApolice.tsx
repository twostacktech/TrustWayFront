import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  MagnifyingGlass,
  Car,
  ShieldCheck,
  CurrencyDollar,
  Calendar,
  FileText,
  Warning,
  Receipt,
  CopySimple,
  SignOut,
} from "@phosphor-icons/react";

import { api } from "../../services/Service";

type UsuarioToken = {
  id?: number | string;
  idUsuario?: number | string;
  id_usuario?: number | string;
  userId?: number | string;
  sub?: number | string;
  nome?: string;
  name?: string;
  email?: string;
  usuario?: string;
  cpf?: string;
};

type Usuario = {
  id?: number | string;
  idUsuario?: number | string;
  id_usuario?: number | string;
  userId?: number | string;
  sub?: number | string;
  nome?: string;
  name?: string;
  email?: string;
  usuario?: string;
  cpf?: string;
};

type Veiculo = {
  marca?: string;
  modelo?: string;
  ano?: number | string;
  placa?: string;
  precoFip?: number | string;
  precoFipe?: number | string;
  valorFipe?: number | string;
  valor?: number | string;
  preco?: number | string;
  codigoFipe?: string;
};

type ApoliceApi = {
  id?: number;
  id_apolice?: number;
  mensalidade?: number;
  cobertura?: string;
  percentualCobertura?: number;
  franquia?: number;
  valorFranquia?: number;
  data_inicio?: string;
  dataInicio?: string | Date;
  status?: string;
  usuario?: Usuario;
  cliente?: Usuario;
  veiculo?: Veiculo;
};

type Apolice = {
  id_apolice: number;
  mensalidade: number;
  cobertura: string;
  franquia: number;
  data_inicio: string;
  status: string;
  usuario?: Usuario;
  veiculo: Veiculo;
};

const BRASIL_API_BASE = "https://brasilapi.com.br/api";

const obterTokenSalvo = () =>
  localStorage.getItem("token") ??
  localStorage.getItem("authToken") ??
  localStorage.getItem("accessToken") ??
  "";

const obterHeaderAutenticado = () => {
  const token = obterTokenSalvo();

  return {
    headers: {
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    },
  };
};

function decodificarToken(): UsuarioToken | null {
  const token = obterTokenSalvo();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );

    return JSON.parse(json) as UsuarioToken;
  } catch {
    return null;
  }
}

function obterUsuarioSalvo(): UsuarioToken | null {
  try {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    return usuarioSalvo ? (JSON.parse(usuarioSalvo) as UsuarioToken) : null;
  } catch {
    return null;
  }
}

function obterIdUsuario(usuario?: Usuario | UsuarioToken | null) {
  return usuario?.id ?? usuario?.idUsuario ?? usuario?.id_usuario ?? usuario?.userId ?? usuario?.sub;
}

function obterNomeUsuario(usuario?: Usuario | UsuarioToken | null) {
  return usuario?.nome ?? usuario?.name ?? usuario?.usuario ?? usuario?.email ?? "Cliente";
}

function pertenceAoCliente(apolice: ApoliceApi, cliente: UsuarioToken | null) {
  if (!cliente) return true;

  const usuarioApolice = apolice.usuario ?? apolice.cliente;
  const idCliente = obterIdUsuario(cliente);
  const idUsuarioApolice = obterIdUsuario(usuarioApolice);

  if (idCliente && idUsuarioApolice) {
    return String(idCliente) === String(idUsuarioApolice);
  }

  if (cliente.email && usuarioApolice?.email) {
    return cliente.email === usuarioApolice.email;
  }

  if (cliente.cpf && usuarioApolice?.cpf) {
    return cliente.cpf === usuarioApolice.cpf;
  }

  return true;
}

function normalizarApolice(apolice: ApoliceApi): Apolice {
  return {
    id_apolice: apolice.id_apolice ?? apolice.id ?? 0,
    mensalidade: Number(apolice.mensalidade ?? 0),
    cobertura:
      apolice.cobertura ??
      (apolice.percentualCobertura ? `${apolice.percentualCobertura}% de cobertura` : "Cobertura"),
    franquia: Number(apolice.franquia ?? apolice.valorFranquia ?? 0),
    data_inicio: String(apolice.data_inicio ?? apolice.dataInicio ?? ""),
    status: apolice.status ?? "Ativa",
    usuario: apolice.usuario ?? apolice.cliente,
    veiculo: apolice.veiculo ?? {},
  };
}

function obterClasseStatus(status: string) {
  const statusNormalizado = status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (statusNormalizado.includes("pendente")) {
    return "border-yellow-400/40 bg-yellow-400/10 text-yellow-300";
  }

  if (statusNormalizado.includes("cancel")) {
    return "border-red-400/40 bg-red-500/10 text-red-300";
  }

  return "border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#22D3EE]";
}

export function MinhasApolices() {
  const [apolices, setApolices] = useState<Apolice[]>([]);
  const [clienteLogado] = useState<UsuarioToken | null>(
    () => {
      const usuarioSalvo = obterUsuarioSalvo();
      const usuarioToken = decodificarToken();
      return usuarioSalvo || usuarioToken ? { ...usuarioSalvo, ...usuarioToken } : null;
    }
  );
  const [clienteDetalhado, setClienteDetalhado] = useState<Usuario | UsuarioToken | null>(clienteLogado);
  const [busca, setBusca] = useState("");
  const [coberturaSelecionada, setCoberturaSelecionada] = useState("Todos");
  const [valorFipeByCodigo, setValorFipeByCodigo] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const nomeCliente = obterNomeUsuario(clienteDetalhado);

  const coberturas = useMemo(() => {
    const opcoes = apolices.map((apolice) => apolice.cobertura).filter(Boolean);
    return ["Todos", ...Array.from(new Set(opcoes))];
  }, [apolices]);

  const buscarValorFipe = useCallback(async (codigoFipe: string) => {
    try {
      const response = await fetch(`${BRASIL_API_BASE}/fipe/preco/v1/${codigoFipe}`);
      if (!response.ok) throw new Error("Erro ao buscar preço FIPE");
      const data = await response.json();
      setValorFipeByCodigo((prev) => ({ ...prev, [codigoFipe]: data.valor }));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const buscarValoresFipe = useCallback(async (apolicesDoCliente: Apolice[]) => {
    const codigos = Array.from(
      new Set(
        apolicesDoCliente
          .map((apolice) => apolice.veiculo.codigoFipe)
          .filter(Boolean) as string[]
      )
    );

    await Promise.all(codigos.map((codigo) => buscarValorFipe(codigo)));
  }, [buscarValorFipe]);

  const formatarMoeda = (valor?: number | string) => {
    const valorNumerico = Number(valor);
    if (Number.isNaN(valorNumerico)) return "-";
    return valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  const obterValorNumerico = (valor?: number | string) => {
    if (valor === undefined || valor === null || valor === "") return null;

    if (typeof valor === "number") {
      return Number.isNaN(valor) ? null : valor;
    }

    const textoNormalizado = valor
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(",", ".");

    const valorNumerico = Number(textoNormalizado);
    return Number.isNaN(valorNumerico) ? null : valorNumerico;
  };

  const obterValorFipe = (apolice: Apolice) => {
    const veiculo = apolice.veiculo;
    const valorApi =
      obterValorNumerico(veiculo?.precoFipe) ??
      obterValorNumerico(veiculo?.precoFip) ??
      obterValorNumerico(veiculo?.valorFipe) ??
      obterValorNumerico(veiculo?.valor) ??
      obterValorNumerico(veiculo?.preco);

    if (valorApi) {
      return { valor: formatarMoeda(valorApi), estimado: false };
    }

    const mensalidade = obterValorNumerico(apolice.mensalidade);
    if (mensalidade) {
      return { valor: formatarMoeda(mensalidade * 180), estimado: true };
    }

    return { valor: "R$ 45.000", estimado: true };
  };

  const formatarData = (data?: Date | string) => {
    if (!data) return "-";
    if (typeof data === "string" && data.includes("-")) {
      const [ano, mes, dia] = data.split("T")[0].split("-");
      return `${dia}/${mes}/${ano}`;
    }
    const dataFormatada = new Date(data);
    if (Number.isNaN(dataFormatada.getTime())) return "-";
    return dataFormatada.toLocaleDateString("pt-BR");
  };

  const normalizarTexto = (texto?: string | number) =>
    String(texto ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  useEffect(() => {
    let componenteMontado = true;

    async function buscarApolices() {
      try {
        const response = await api.get<ApoliceApi[]>("/apolices", obterHeaderAutenticado());
        const apolicesDoCliente = response.data
          .filter((apolice) => pertenceAoCliente(apolice, clienteLogado))
          .map(normalizarApolice);

        if (!componenteMontado) return;

        setApolices(apolicesDoCliente);
        setClienteDetalhado(apolicesDoCliente.find((apolice) => apolice.usuario)?.usuario ?? clienteLogado);
        setErro("");
        await buscarValoresFipe(apolicesDoCliente);
      } catch (error) {
        console.error("Erro ao buscar apólices do cliente:", error);
        if (componenteMontado) {
          setErro("Não foi possível carregar suas apólices agora.");
        }
      } finally {
        if (componenteMontado) {
          setCarregando(false);
        }
      }
    }

    buscarApolices();

    return () => {
      componenteMontado = false;
    };
  }, [buscarValoresFipe, clienteLogado]);

  const apolicesFiltradas = apolices.filter((apolice) => {
    const termoBusca = normalizarTexto(busca.trim());

    const dadosBusca = [
      apolice.veiculo?.placa,
      apolice.veiculo?.modelo,
      apolice.veiculo?.marca,
    ]
      .filter(Boolean)
      .map((texto) => normalizarTexto(texto as string))
      .join(" ");

    const correspondeBusca = !termoBusca || dadosBusca.includes(termoBusca);
    const correspondeCobertura =
      coberturaSelecionada === "Todos" || apolice.cobertura === coberturaSelecionada;

    return correspondeBusca && correspondeCobertura;
  });

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("usuarioLogado");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] px-6 py-12 text-[#FAFAFA] antialiased md:px-16 font-['Inter']">
      <main className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">
              Proteção ativa
            </span>
            <h1 className="mt-1 font-['Anton'] text-5xl uppercase tracking-wide text-[#FAFAFA]">
              MINHAS APÓLICES
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-4 text-sm font-bold text-[#FAFAFA]">
              <User size={16} className="text-[#A1A1AA]" />
              <span className="max-w-[140px] truncate">{nomeCliente}</span>
            </div>
            <Link
              to="/home"
              onClick={sair}
              className="group inline-flex h-11 w-fit items-center justify-center rounded-md border border-[#22D3EE]/25 bg-[#F0F2F4]/[0.035] px-6 text-center text-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-[#22D3EE]/45 hover:bg-[#F0F2F4]/[0.055] shadow-[0_0_20px_rgba(34,211,238,0.08)]"
            >
              <span className="animated-gradient-text flex items-center gap-2 tracking-[0.12rem] text-xl">
                <SignOut size={18} className="text-[#D946EF]" />
                Sair
              </span>
            </Link>
          </div>

          {/* <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm font-bold text-[#FAFAFA]">
              <User size={16} className="text-[#A1A1AA]" />
              <span className="max-w-[140px] truncate">{nomeCliente}</span>
            </div>
            <Link
              to="/home"
              onClick={sair}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#D946EF] px-5 text-sm font-bold tracking-wider text-white transition-all duration-300 ease-out hover:scale-105 hover:bg-[#FF4FD8] hover:shadow-[0_0_20px_rgba(217,70,239,0.6)]"
            >
              <SignOut size={16} weight="bold" />
              Sair
            </Link>
          </div> */}
        </div>

        {erro && (
          <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            {erro}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
            <p className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">Apólices cadastradas</p>
            <p className="mt-3 font-['Anton'] text-4xl leading-none tracking-wide text-[#FAFAFA]">{apolices.length}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
            <p className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">Filtro de busca</p>
            <p className="mt-3 truncate text-sm font-bold text-[#FAFAFA]">{busca || "Todas as placas/modelos"}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
            <p className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">Cobertura selecionada</p>
            <p className="mt-3 truncate text-sm font-bold text-[#FAFAFA]">{coberturaSelecionada}</p>
          </div>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,560px)_minmax(220px,280px)]">
          <div className="group relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A1A1AA] transition-colors group-focus-within:text-[#22D3EE]" />
            <input
              type="text"
              placeholder="Buscar por placa, modelo ou marca do veículo..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              className="h-10 w-full rounded-md border border-white/10 bg-white/[0.05] py-2 pl-10 pr-4 text-sm text-[#FAFAFA] placeholder:text-[#A1A1AA] transition-all focus:border-[#22D3EE] focus:bg-[#22D3EE]/10 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] focus:outline-none"
            />
          </div>

          <select
            value={coberturaSelecionada}
            onChange={(evento) => setCoberturaSelecionada(evento.target.value)}
            className="h-10 cursor-pointer rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm font-bold text-[#FAFAFA] outline-none transition-all focus:border-[#22D3EE] focus:bg-[#22D3EE]/10"
          >
            {coberturas.map((cobertura) => (
              <option key={cobertura} value={cobertura} className="bg-[#16151E] text-[#FAFAFA]">
                {cobertura === "Todos" ? "Todas as Coberturas" : cobertura}
              </option>
            ))}
          </select>
        </section>

        <div className="space-y-6">
          {carregando ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-16 text-center text-[#A1A1AA]">
              Carregando suas apólices...
            </div>
          ) : apolicesFiltradas.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-16 text-center text-[#A1A1AA]">
              Nenhuma apólice de veículo encontrada.
            </div>
          ) : (
            apolicesFiltradas.map((apolice) => (
              <div key={apolice.id_apolice} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="flex flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-white/[0.05] p-6 transition hover:bg-white/[0.07] lg:col-span-2">
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-3 text-[#A1A1AA]">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        <span className="font-mono text-xs uppercase tracking-wider">Veículo Segurado</span>
                      </div>
                      <div className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-['JetBrains_Mono'] font-mono text-[11px] uppercase tracking-wider ${obterClasseStatus(apolice.status)}`}>
                        <ShieldCheck className="h-4 w-4" />
                        <span className="font-bold leading-none">{apolice.status}</span>
                      </div>
                    </div>
                    <h2 className="font-['Anton'] text-4xl uppercase tracking-wide text-[#FAFAFA]">
                      {apolice.veiculo?.marca || "Veículo"} {apolice.veiculo?.modelo || ""}
                    </h2>
                    <p className="mt-1 text-sm text-[#A1A1AA]">Ano Modelo: {apolice.veiculo?.ano || "-"}</p>
                    {/* <div className="mt-2 text-sm">
                      <p className="font-['JetBrains_Mono'] font-mono text-xs font-bold uppercase tracking-widest text-[#D946EF]">Plano de Cobertura</p>
                      <p className="text-xl font-bold text-[#D946EF]">{apolice.cobertura}</p>
                    </div> */}
                    <div className="mt-2 text-sm">
                      <p className="font-['JetBrains_Mono'] font-mono text-xs font-bold uppercase tracking-widest text-[#22D3EE]">Plano de Cobertura</p>
                      <p className="text-xl font-bold text-[#22D3EE]">{apolice.cobertura}</p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div>
                      <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Placa</p>
                      <p className="mt-0.5 font-['JetBrains_Mono'] font-mono text-lg font-bold tracking-wide text-[#22D3EE]">
                        {apolice.veiculo?.placa || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Valor FIPE</p>
                      {(() => {
                        const valorFipe = apolice.veiculo?.codigoFipe && valorFipeByCodigo[apolice.veiculo.codigoFipe]
                          ? { valor: valorFipeByCodigo[apolice.veiculo.codigoFipe], estimado: false }
                          : obterValorFipe(apolice);

                        return (
                          <p className="mt-0.5 font-['JetBrains_Mono'] font-mono text-lg font-semibold text-[#FAFAFA]">
                            {valorFipe.valor}
                            {valorFipe.estimado && (
                              <span className="ml-2 text-[10px] uppercase tracking-wider text-[#D946EF]">
                                estimado
                              </span>
                            )}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-white/[0.05] p-6 transition hover:bg-white/[0.07]">
                  <div>
                    <div className="mb-6 flex items-center gap-3 text-[#A1A1AA]">
                      <CurrencyDollar className="h-5 w-5" />
                      <span className="font-mono text-xs uppercase tracking-wider">Valores e Custos</span>
                    </div>

                    <div className="space-y-4">
                      {/* <div>
                          <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Mensalidade</p>
                          <p className="mt-1 font-['Anton'] text-4xl tracking-wide text-[#D946EF]">
                            {formatarMoeda(apolice.mensalidade)}
                          </p>
                        </div> */}
                      <div>
                        <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Mensalidade</p>
                        <p className="animated-gradient-text mt-1 w-fit font-['Anton'] text-4xl tracking-wide font-black">
                          {formatarMoeda(apolice.mensalidade)}
                        </p>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div>
                        <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Franquia Obrigatória</p>
                        <p className="mt-1 font-['JetBrains_Mono'] font-mono text-xl font-medium">{formatarMoeda(apolice.franquia)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-left text-sm font-medium text-[#FAFAFA] transition-colors hover:text-[#22D3EE]"
                      >
                        <Receipt className="h-4 w-4 text-[#A1A1AA]" />
                        Histórico de Pagamentos
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-left text-sm font-medium text-[#FAFAFA] transition-colors hover:text-[#22D3EE]"
                      >
                        <CopySimple className="h-4 w-4 text-[#A1A1AA]" />
                        Pagar
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-[#A1A1AA]">
                    <Calendar className="h-4 w-4" />
                    <span>Início da vigência: {formatarData(apolice.data_inicio)}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-6 lg:col-span-3">
                  <div className="mb-4 flex items-center gap-3 text-[#A1A1AA]">
                    <FileText className="h-5 w-5" />
                    <span className="font-mono text-xs uppercase tracking-wider">Dados do Contrato</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Código da Apólice</p>
                      <p className="font-mono text-sm font-semibold">#000{apolice.id_apolice}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Abrangência</p>
                      <p className="text-sm text-[#A1A1AA]">Nacional (Território Brasileiro)</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-lg border border-[#D946EF]/30 bg-[#D946EF]/10 p-6 sm:flex-row sm:items-center">
          <div className="flex gap-3 items-start">
            <Warning className="mt-0.5 h-5 w-5 shrink-0 text-[#D946EF]" />
            <div>
              <p className="font-medium text-sm">Precisa de assistência ou sofreu um sinistro?</p>
              <p className="mt-0.5 text-xs text-[#A1A1AA]">
                Nossa central de suporte funciona 24 horas por dia para colisões, guinchos e chaveiro.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%20Trustway%2C%20preciso%20de%20assist%C3%AAncia."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-lg bg-[#D946EF] px-5 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 ease-out hover:scale-105 hover:bg-[#FF4FD8] hover:shadow-[0_0_20px_rgba(217,70,239,0.6)] sm:w-auto"
          >
            Acionar Seguro
          </a>
        </div> */}

        <div className="mt-8 relative overflow-hidden rounded-2xl border border-[#22D3EE]/15 bg-[#F0F2F4]/[0.025] backdrop-blur-md p-6 shadow-[0_0_50px_rgba(34,211,238,0.05)] flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

          {/* Detalhe de iluminação sutil de fundo no topo do container */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#22D3EE]/40 to-transparent" />

          <div className="flex gap-3 items-start relative z-10">
            <Warning className="mt-0.5 h-5 w-5 shrink-0 text-[#22D3EE]" />
            <div>
              <p className="font-medium text-sm text-[#F0F2F4]">Precisa de assistência ou sofreu um sinistro?</p>
              <p className="mt-0.5 text-xs text-[#A1A1AA]">
                Nossa central de suporte funciona 24 horas por dia para colisões, guinchos e chaveiro.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%20Trustway%2C%20preciso%20de%20assist%C3%AAncia."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-11 w-full shrink-0 items-center justify-center rounded-lg border border-[#22D3EE]/25 bg-[#F0F2F4]/[0.035] px-6 text-center text-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#22D3EE]/45 hover:bg-[#F0F2F4]/[0.055] shadow-[0_0_20px_rgba(34,211,238,0.08)] sm:w-auto relative z-10"
          >
            <span className="animated-gradient-text uppercase tracking-[0.12rem] font-bold">
              Acionar Seguro
            </span>
          </a>
        </div>
      </main>
    </div>
  );
}
