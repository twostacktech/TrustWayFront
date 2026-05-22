import {
    UsersThree,
    FileText,
    CurrencyDollar,
    ChartBar,
    ArrowLeft,
} from "@phosphor-icons/react";

import { useNavigate } from "react-router-dom";

function fmtBRL(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
    const navigate = useNavigate();

    const clientes = [
        { id: 1, nome: "João Silva" },
        { id: 2, nome: "Ana Pereira" },
        { id: 3, nome: "Carlos Lima" },
    ];

    const apolices: any[] = [
        { id: "A1", clienteId: 1, mensalidade: 150.5, valor_segurado: 45000, cobertura: "Compreensiva", dataInicio: "2024-05-01", veiculo: { marca: "VW", modelo: "Gol" } },
        { id: "A2", clienteId: 2, mensalidade: 220, valor_segurado: 70000, cobertura: "Cobertura contra roubo", dataInicio: "2024-03-15", veiculo: { marca: "Ford", modelo: "Ka" } },
        { id: "A3", clienteId: 3, mensalidade: 99.9, valor_segurado: 30000, cobertura: "Acidentes Pessoais", dataInicio: "2024-04-10", veiculo: { marca: "Chevrolet", modelo: "Onix" } },
        { id: "A4", clienteId: 1, mensalidade: 180, valor_segurado: 55000, cobertura: "Doenças Graves", dataInicio: "2024-02-20", veiculo: { marca: "Honda", modelo: "Civic" } },
        { id: "A5", clienteId: 2, mensalidade: 130, valor_segurado: 40000, cobertura: "Compreensiva", dataInicio: "2024-01-05", veiculo: { marca: "Toyota", modelo: "Corolla" } },
    ];

    const totalClientes = clientes.length;
    const totalApolices = apolices.length;

    const receitaMensal = apolices.reduce((s, a) => s + Number(a.mensalidade || 0), 0);
    const coberturaTotal = apolices.reduce((s, a) => s + Number(a.valor_segurado || 0), 0);
    const porCobertura = apolices.reduce<Record<string, number>>((acc, a) => {
        const nome = a.cobertura || "Sem cobertura";
        acc[nome] = (acc[nome] ?? 0) + 1;
        return acc;
    }, {});

    // para barras relativas
    const maiorQuantidade = Math.max(...Object.values(porCobertura), 1);

    const recentes = [...apolices]
        .sort((a, b) => {
            const da = a.dataInicio ?? a.data_inicio ?? a.createdAt ?? "";
            const db = b.dataInicio ?? b.data_inicio ?? b.createdAt ?? "";
            return String(db).localeCompare(String(da));
        })
        .slice(0, 5);

    return (
        <section className="min-h-screen bg-black px-24 py-10">
            <div className="max-w-6xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-white mb-8 hover:text-purple-500 transition duration-200 cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </button>

                <div className="mb-8">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Desempenho</p>
                    <h1 className="mt-2 text-5xl font-semibold uppercase tracking-tight text-white">Relatórios</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        <KpiCard icon={<UsersThree className="h-5 w-5 text-purple-400" />} label="Clientes ativos" value={String(totalClientes)} />
                        <KpiCard icon={<FileText className="h-5 w-5 text-purple-400" />} label="Apólices vigentes" value={String(totalApolices)} />
                        <KpiCard icon={<CurrencyDollar className="h-5 w-5 text-purple-400" />} label="Receita mensal" value={fmtBRL(receitaMensal)} />
                        <KpiCard icon={<ChartBar className="h-5 w-5 text-purple-400" />} label="Cobertura total" value={fmtBRL(coberturaTotal)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-3xl border border-purple-800 bg-slate-950 p-6 shadow-sm">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Valor total segurado</p>
                        <p className="mt-4 text-4xl font-semibold text-slate-100">{fmtBRL(coberturaTotal)}</p>
                        <p className="mt-2 text-sm text-slate-500">Soma do valor segurado de todas as apólices.</p>
                    </div>

                    <div className="rounded-3xl border border-purple-800 bg-slate-950 p-6 shadow-sm">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">Distribuição por cobertura</p>
                        <div className="space-y-4">
                            {Object.entries(porCobertura).map(([nome, count]) => {
                                const pct = (count / Math.max(totalApolices, 1)) * 100;
                                return (
                                    <div key={nome}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-white">{nome}</span>
                                            <span className="font-mono text-slate-400">{count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                            <div className="h-full rounded-full bg-purple-800" style={{ width: `${(count / maiorQuantidade) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-3xl border border-purple-800 bg-slate-950 p-6 shadow-sm">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">Apólices recentes</p>
                    <div className="space-y-3">
                        {recentes.map((a: any) => {
                            const cli = clientes.find((c: any) => c.id === a.clienteId || c.id === a.cliente_id);
                            const data = a.dataInicio ?? a.data_inicio ?? a.createdAt ?? "";
                            return (
                                <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                                    <div>
                                        <p className="font-semibold text-white">{cli?.nome ?? "—"}</p>
                                        <p className="mt-1 text-xs text-slate-500 font-mono">{a.id} · {a.veiculo?.marca ?? a.marca ?? ""} {a.veiculo?.modelo ?? a.modelo ?? ""}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-white">{fmtBRL(Number(a.mensalidade || 0))}/mês</p>
                                        <p className="mt-1 text-xs text-slate-500">{data ? new Date(data).toLocaleDateString("pt-BR") : ""}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Relatorios;