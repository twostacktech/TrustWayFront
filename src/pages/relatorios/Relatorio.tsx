import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
    UsersThree,
    FileText,
    CurrencyDollar,
    ChartBar,
    ArrowClockwise,
} from "@phosphor-icons/react";
import { AxiosError } from "axios";

import { api } from "../../services/Service";
import type Apolice from "../../models/Apolice";

type UsuarioApi = {
    id?: number;
    idUsuario?: number;
    cpf?: string;
    nome?: string;
    tipo?: string;
};

type ClienteResumo = {
    id: number;
    nome: string;
    cpf: string;
};

type ApoliceRelatorio = Apolice & {
    clienteId?: number;
    cliente_id?: number;
    usuarioId?: number;
    usuario_id?: number;
    valorSegurado?: number | string;
    valor_segurado?: number | string;
    cobertura?: string;
    data_inicio?: string;
    createdAt?: string;
};

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

function fmtBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data?: Date | string) {
    if (!data) return "";

    if (typeof data === "string" && data.includes("-")) {
        const [ano, mes, dia] = data.split("T")[0].split("-");
        return `${dia}/${mes}/${ano}`;
    }

    const dataFormatada = new Date(data);
    if (Number.isNaN(dataFormatada.getTime())) return "";

    return dataFormatada.toLocaleDateString("pt-BR");
}

function valorNumerico(valor: unknown) {
    if (typeof valor === "string") {
        const limpo = valor.trim().replace(/[^\d,.-]/g, "");
        const normalizado = limpo.includes(",")
            ? limpo.replace(/\./g, "").replace(",", ".")
            : limpo.replace(/\.(?=\d{3}(?:\D|$))/g, "");

        const numero = Number(normalizado);
        return Number.isNaN(numero) ? 0 : numero;
    }

    const numero = Number(valor);
    return Number.isNaN(numero) ? 0 : numero;
}

function normalizarValorVeiculo(valor: number) {
    if (!valor) return 0;

    let valorNormalizado = valor;

    while (valorNormalizado > 5_000_000) {
        valorNormalizado = valorNormalizado / 1000;
    }

    return valorNormalizado;
}

function obterCpfNormalizado(cpf?: string) {
    return cpf?.replace(/\D/g, "") ?? "";
}

function obterIdClienteApolice(apolice: ApoliceRelatorio) {
    return apolice.usuario?.id ?? apolice.usuarioId ?? apolice.usuario_id ?? apolice.clienteId ?? apolice.cliente_id;
}

function obterClienteApolice(apolice: ApoliceRelatorio, clientes: ClienteResumo[]) {
    const idCliente = obterIdClienteApolice(apolice);
    const cpfCliente = obterCpfNormalizado(apolice.usuario?.cpf);

    return (
        clientes.find((cliente) => cliente.id === idCliente) ??
        clientes.find((cliente) => obterCpfNormalizado(cliente.cpf) === cpfCliente) ??
        (apolice.usuario?.nome
            ? {
                id: apolice.usuario.id ?? 0,
                nome: apolice.usuario.nome,
                cpf: apolice.usuario.cpf ?? "",
            }
            : undefined)
    );
}

function obterDataApolice(apolice: ApoliceRelatorio) {
    return apolice.dataInicio ?? apolice.data_inicio ?? apolice.createdAt ?? "";
}

function obterDescricaoCobertura(apolice: ApoliceRelatorio) {
    if (apolice.cobertura) return apolice.cobertura;

    const percentual = valorNumerico(apolice.percentualCobertura);
    return percentual ? `${percentual}% de cobertura` : "Sem cobertura";
}

function calcularValorSegurado(apolice: ApoliceRelatorio) {
    const valorSegurado = normalizarValorVeiculo(
        valorNumerico(apolice.valorSegurado ?? apolice.valor_segurado)
    );

    if (valorSegurado) return valorSegurado;

    const precoFip = normalizarValorVeiculo(valorNumerico(apolice.veiculo?.precoFip));
    const percentual = valorNumerico(apolice.percentualCobertura);

    if (!precoFip || !percentual) return 0;

    return precoFip * (percentual / 100);
}

function normalizarCliente(usuario: UsuarioApi): ClienteResumo {
    return {
        id: usuario.id ?? usuario.idUsuario ?? 0,
        nome: usuario.nome ?? "Cliente sem nome",
        cpf: usuario.cpf ?? "",
    };
}

function mensagemErro(error: unknown) {
    if (error instanceof AxiosError) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            return "A API recusou a requisicao. Verifique se o token de login esta salvo.";
        }

        if (error.response?.status) {
            return `Nao foi possivel carregar os relatorios. Erro ${error.response.status}.`;
        }
    }

    return "Nao foi possivel carregar os relatorios agora.";
}

function KpiCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-3xl border border-purple-800 bg-slate-950 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em]">{label}</p>
                {icon}
            </div>
            <p className="mt-4 text-3xl font-semibold text-white tracking-tight">{value}</p>
        </div>
    );
}

function Relatorios() {
    const [clientes, setClientes] = useState<ClienteResumo[]>([]);
    const [apolices, setApolices] = useState<ApoliceRelatorio[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

    const carregarRelatorio = useCallback(async () => {
        const token = obterTokenSalvo();

        if (!token) {
            setClientes([]);
            setApolices([]);
            setCarregando(false);
            setErro("Salve o token de acesso para carregar clientes e apolices em tempo real.");
            return;
        }

        try {
            setCarregando(true);
            setErro("");

            const [respostaApolices, respostaClientes] = await Promise.all([
                api.get<ApoliceRelatorio[]>("/apolices", obterHeaderAutenticado()),
                api.get<UsuarioApi[]>("/usuario", obterHeaderAutenticado()),
            ]);

            const clientesDaApi = respostaClientes.data
                .filter((usuario) => !usuario.tipo || usuario.tipo.toUpperCase() === "CLIENTE")
                .map(normalizarCliente);

            setApolices(Array.isArray(respostaApolices.data) ? respostaApolices.data : []);
            setClientes(clientesDaApi);
            setUltimaAtualizacao(new Date());
        } catch (error) {
            setErro(mensagemErro(error));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregarRelatorio();

        const intervalo = window.setInterval(() => {
            void carregarRelatorio();
        }, 30000);

        return () => window.clearInterval(intervalo);
    }, [carregarRelatorio]);

    const metricas = useMemo(() => {
        const clientesPorApolice = new Map<number | string, ClienteResumo>();

        apolices.forEach((apolice) => {
            const cliente = obterClienteApolice(apolice, clientes);

            if (cliente) {
                clientesPorApolice.set(cliente.id || cliente.cpf, cliente);
            }
        });

        const totalClientes = clientes.length || clientesPorApolice.size;
        const apolicesVigentes = apolices.filter((apolice) => {
            const status = apolice.status?.toLowerCase();
            return !status || ["ativo", "ativa", "vigente"].includes(status);
        });
        const baseApolices = apolicesVigentes.length ? apolicesVigentes : apolices;

        const receitaMensal = baseApolices.reduce(
            (soma, apolice) => soma + valorNumerico(apolice.mensalidade),
            0,
        );

        const coberturaTotal = baseApolices.reduce(
            (soma, apolice) => soma + calcularValorSegurado(apolice),
            0,
        );

        const porCobertura = baseApolices.reduce<Record<string, number>>((acc, apolice) => {
            const nome = obterDescricaoCobertura(apolice);
            acc[nome] = (acc[nome] ?? 0) + 1;
            return acc;
        }, {});

        const recentes = [...apolices]
            .sort((a, b) => String(obterDataApolice(b)).localeCompare(String(obterDataApolice(a))))
            .slice(0, 5);

        return {
            totalClientes,
            totalApolices: baseApolices.length,
            receitaMensal,
            coberturaTotal,
            porCobertura,
            recentes,
        };
    }, [apolices, clientes]);

    const maiorQuantidade = Math.max(...Object.values(metricas.porCobertura), 1);

    return (
        <section className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] px-6 py-10 md:px-16 lg:px-24">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Desempenho</p>
                        <h1 className="mt-2 text-5xl font-semibold uppercase tracking-tight text-white">Relatórios</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            {ultimaAtualizacao
                                ? `Atualizado em ${ultimaAtualizacao.toLocaleTimeString("pt-BR")}`
                                : "Dados sincronizados com clientes e apólices"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void carregarRelatorio()}
                        disabled={carregando}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm font-bold text-white transition hover:border-[#22D3EE] hover:text-[#22D3EE] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <ArrowClockwise size={16} className={carregando ? "animate-spin" : ""} />
                        Atualizar
                    </button>
                </div>

                {erro && (
                    <div className="mb-6 rounded-lg border border-[#FF4FD8]/40 bg-[#FF4FD8]/10 px-4 py-3 text-sm text-[#FAFAFA]">
                        {erro}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <KpiCard icon={<UsersThree className="h-5 w-5 text-purple-400" />} label="Clientes ativos" value={String(metricas.totalClientes)} />
                    <KpiCard icon={<FileText className="h-5 w-5 text-purple-400" />} label="Apólices vigentes" value={String(metricas.totalApolices)} />
                    <KpiCard icon={<CurrencyDollar className="h-5 w-5 text-purple-400" />} label="Receita mensal" value={fmtBRL(metricas.receitaMensal)} />
                    <KpiCard icon={<ChartBar className="h-5 w-5 text-purple-400" />} label="Cobertura total" value={fmtBRL(metricas.coberturaTotal)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-3xl border border-purple-800 bg-slate-950 p-6 shadow-sm">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Valor total segurado</p>
                        <p className="mt-4 text-4xl font-semibold text-slate-100">{fmtBRL(metricas.coberturaTotal)}</p>
                        <p className="mt-2 text-sm text-slate-500">
                            Soma calculada pelo preço FIPE do veículo vezes o percentual de cobertura.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-purple-800 bg-slate-950 p-6 shadow-sm">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">Distribuição por cobertura</p>
                        <div className="space-y-4">
                            {Object.entries(metricas.porCobertura).length > 0 ? (
                                Object.entries(metricas.porCobertura).map(([nome, count]) => {
                                    const pct = (count / Math.max(metricas.totalApolices, 1)) * 100;
                                    return (
                                        <div key={nome}>
                                            <div className="flex justify-between gap-4 text-sm mb-1">
                                                <span className="text-white">{nome}</span>
                                                <span className="font-mono text-slate-400">{count} ({pct.toFixed(0)}%)</span>
                                            </div>
                                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                                                <div className="h-full rounded-full bg-purple-800" style={{ width: `${(count / maiorQuantidade) * 100}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-slate-500">
                                    {carregando ? "Carregando distribuição..." : "Nenhuma apólice encontrada."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-3xl border border-purple-800 bg-slate-950 p-6 shadow-sm">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">Apólices recentes</p>
                    <div className="space-y-3">
                        {metricas.recentes.length > 0 ? (
                            metricas.recentes.map((apolice) => {
                                const cliente = obterClienteApolice(apolice, clientes);
                                const veiculo = `${apolice.veiculo?.marca ?? ""} ${apolice.veiculo?.modelo ?? ""}`.trim();

                                return (
                                    <div key={apolice.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800 last:border-0">
                                        <div>
                                            <p className="font-semibold text-white">{cliente?.nome ?? "Cliente não informado"}</p>
                                            <p className="mt-1 text-xs text-slate-500 font-mono">
                                                AP-{String(apolice.id).padStart(4, "0")} · {veiculo || apolice.veiculo?.placa || "Veículo não informado"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-white">{fmtBRL(valorNumerico(apolice.mensalidade))}/mês</p>
                                            <p className="mt-1 text-xs text-slate-500">{formatarData(obterDataApolice(apolice))}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-slate-500">
                                {carregando ? "Carregando apólices..." : "Nenhuma apólice encontrada."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Relatorios;
