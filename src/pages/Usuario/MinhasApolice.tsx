import { useEffect, useState } from "react";
import { ArrowLeft, User, MagnifyingGlass, Car, ShieldCheck, CurrencyDollar, Calendar, FileText, Warning, Receipt, CopySimple, } from "@phosphor-icons/react";

// Definição dos tipos baseados no padrão do seu backend
type Veiculo = {
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  precoFipe: number;
  codigoFipe?: string;
};

type Apolice = {
  id_apolice: number;
  mensalidade: number;
  cobertura: string;
  franquia: number;
  data_inicio: string;
  status: string;
  veiculo: Veiculo;
};

// Dados simulados do cliente logado para o cabeçalho
const clienteLogado = {
  nome: "Ana Beatriz Costa",
};

export function MinhasApolices() {
  const [apolices, setApolices] = useState<Apolice[]>([]);
  const [busca, setBusca] = useState("");
  const [coberturaSelecionada, setCoberturaSelecionada] = useState("Todos");
  const [valorFipeByCodigo, setValorFipeByCodigo] = useState<Record<string, string>>({});

  const BRASIL_API_BASE = "https://brasilapi.com.br/api";

  const buscarValorFipe = async (codigoFipe: string) => {
    try {
      const response = await fetch(`${BRASIL_API_BASE}/fipe/preco/v1/${codigoFipe}`);
      if (!response.ok) throw new Error("Erro ao buscar preço FIPE");
      const data = await response.json();
      setValorFipeByCodigo((prev) => ({ ...prev, [codigoFipe]: data.valor }));
    } catch (error) {
      console.error(error);
    }
  };

  const buscarValoresFipe = async (apolices: Apolice[]) => {
    const codigos = Array.from(
      new Set(
        apolices
          .map((apolice) => apolice.veiculo.codigoFipe)
          .filter(Boolean) as string[]
      )
    );

    await Promise.all(codigos.map((codigo) => buscarValorFipe(codigo)));
  };

  // --- Funções de Formatação herdadas do seu código base ---
  const formatarMoeda = (valor?: number | string) => {
    const valorNumerico = Number(valor);
    if (Number.isNaN(valorNumerico)) return "-";
    return valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
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

  const normalizarTexto = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();

  // --- Simulação da busca de dados (Integre com sua função 'buscar' do backend depois) ---
  async function buscarApolices() {
    try {
      // Mock de dados para você visualizar a tela cheia ao testar
      const dadosMock: Apolice[] = [
        {
          id_apolice: 1,
          mensalidade: 320,
          cobertura: "Contra Roubo",
          franquia: 2800,
          data_inicio: "2025-01-15",
          status: "Ativa",
          veiculo: {
            marca: "Honda",
            modelo: "Civic Sedan Touring",
            ano: 2022,
            placa: "ABC-1D23",
            precoFipe: 142500,
            codigoFipe: "001004-9",
          },
        },
      ];
      setApolices(dadosMock);
      buscarValoresFipe(dadosMock);
    } catch (error) {
      console.log("Erro ao buscar apólices do cliente:", error);
    }
  }

  useEffect(() => {
    buscarApolices();
  }, []);

  // --- Sistema de Filtro adaptado para Carros e Placas ---
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

    // Correto: Se for "Todos", ignora a cobertura. Se não for, valida se bate com a escolhida.
    const correspondeCobertura =
      coberturaSelecionada === "Todos" ||
      apolice.cobertura === coberturaSelecionada;

    return correspondeBusca && correspondeCobertura;
  });


  return (
    <div className="min-h-screen bg-[#16151E] text-[#fafafa] font-sans">
      {/* Top bar do Cliente */}
      <header className="border-b border-white/10 bg-[#16151E]/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors">
              <ArrowLeft className="h-4 w-4" /> Voltar ao início
            </a>
            <div className="h-5 w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold tracking-wider uppercase">Trustway</p>
              <p className="text-[10px] text-[#a1a1aa] font-mono uppercase tracking-[0.2em]">
                Área do Cliente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <User className="h-3.5 w-3.5 text-[#a1a1aa]" />
              <span className="text-xs font-medium max-w-[120px] truncate">{clienteLogado.nome}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Cabeçalho da Seção */}
        <div className="mb-8">
          <p className="font-mono text-xs text-[#a1a1aa] uppercase tracking-[0.2em]">Proteção Ativa</p>
          <h1 className="text-4xl font-extrabold uppercase tracking-wider mt-1">Minhas Apólices</h1>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a1a1aa]">Apólices cadastradas</p>
            <p className="mt-3 text-3xl font-bold">{apolices.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a1a1aa]">Filtro de busca</p>
            <p className="mt-3 text-lg text-[#fafafa]">{busca || "Todas as placas/modelos"}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#a1a1aa]">Cobertura selecionada</p>
            <p className="mt-3 text-lg text-[#fafafa]">{coberturaSelecionada}</p>
          </div>
        </div>

        {/* Barra de Filtros */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
            <input
              type="text"
              placeholder="Buscar por placa, modelo ou marca do veículo..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-5 py-3.5 text-sm outline-none text-[#fafafa] placeholder:text-[#a1a1aa] focus:border-[#9D4EDD] transition-colors"
            />
          </div>

          <select
            value={coberturaSelecionada}
            onChange={(evento) => setCoberturaSelecionada(evento.target.value)}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm outline-none text-[#fafafa] focus:border-[#9D4EDD] transition-colors"
          >
            <option value="Todos" className="bg-[#16151E] text-[#fafafa]">Todas as Coberturas</option>
            <option value="Contra Roubo" className="bg-[#16151E] text-[#fafafa]">Contra Roubo</option>
            <option value="Contra Colisão" className="bg-[#16151E] text-[#fafafa]">Contra Colisão</option>
            <option value="Para Terceiros" className="bg-[#16151E] text-[#fafafa]">Para Terceiros</option>
            <option value="Contra Enchente" className="bg-[#16151E] text-[#fafafa]">Contra Enchente</option>
            <option value="Carro Reserva" className="bg-[#16151E] text-[#fafafa]">Carro Reserva</option>
            <option value="Vidros" className="bg-[#16151E] text-[#fafafa]">Vidros</option>
          </select>
        </section>

        {/* Conteúdo / Cards de Apólices */}
        <div className="space-y-6">
          {apolicesFiltradas.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-16 text-center text-[#a1a1aa]">
              Nenhuma apólice de veículo encontrada.
            </div>
          ) : (
            apolicesFiltradas.map((apolice) => (
              <div key={apolice.id_apolice} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card Esquerdo: Detalhes do Veículo */}
                <div className="md:col-span-2 rounded-lg border border-white/10 bg-white/5 overflow-hidden flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between gap-3 text-[#a1a1aa] mb-4">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        <span className="font-mono text-xs uppercase tracking-wider">Veículo Segurado</span>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 shadow-sm font-mono text-white text-[11px] px-3 py-2 rounded-xl uppercase tracking-[0.18em]">
                        <ShieldCheck className="h-6 w-6 text-emerald-400" color="#22c55e" />
                        <span className="font-semibold leading-none text-white">{apolice.status}</span>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold uppercase tracking-wide">
                      {apolice.veiculo?.marca} {apolice.veiculo?.modelo}
                    </h2>
                    <p className="text-sm text-[#a1a1aa] mt-1">Ano Modelo: {apolice.veiculo?.ano}</p>
                    <div className="mt-2 text-sm">
                      <p className="uppercase tracking-[0.2em] text-[#9D4EDD] font-semibold">Plano de Cobertura</p>
                      <p className="text-xl font-bold text-[#9D4EDD]">{apolice.cobertura}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa]">Placa</p>
                      <p className="text-lg font-mono font-semibold tracking-wide mt-0.5">{apolice.veiculo?.placa}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa]">Valor FIPE</p>
                      <p className="text-lg font-mono font-semibold text-[#a1a1aa] mt-0.5">
                        {apolice.veiculo?.codigoFipe && valorFipeByCodigo[apolice.veiculo.codigoFipe]
                          ? valorFipeByCodigo[apolice.veiculo.codigoFipe]
                          : formatarMoeda(apolice.veiculo?.precoFipe)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Direito: Financeiro */}
                <div className="rounded-lg border border-white/10 bg-white/5 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[#a1a1aa] mb-6">
                      <CurrencyDollar className="h-5 w-5" />
                      <span className="font-mono text-xs uppercase tracking-wider">Valores e Custos</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa]">Mensalidade</p>
                        <p className="text-3xl font-bold text-[#9D4EDD] tracking-wider mt-1">{formatarMoeda(apolice.mensalidade)}</p>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa]">Franquia Obrigatória</p>
                        <p className="text-xl font-mono font-medium mt-1">{formatarMoeda(apolice.franquia)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-sm text-[#fafafa] text-left font-medium transition-colors hover:text-emerald-300"
                      >
                        <Receipt className="h-4 w-4 text-[#a1a1aa]" />
                        Histórico de Pagamentos
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-sm text-[#fafafa] text-left font-medium transition-colors hover:text-emerald-300"
                      >
                        <CopySimple className="h-4 w-4 text-[#a1a1aa]" />
                        Pagar
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-[#a1a1aa]">
                    <Calendar className="h-4 w-4" />
                    <span>Início da vigência: {formatarData(apolice.data_inicio)}</span>
                  </div>
                </div>

                {/* Card Inferior: Dados Técnicos do Contrato */}
                <div className="md:col-span-3 rounded-lg border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-3 text-[#a1a1aa] mb-4">
                    <FileText className="h-5 w-5" />
                    <span className="font-mono text-xs uppercase tracking-wider">Dados do Contrato</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa]">Código da Apólice</p>
                      <p className="font-mono text-sm font-semibold">#000{apolice.id_apolice}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa]">Abrangência</p>
                      <p className="text-sm text-[#a1a1aa]">Nacional (Território Brasileiro)</p>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Central de Acionamento de Emergência */}
        <div className="mt-8 rounded-lg border border-[#9D4EDD]/20 bg-[#9D4EDD]/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <Warning className="h-5 w-5 text-[#9D4EDD] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Precisa de assistência ou sofreu um sinistro?</p>
              <p className="text-xs text-[#a1a1aa] mt-0.5">Nossa central de suporte funciona 24 horas por dia para colisões, guinchos e chaveiro.</p>
            </div>
          </div>
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%20Trustway%2C%20preciso%20de%20assist%C3%AAncia."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center bg-[#9D4EDD] hover:bg-[#7A39C6] text-white font-mono text-xs uppercase tracking-wider px-5 py-3 rounded-xl shrink-0 w-full sm:w-auto font-semibold transition-colors"
          >
            Acionar Seguro
          </a>
        </div>
      </main>
    </div>
  );
}
