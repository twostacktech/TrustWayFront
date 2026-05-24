import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import {
    UsersThree,
    FileText,
    CurrencyDollar,
    ChartBar,
    ArrowClockwise,
    ShieldCheck,
    TrendUp,
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

const dashboardGridVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.16,
            delayChildren: 0.08,
        },
    },
};

const dashboardCardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 28,
        scale: 0.98,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.85,
            ease: "easeOut",
        },
    },
};

function KpiCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail?: string }) {
    return (
        <motion.div
            variants={dashboardCardVariants}
            whileHover={{ y: -8, scale: 1.055 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="group min-h-[138px] rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition-colors duration-300 hover:z-10 hover:border-[#22D3EE] hover:bg-[#22D3EE]/10 hover:shadow-[0_0_28px_rgba(34,211,238,0.32)]"
        >
            <div className="flex items-start justify-between gap-4 text-[#A1A1AA]">
                <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest">{label}</p>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#22D3EE]/25 bg-[#22D3EE]/10 text-[#22D3EE] shadow-[0_0_16px_rgba(34,211,238,0.15)] transition-all duration-300 group-hover:border-[#22D3EE] group-hover:bg-[#22D3EE]/20 group-hover:shadow-[0_0_22px_rgba(34,211,238,0.38)]">
                    {icon}
                </span>
            </div>
            <p className="mt-5 font-['JetBrains_Mono'] font-mono text-3xl font-semibold text-[#FAFAFA]">{value}</p>
            {detail && <p className="mt-3 text-xs text-[#A1A1AA]">{detail}</p>}
        </motion.div>
    );
}

function Sparkline({ valores }: { valores: number[] }) {
    const [pontoAtivo, setPontoAtivo] = useState<number | null>(null);
    const largura = 520;
    const altura = 150;
    const maior = Math.max(...valores, 1);
    const menor = Math.min(...valores, 0);
    const intervalo = Math.max(maior - menor, 1);

    const pontos = valores.map((valor, index) => {
        const x = valores.length === 1 ? largura / 2 : (index / (valores.length - 1)) * largura;
        const y = altura - ((valor - menor) / intervalo) * (altura - 34) - 16;
        return { x, y };
    });

    const path = pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(" ");
    const pontoSelecionado = pontoAtivo !== null ? pontos[pontoAtivo] : null;

    return (
        <div className="relative">
            <svg
                viewBox={`0 0 ${largura} ${altura}`}
                className="h-44 w-full overflow-visible"
                onMouseLeave={() => setPontoAtivo(null)}
            >
                <defs>
                    <linearGradient id="sparklineStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22D3EE" />
                        <stop offset="52%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#FF4FD8" />
                    </linearGradient>
                    <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.polyline
                    points={`0,${altura} ${path} ${largura},${altura}`}
                    fill="url(#sparklineFill)"
                    stroke="none"
                    initial={{ opacity: 0, scaleY: 0.2 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.85, ease: "easeOut", delay: 0.28 }}
                    style={{ originY: 1 }}
                />
                <motion.polyline
                    points={path}
                    fill="none"
                    stroke="url(#sparklineStroke)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.25, ease: "easeOut", delay: 0.38 }}
                />
                {pontos.map((ponto, index) => (
                    <g key={`${ponto.x}-${index}`} onMouseEnter={() => setPontoAtivo(index)}>
                        {pontoAtivo === index && (
                            <line
                                x1={ponto.x}
                                x2={ponto.x}
                                y1="12"
                                y2={altura - 8}
                                stroke="rgba(34,211,238,0.25)"
                                strokeWidth="1"
                            />
                        )}
                        <motion.circle
                            cx={ponto.x}
                            cy={ponto.y}
                            r={pontoAtivo === index ? "6" : "4"}
                            className="fill-[#22D3EE] drop-shadow-[0_0_8px_rgba(34,211,238,0.85)]"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.34, ease: "easeOut", delay: 0.7 + index * 0.06 }}
                        />
                        <circle cx={ponto.x} cy={ponto.y} r="18" fill="transparent" />
                    </g>
                ))}
            </svg>

            {pontoSelecionado && pontoAtivo !== null && (
                <div
                    className="pointer-events-none absolute z-20 min-w-[92px] rounded-md border border-[#22D3EE]/45 bg-[#08111F]/95 px-3 py-2 text-center shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                    style={{
                        left: `${(pontoSelecionado.x / largura) * 100}%`,
                        top: `${(pontoSelecionado.y / altura) * 100}%`,
                        transform: "translate(-50%, -118%)",
                    }}
                >
                    <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">
                        Ponto {pontoAtivo + 1}
                    </p>
                    <p className="mt-1 font-['JetBrains_Mono'] font-mono text-xs font-semibold text-[#22D3EE]">
                        {fmtBRL(valores[pontoAtivo])}
                    </p>
                </div>
            )}
        </div>
    );
}

function ProgressRing({ valor }: { valor: number }) {
    const porcentagem = Math.max(0, Math.min(100, valor));
    const raio = 54;
    const circunferencia = 2 * Math.PI * raio;
    const offset = circunferencia - (porcentagem / 100) * circunferencia;

    return (
        <div className="relative grid place-items-center">
            <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90">
                <circle cx="70" cy="70" r={raio} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                <motion.circle
                    cx="70"
                    cy="70"
                    r={raio}
                    fill="none"
                    stroke="url(#ringGradient)"
                    strokeLinecap="round"
                    strokeWidth="12"
                    strokeDasharray={circunferencia}
                    initial={{ strokeDashoffset: circunferencia }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.15, ease: "easeOut", delay: 0.35 }}
                />
                <defs>
                    <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#22D3EE" />
                        <stop offset="55%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#FF4FD8" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-center">
                <p className="font-['JetBrains_Mono'] font-mono text-3xl font-semibold text-[#FAFAFA]">{porcentagem.toFixed(0)}%</p>
                <p className="text-xs text-[#A1A1AA]">vigentes</p>
            </div>
        </div>
    );
}

function Relatorios() {
    const [clientes, setClientes] = useState<ClienteResumo[]>([]);
    const [apolices, setApolices] = useState<ApoliceRelatorio[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
    const { scrollYProgress } = useScroll();
    const topoY = useTransform(scrollYProgress, [0, 1], [0, -28]);
    const kpisY = useTransform(scrollYProgress, [0, 1], [0, -16]);
    const graficosY = useTransform(scrollYProgress, [0, 1], [0, 22]);
    const listaY = useTransform(scrollYProgress, [0, 1], [0, -12]);

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

        const percentualMedioCobertura = baseApolices.length
            ? baseApolices.reduce((soma, apolice) => soma + valorNumerico(apolice.percentualCobertura), 0) / baseApolices.length
            : 0;

        const ticketMedio = baseApolices.length ? receitaMensal / baseApolices.length : 0;
        const indiceVigencia = apolices.length ? (baseApolices.length / apolices.length) * 100 : 0;

        const porCobertura = baseApolices.reduce<Record<string, number>>((acc, apolice) => {
            const nome = obterDescricaoCobertura(apolice);
            acc[nome] = (acc[nome] ?? 0) + 1;
            return acc;
        }, {});

        const recentes = [...apolices]
            .sort((a, b) => String(obterDataApolice(b)).localeCompare(String(obterDataApolice(a))))
            .slice(0, 5);

        const graficoReceita = [...baseApolices]
            .sort((a, b) => String(obterDataApolice(a)).localeCompare(String(obterDataApolice(b))))
            .slice(-8)
            .map((apolice) => valorNumerico(apolice.mensalidade));

        const barrasReceita = [...recentes]
            .reverse()
            .map((apolice) => ({
                label: `AP-${String(apolice.id).padStart(4, "0")}`,
                valor: valorNumerico(apolice.mensalidade),
            }));

        const maioresCoberturas = Object.entries(porCobertura)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        return {
            totalClientes,
            totalApolices: baseApolices.length,
            receitaMensal,
            coberturaTotal,
            percentualMedioCobertura,
            ticketMedio,
            indiceVigencia,
            porCobertura,
            recentes,
            graficoReceita: graficoReceita.length ? graficoReceita : [0, 12, 20, 16, 28, 24, 34, 42],
            barrasReceita,
            maioresCoberturas,
        };
    }, [apolices, clientes]);

    const maiorQuantidade = Math.max(...Object.values(metricas.porCobertura), 1);
    const maiorBarraReceita = Math.max(...metricas.barrasReceita.map((item) => item.valor), 1);

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] px-6 py-12 text-[#FAFAFA] antialiased md:px-16 font-['Inter']">
            <motion.section
                className="mx-auto w-full max-w-7xl"
                initial="hidden"
                animate="visible"
                variants={dashboardGridVariants}
            >
                <motion.div
                    variants={dashboardCardVariants}
                    className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
                >
                    <div>
                        <span className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">Desempenho</span>
                        <h1 className="mt-1 font-['Anton'] text-5xl uppercase tracking-wide text-[#FAFAFA]">Relatórios</h1>
                        <p className="mt-2 text-sm text-[#A1A1AA]">
                            {ultimaAtualizacao
                                ? `Atualizado em ${ultimaAtualizacao.toLocaleTimeString("pt-BR")}`
                                : "Dados sincronizados com clientes e apólices"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void carregarRelatorio()}
                        disabled={carregando}
                        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-5 text-sm font-bold tracking-wider text-[#FAFAFA] transition-all duration-300 ease-out hover:scale-105 hover:border-[#22D3EE] hover:bg-[#22D3EE]/10 hover:text-[#22D3EE] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <ArrowClockwise size={16} className={carregando ? "animate-spin" : ""} />
                        Atualizar
                    </button>
                </motion.div>

                {erro && (
                    <div className="mb-6 rounded-lg border border-[#FF4FD8]/40 bg-[#FF4FD8]/10 px-4 py-3 text-sm text-[#FAFAFA]">
                        {erro}
                    </div>
                )}

                <motion.div
                    variants={dashboardGridVariants}
                    style={{ y: topoY }}
                    className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_0.8fr]"
                >
                    <motion.div
                        variants={dashboardCardVariants}
                        whileHover={{ y: -4, scale: 1.005 }}
                        className="overflow-visible rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(255,79,216,0.08)_48%,rgba(255,255,255,0.04))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-colors duration-300 hover:border-[#22D3EE] hover:shadow-[0_0_26px_rgba(34,211,238,0.22)]"
                    >
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">Receita mensal</p>
                                <p className="mt-3 font-['JetBrains_Mono'] font-mono text-4xl font-semibold text-[#FAFAFA]">{fmtBRL(metricas.receitaMensal)}</p>
                                <p className="mt-2 text-sm text-[#A1A1AA]">
                                    Ticket médio de {fmtBRL(metricas.ticketMedio)} por apólice vigente.
                                </p>
                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#22D3EE]/30 bg-[#22D3EE]/10 px-3 py-2 font-['JetBrains_Mono'] font-mono text-xs text-[#22D3EE]">
                                <TrendUp size={16} weight="bold" />
                                {metricas.totalApolices} apólices
                            </div>
                        </div>

                        <div className="mt-6">
                            <Sparkline valores={metricas.graficoReceita} />
                        </div>
                    </motion.div>

                    <motion.div
                        variants={dashboardCardVariants}
                        whileHover={{ y: -4, scale: 1.005 }}
                        className="rounded-lg border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-colors duration-300 hover:border-[#FF4FD8] hover:bg-[#FF4FD8]/10 hover:shadow-[0_0_26px_rgba(255,79,216,0.22)]"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">Status da carteira</p>
                                <p className="mt-3 text-2xl font-semibold text-[#FAFAFA]">Operação ativa</p>
                            </div>
                            <ShieldCheck size={28} className="text-[#FF4FD8]" weight="bold" />
                        </div>

                        <div className="mt-5 flex justify-center">
                            <ProgressRing valor={metricas.indiceVigencia} />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                                <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Cobertura média</p>
                                <p className="mt-2 font-['JetBrains_Mono'] font-mono text-lg text-[#FAFAFA]">{metricas.percentualMedioCobertura.toFixed(0)}%</p>
                            </div>
                            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                                <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">Clientes</p>
                                <p className="mt-2 font-['JetBrains_Mono'] font-mono text-lg text-[#FAFAFA]">{metricas.totalClientes}</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    variants={dashboardGridVariants}
                    style={{ y: kpisY }}
                    className="relative z-10 mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
                >
                    <KpiCard icon={<UsersThree className="h-5 w-5 text-[#22D3EE]" />} label="Clientes ativos" value={String(metricas.totalClientes)} detail="Base sincronizada" />
                    <KpiCard icon={<FileText className="h-5 w-5 text-[#22D3EE]" />} label="Apólices vigentes" value={String(metricas.totalApolices)} detail={`${metricas.indiceVigencia.toFixed(0)}% da carteira`} />
                    <KpiCard icon={<CurrencyDollar className="h-5 w-5 text-[#22D3EE]" />} label="Ticket médio" value={fmtBRL(metricas.ticketMedio)} detail="Mensalidade média" />
                    <KpiCard icon={<ChartBar className="h-5 w-5 text-[#22D3EE]" />} label="Cobertura total" value={fmtBRL(metricas.coberturaTotal)} detail="Valor protegido" />
                </motion.div>

                <motion.div
                    variants={dashboardGridVariants}
                    style={{ y: graficosY }}
                    className="grid grid-cols-1 gap-6 xl:grid-cols-[0.82fr_1.18fr]"
                >
                    <motion.div
                        variants={dashboardCardVariants}
                        whileHover={{ y: -4, scale: 1.005 }}
                        className="rounded-lg border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition-colors duration-300 hover:border-[#22D3EE] hover:shadow-[0_0_22px_rgba(34,211,238,0.24)]"
                    >
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <p className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">Receita por apólice</p>
                            <span className="font-['JetBrains_Mono'] font-mono text-xs text-[#A1A1AA]">Recentes</span>
                        </div>

                        <div className="flex h-44 items-end gap-3">
                            {metricas.barrasReceita.length > 0 ? (
                                metricas.barrasReceita.map((item) => (
                                    <div key={item.label} className="group relative flex min-w-0 flex-1 flex-col items-center gap-3">
                                        <div className="flex h-32 w-full items-end rounded-md bg-white/[0.04] p-1">
                                            <motion.div
                                                className="w-full rounded bg-[linear-gradient(180deg,#22D3EE,#4F46E5,#FF4FD8)] shadow-[0_0_18px_rgba(34,211,238,0.35)] transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,79,216,0.45)]"
                                                initial={{ height: "8%", opacity: 0.45 }}
                                                animate={{ height: `${Math.max((item.valor / maiorBarraReceita) * 100, 8)}%`, opacity: 1 }}
                                                transition={{ duration: 0.85, ease: "easeOut", delay: 0.35 }}
                                            />
                                        </div>
                                        <div className="pointer-events-none absolute -top-12 left-1/2 z-20 min-w-[112px] -translate-x-1/2 rounded-md border border-[#22D3EE]/45 bg-[#08111F]/95 px-3 py-2 text-center opacity-0 shadow-[0_0_18px_rgba(34,211,238,0.35)] transition-all duration-200 group-hover:-top-14 group-hover:opacity-100">
                                            <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">
                                                {item.label}
                                            </p>
                                            <p className="mt-1 font-['JetBrains_Mono'] font-mono text-xs font-semibold text-[#22D3EE]">
                                                {fmtBRL(item.valor)}
                                            </p>
                                        </div>
                                        <span className="truncate font-['JetBrains_Mono'] font-mono text-[10px] text-[#A1A1AA]">{item.label}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="self-center text-sm text-[#A1A1AA]">
                                    {carregando ? "Carregando receita..." : "Nenhuma apólice encontrada."}
                                </p>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        variants={dashboardCardVariants}
                        whileHover={{ y: -4, scale: 1.005 }}
                        className="rounded-lg border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition-colors duration-300 hover:border-[#22D3EE] hover:shadow-[0_0_22px_rgba(34,211,238,0.24)]"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">Distribuição por cobertura</p>
                                <p className="mt-2 text-sm text-[#A1A1AA]">Planos mais usados na carteira atual.</p>
                            </div>
                            <p className="font-['JetBrains_Mono'] font-mono text-2xl text-[#FAFAFA]">{metricas.percentualMedioCobertura.toFixed(0)}%</p>
                        </div>

                        <div className="space-y-4">
                            {metricas.maioresCoberturas.length > 0 ? (
                                metricas.maioresCoberturas.map(([nome, count]) => {
                                    const pct = (count / Math.max(metricas.totalApolices, 1)) * 100;
                                    return (
                                        <div key={nome} className="group relative">
                                            <div className="flex justify-between gap-4 text-sm mb-1">
                                                <span className="text-[#FAFAFA]">{nome}</span>
                                                <span className="font-['JetBrains_Mono'] font-mono text-[#A1A1AA]">{count} ({pct.toFixed(0)}%)</span>
                                            </div>
                                            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                                                <motion.div
                                                    className="h-full rounded-full bg-[#D946EF]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(count / maiorQuantidade) * 100}%` }}
                                                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.45 }}
                                                />
                                            </div>
                                            <div className="pointer-events-none absolute right-0 top-4 z-20 min-w-[124px] rounded-md border border-[#D946EF]/45 bg-[#13081F]/95 px-3 py-2 text-right opacity-0 shadow-[0_0_18px_rgba(217,70,239,0.35)] transition-all duration-200 group-hover:top-6 group-hover:opacity-100">
                                                <p className="font-['JetBrains_Mono'] font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA]">
                                                    Cobertura
                                                </p>
                                                <p className="mt-1 font-['JetBrains_Mono'] font-mono text-xs font-semibold text-[#FF4FD8]">
                                                    {count} apólice{count === 1 ? "" : "s"} · {pct.toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-[#A1A1AA]">
                                    {carregando ? "Carregando distribuição..." : "Nenhuma apólice encontrada."}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    variants={dashboardCardVariants}
                    whileHover={{ y: -4, scale: 1.003 }}
                    style={{ y: listaY }}
                    className="mt-6 rounded-lg border border-white/10 bg-white/[0.05] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition-colors duration-300 hover:border-[#22D3EE] hover:shadow-[0_0_22px_rgba(34,211,238,0.24)]"
                >
                    <p className="mb-4 font-['JetBrains_Mono'] font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">Apólices recentes</p>
                    <div className="space-y-3">
                        {metricas.recentes.length > 0 ? (
                            metricas.recentes.map((apolice) => {
                                const cliente = obterClienteApolice(apolice, clientes);
                                const veiculo = `${apolice.veiculo?.marca ?? ""} ${apolice.veiculo?.modelo ?? ""}`.trim();

                                return (
                                    <motion.div
                                        key={apolice.id}
                                        variants={dashboardCardVariants}
                                        whileHover={{ x: 4 }}
                                        className="flex items-center justify-between gap-4 rounded-md border border-white/0 border-b-white/10 px-3 py-3 transition-colors duration-300 hover:border-[#22D3EE] hover:bg-white/[0.04] last:border-b-white/0"
                                    >
                                        <div>
                                            <p className="font-medium text-[#FAFAFA]">{cliente?.nome ?? "Cliente não informado"}</p>
                                            <p className="mt-1 font-['JetBrains_Mono'] font-mono text-xs text-[#A1A1AA]">
                                                AP-{String(apolice.id).padStart(4, "0")} · {veiculo || apolice.veiculo?.placa || "Veículo não informado"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-['JetBrains_Mono'] font-mono text-[#FAFAFA]">{fmtBRL(valorNumerico(apolice.mensalidade))}/mês</p>
                                            <p className="mt-1 text-xs text-[#A1A1AA]">{formatarData(obterDataApolice(apolice))}</p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-[#A1A1AA]">
                                {carregando ? "Carregando apólices..." : "Nenhuma apólice encontrada."}
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.section>
        </main>
    );
}

export default Relatorios;
