import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import popular from "../../assets/popular.png";
import luxury from "../../assets/luxury.png";
import sport from "../../assets/sport.png";
import moto from "../../assets/moto.png";
import carroAnimado from "../../assets/carro-animado.mp4";
import Beatriz from "../../assets/equipe/Beatriz.png";
import Daniel from "../../assets/equipe/Daniel.png";
import Juliana from "../../assets/equipe/Juliana.jpeg";
import Lorena from "../../assets/equipe/Lorena.png";
import Luanna from "../../assets/equipe/Luanna.png";
import Lucas from "../../assets/equipe/Lucas.jpeg";

const FIPE_API_BASE = "https://parallelum.com.br/fipe/api/v1/carros";
const PERCENTUAL_COBERTURA_PADRAO = 80;
const HONDA_CITY_HATCH_2024_FIPE = {
  marca: "25",
  modelo: "9733",
  ano: "2024-5",
};

type MarcaFipe = {
  codigo: string;
  nome: string;
};

type ModeloFipe = {
  codigo: number;
  nome: string;
};

type ModelosFipeResponse = {
  modelos: ModeloFipe[];
};

type AnoFipe = {
  codigo: string;
  nome: string;
};

type PrecoFipe = {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  CodigoFipe: string;
  MesReferencia: string;
};

type ComboboxOption = {
  value: string;
  label: string;
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

const obterValorNumericoFipe = (valor: string) =>
  Number(valor.replace(/\./g, "").replace(/[^\d,]/g, "").replace(",", "."));

const normalizarNomeMarca = (nome: string) =>
  nome === "GM - Chevrolet" ? "Chevrolet" : nome;

const normalizarBusca = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function Combobox({
  value,
  inputValue,
  options,
  placeholder,
  disabled = false,
  onInputChange,
  onSelect,
}: {
  value: string;
  inputValue: string;
  options: ComboboxOption[];
  placeholder: string;
  disabled?: boolean;
  onInputChange: (value: string) => void;
  onSelect: (option: ComboboxOption) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const buscaNormalizada = normalizarBusca(inputValue);
  const opcoesFiltradas = options
    .filter((option) => normalizarBusca(option.label).includes(buscaNormalizada))
    .slice(0, 12);

  return (
    <div className="simulator-combobox">
      <input
        type="text"
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onFocus={() => setAberto(true)}
        onChange={(event) => {
          onInputChange(event.target.value);
          setAberto(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setAberto(false), 120);
        }}
      />

      {aberto && !disabled && inputValue && (
        <div className="simulator-options">
          {opcoesFiltradas.length > 0 ? (
            opcoesFiltradas.map((option) => (
              <button
                type="button"
                key={option.value}
                className={value === option.value ? "active" : ""}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(option);
                  setAberto(false);
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <span>Nenhuma opção encontrada</span>
          )}
        </div>
      )}
    </div>
  );
}

function Home() {
  const imageSrc = (image: string | { src: string }) =>
    typeof image === "string" ? image : image.src;
  const [precoFipePopular, setPrecoFipePopular] = useState<PrecoFipe | null>(null);
  const mediaSeguroPopular = precoFipePopular
    ? `${formatarMoeda(Math.max(49.9, obterValorNumericoFipe(precoFipePopular.Valor) * 0.0042))} / mês`
    : "R$ 512 / mês";

  const carros = [
    {
      id: "01",
      tipo: "POPULAR",
      nome: "HONDA CITY HATCH 2024",
      valorFipe: precoFipePopular?.Valor ?? "R$ 122.000",
      mediaSeguro: mediaSeguroPopular,
      descricao:
        "Protecao inteligente para o Honda City Hatch 2024, com resposta rapida e cobertura sem surpresa.",
      imagem: popular,
      fundo: "POPULAR",
    },
    {
      id: "02",
      tipo: "LUXURY",
      nome: "MERCEDES S-CLASS",
      valorFipe: "R$ 985.700",
      mediaSeguro: "R$ 2.050 / mês",
      descricao:
        "Cobertura premium para veículos de alto valor, com atendimento reservado e peças originais.",
      imagem: luxury,
      fundo: "LUXURY",
    },
    {
      id: "03",
      tipo: "SPORT",
      nome: "PORSCHE 911 TURBO",
      valorFipe: "R$ 1.482.900",
      mediaSeguro: "R$ 3.183 / mês",
      descricao:
        "Seguro de performance para quem exige precisão, agilidade e proteção em cada detalhe.",
      imagem: sport,
      fundo: "SPORT",
    },
    {
      id: "04",
      tipo: "MOTO",
      nome: "KAWASAKI NINJA 400",
      valorFipe: "R$ 38.900",
      mediaSeguro: "R$ 179 / mês",
      descricao:
        "Proteção inteligente para motos esportivas, com cobertura ágil, assistência e cálculo ajustado ao perfil do piloto.",
      imagem: moto,
      fundo: "MOTO",
    },
  ];

  const equipe = [
    { nome: "BEATRIZ BRAGA", cargo: "FULLSTACK DEV", imagem: Beatriz },
    { nome: "DANIEL", cargo: "FULLSTACK DEV", imagem: Daniel },
    { nome: "JULIANA", cargo: "FULLSTACK DEV", imagem: Juliana },
    { nome: "LORENA", cargo: "FULLSTACK DEV", imagem: Lorena },
    { nome: "LUANNA", cargo: "FULLSTACK DEV", imagem: Luanna },
    { nome: "LUCAS", cargo: "FULLSTACK DEV", imagem: Lucas },
  ];

  const [carroSelecionado, setCarroSelecionado] = useState(carros[0]);
  const [faqAberta, setFaqAberta] = useState(0);
  const [simulacao, setSimulacao] = useState({
    marca: "",
    modelo: "",
    ano: "",
  });
  const [percentualCobertura, setPercentualCobertura] = useState(PERCENTUAL_COBERTURA_PADRAO);
  const [buscaSimulacao, setBuscaSimulacao] = useState({
    marca: "",
    modelo: "",
    ano: "",
  });
  const [simulacaoEnviada, setSimulacaoEnviada] = useState(false);
  const [marcasFipe, setMarcasFipe] = useState<MarcaFipe[]>([]);
  const [modelosFipe, setModelosFipe] = useState<ModeloFipe[]>([]);
  const [anosFipe, setAnosFipe] = useState<AnoFipe[]>([]);
  const [precoFipe, setPrecoFipe] = useState<PrecoFipe | null>(null);
  const [carregandoFipe, setCarregandoFipe] = useState(false);
  const [erroFipe, setErroFipe] = useState("");
  const carroAtual = carros.find((carro) => carro.id === carroSelecionado.id) ?? carros[0];

  const valorFipeNumerico = precoFipe ? obterValorNumericoFipe(precoFipe.Valor) : 0;
  const fatorCobertura = percentualCobertura / 100;
  const valorFranquia = valorFipeNumerico * 0.05 * fatorCobertura;
  const mensalidadeSimulada = Math.max(49.9, valorFipeNumerico * 0.0042 * fatorCobertura);
  const veiculoComDescontoAntiguidade = precoFipe
    ? new Date().getFullYear() - precoFipe.AnoModelo > 10
    : false;
  const mensalidadeComDesconto = mensalidadeSimulada * 0.8;
  const opcoesMarca = marcasFipe.map((marca) => ({
    value: marca.codigo,
    label: normalizarNomeMarca(marca.nome),
  }));
  const opcoesModelo = modelosFipe.map((modelo) => ({
    value: String(modelo.codigo),
    label: modelo.nome,
  }));
  const opcoesAno = anosFipe.map((ano) => ({
    value: ano.codigo,
    label: ano.nome,
  }));

  useEffect(() => {
    async function buscarFipePopular() {
      try {
        const resposta = await fetch(
          `${FIPE_API_BASE}/marcas/${HONDA_CITY_HATCH_2024_FIPE.marca}/modelos/${HONDA_CITY_HATCH_2024_FIPE.modelo}/anos/${HONDA_CITY_HATCH_2024_FIPE.ano}`
        );
        if (!resposta.ok) throw new Error("Erro ao buscar FIPE do destaque");
        const preco = (await resposta.json()) as PrecoFipe;
        setPrecoFipePopular(preco);
      } catch (error) {
        console.error("Erro ao buscar FIPE do destaque:", error);
      }
    }

    buscarFipePopular();
  }, []);

  useEffect(() => {
    async function buscarMarcas() {
      try {
        setErroFipe("");
        const resposta = await fetch(`${FIPE_API_BASE}/marcas`);
        if (!resposta.ok) throw new Error("Erro ao buscar marcas");
        const marcas = (await resposta.json()) as MarcaFipe[];
        setMarcasFipe(marcas);
      } catch (error) {
        console.error("Erro ao buscar marcas FIPE:", error);
        setErroFipe("Não foi possível carregar as marcas agora.");
      }
    }

    buscarMarcas();
  }, []);

  useEffect(() => {
    async function buscarModelos() {
      if (!simulacao.marca) {
        setModelosFipe([]);
        return;
      }

      try {
        setCarregandoFipe(true);
        setErroFipe("");
        const resposta = await fetch(`${FIPE_API_BASE}/marcas/${simulacao.marca}/modelos`);
        if (!resposta.ok) throw new Error("Erro ao buscar modelos");
        const dados = (await resposta.json()) as ModelosFipeResponse;
        setModelosFipe(dados.modelos);
      } catch (error) {
        console.error("Erro ao buscar modelos FIPE:", error);
        setErroFipe("Não foi possível carregar os modelos desta marca.");
      } finally {
        setCarregandoFipe(false);
      }
    }

    buscarModelos();
  }, [simulacao.marca]);

  useEffect(() => {
    async function buscarAnos() {
      if (!simulacao.modelo) {
        setAnosFipe([]);
        return;
      }

      try {
        setCarregandoFipe(true);
        setErroFipe("");
        const resposta = await fetch(
          `${FIPE_API_BASE}/marcas/${simulacao.marca}/modelos/${simulacao.modelo}/anos`
        );
        if (!resposta.ok) throw new Error("Erro ao buscar anos");
        const anos = (await resposta.json()) as AnoFipe[];
        setAnosFipe(anos);
      } catch (error) {
        console.error("Erro ao buscar anos FIPE:", error);
        setErroFipe("Não foi possível carregar os anos deste modelo.");
      } finally {
        setCarregandoFipe(false);
      }
    }

    buscarAnos();
  }, [simulacao.marca, simulacao.modelo]);

  useEffect(() => {
    async function buscarPreco() {
      if (!simulacao.marca || !simulacao.modelo || !simulacao.ano) {
        setPrecoFipe(null);
        setSimulacaoEnviada(false);
        return;
      }

      try {
        setCarregandoFipe(true);
        setErroFipe("");
        const resposta = await fetch(
          `${FIPE_API_BASE}/marcas/${simulacao.marca}/modelos/${simulacao.modelo}/anos/${simulacao.ano}`
        );
        if (!resposta.ok) throw new Error("Erro ao buscar preço FIPE");
        const preco = (await resposta.json()) as PrecoFipe;
        setPrecoFipe(preco);
      } catch (error) {
        console.error("Erro ao buscar preço FIPE:", error);
        setPrecoFipe(null);
        setErroFipe("Não foi possível carregar o valor FIPE deste veículo.");
      } finally {
        setCarregandoFipe(false);
      }

      setSimulacaoEnviada(false);
    }

    buscarPreco();
  }, [simulacao.marca, simulacao.modelo, simulacao.ano]);

  const duvidasFrequentes = [
    {
      pergunta: "Como funciona a contratação online?",
      resposta:
        "Você preenche os dados do veículo, recebe uma cotação personalizada em minutos e finaliza a contratação digitalmente. Sua apólice fica disponível na hora no painel do cliente.",
    },
    {
      pergunta: "Quais coberturas estão inclusas?",
      resposta:
        "Oferecemos planos com colisão, roubo, furto, danos a terceiros, assistência 24h, carro reserva e proteção contra eventos da natureza. Você escolhe o que faz sentido pra você.",
    },
    {
      pergunta: "Como é calculada a mensalidade?",
      resposta:
        "Levamos em conta o modelo, ano e valor FIPE do veículo, perfil do condutor, região e histórico de uso. Nosso motor de IA encontra o melhor preço para o seu perfil.",
    },
    {
      pergunta: "Em quanto tempo o sinistro é resolvido?",
      resposta:
        "Sinistros simples são aprovados em até 24h. Para casos mais complexos, nosso prazo médio é de 5 dias úteis com acompanhamento em tempo real pelo app.",
    },
    {
      pergunta: "Posso cancelar quando quiser?",
      resposta:
        "Sim! Não cobramos multa por cancelamento. Você cancela direto pelo painel e recebe a devolução proporcional automaticamente.",
    },
  ];

  const benefitsGridVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.24,
        delayChildren: 0.12,
      },
    },
  };

  const benefitCardVariants: Variants = {
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

  return (
    <main className="trustway-page min-h-screen overflow-x-hidden text-[#F0F2F4]">
      <section
        id="home"
        className="hero-section relative isolate min-h-[94vh] px-5 pb-4 pt-64 max-[760px]:min-h-[88vh] max-[760px]:pt-48"
      >
        <div className="hero-noise absolute inset-0 -z-10 pointer-events-none opacity-30" aria-hidden="true" />

        <section className="relative flex min-h-[42vh] items-center justify-center max-[760px]:min-h-[36vh]">
          <p className="absolute top-0 left-[max(7vw,5.5rem)] z-[5] m-0 text-[0.62rem] font-black tracking-[0.24rem] text-[#4F46E5] max-[760px]:left-5 max-[760px]:max-w-[calc(100%-2.5rem)] max-[760px]:tracking-[0.16rem]">
            SEGURO VEICULAR INTELIGENTE
          </p>

          <svg
            className="hero-ghost"
            key={`ghost-${carroAtual.id}`}
            viewBox="0 0 1600 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={`ghost-gradient-${carroAtual.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="42%" stopColor="#4F46E5" />
                <stop offset="72%" stopColor="#D946EF" />
                <stop offset="100%" stopColor="#FF4FD8" />
              </linearGradient>
            </defs>

            <text
              x="50%"
              y="53%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="transparent"
              stroke={`url(#ghost-gradient-${carroAtual.id})`}
              strokeWidth="1.4"
              textLength="1540"
              lengthAdjust="spacingAndGlyphs"
            >
              {carroAtual.fundo}
            </text>
          </svg>

          <div
            className="car-frame relative z-[2] grid w-[min(68vw,1150px)] min-h-[410px] place-items-center overflow-visible max-[1100px]:w-[78vw] max-[760px]:min-h-[360px] max-[760px]:w-full max-[520px]:min-h-[320px]"
            key={`frame-${carroAtual.id}`}
          >
            <div className="price-block absolute left-[-4.2rem] top-10 z-[4] max-[1100px]:left-4 max-[760px]:top-5">
              <p className="m-0 text-[0.58rem] font-black tracking-[0.22rem] text-[#4F46E5] max-[520px]:text-[0.56rem] max-[520px]:tracking-[0.14rem]">
                VALOR FIPE
              </p>

              <h3 className="m-0 font-[var(--font-display)] text-[clamp(2rem,3vw,3.2rem)] font-normal leading-[0.95] tracking-[0.01em] max-[760px]:text-[2.2rem] max-[520px]:text-[1.8rem]">
                {carroAtual.valorFipe}
              </h3>
            </div>

            <img
              src={imageSrc(carroAtual.imagem)}
              alt={carroAtual.nome}
              className="hero-car relative z-[2] h-[min(46vh,460px)] w-full object-contain max-[760px]:h-[310px] max-[520px]:h-[270px]"
            />

            <div className="price-block absolute bottom-6 right-[2%] z-[4] w-[min(30rem,42vw)] max-[1100px]:right-4 max-[760px]:bottom-5 max-[760px]:right-4 max-[760px]:w-[min(24rem,62vw)] max-[520px]:w-[min(19rem,78vw)]">
              <p className="m-0 text-[0.62rem] font-black uppercase tracking-[0.28rem] text-[#4F46E5] max-[760px]:text-[0.58rem] max-[520px]:tracking-[0.16rem]">
                MÉDIA SEGURO
              </p>

              <h3 className="m-0 mt-2 whitespace-nowrap font-[var(--font-display)] text-[clamp(2rem,3vw,3.2rem)] font-normal leading-[0.95] tracking-[0.01em] text-[#F8FAFC] drop-shadow-[0_0.75rem_1.4rem_rgba(0,0,0,0.65)] max-[760px]:text-[2.2rem] max-[520px]:text-[1.8rem]">
                {carroAtual.mediaSeguro}
              </h3>

              <div className="mt-4 h-px w-[min(16rem,68%)] bg-[#4F46E5] shadow-[0_0_18px_rgba(79,70,229,0.45)]" />
            </div>
          </div>
        </section>

        <div
          className="hero-caption relative z-[4] mx-auto mt-0 w-[min(620px,calc(100%-2rem))] text-center"
          key={`caption-${carroAtual.id}`}
        >
          <p className="mb-2 mt-0 text-[0.62rem] font-black tracking-[0.45rem] text-[#F0F2F4]/45 max-[760px]:tracking-[0.24rem]">
            {carroAtual.nome}
          </p>
          <span className="block text-[0.8rem] leading-[1.6] text-[#F0F2F4]/70">
            {carroAtual.descricao}
          </span>
        </div>

        <section
          className="relative z-[5] mt-6 flex flex-wrap justify-center gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-5 max-[760px]:mt-5 max-[760px]:gap-x-5"
          aria-label="Selecionar categoria de veículo"
        >
          {carros.map((carro) => {
            const isActive = carroSelecionado.id === carro.id;

            return (
              <button
                type="button"
                key={carro.id}
                onClick={() => setCarroSelecionado(carro)}
                className={`cursor-pointer border-0 bg-transparent text-center transition duration-200 hover:-translate-y-1 hover:text-[#F0F2F4] ${
                  isActive ? "-translate-y-1 text-[#F0F2F4]" : "text-[#F0F2F4]/35"
                }`}
              >
                <p
                  className={`m-0 text-[0.74rem] font-black ${
                    isActive ? "text-[#4F46E5]" : "text-current"
                  }`}
                >
                  {carro.id}
                </p>

                <div
                  className={`mx-auto my-2 h-0.5 transition-all duration-200 ${
                    isActive ? "w-12 bg-[#4F46E5]" : "w-8 bg-transparent"
                  }`}
                />

                <h3 className="m-0 font-[var(--font-display)] text-[1.2rem] font-normal tracking-[0.08em] max-[520px]:text-lg">
                  {carro.tipo}
                </h3>
              </button>
            );
          })}
        </section>
      </section>

      <section
        id="sobre"
        className="flex min-h-screen items-center justify-center gap-[clamp(3rem,7vw,6rem)] bg-black px-5 py-24 max-[1100px]:flex-col max-[1100px]:items-start max-[1100px]:px-[clamp(1.25rem,8vw,5rem)]"
      >
        <div className="w-[min(520px,100%)]">
          <p className="mb-5 mt-0 text-[0.72rem] font-black tracking-[0.35rem] text-[#4F46E5]">
            SOBRE NÓS
          </p>

          <h2 className="font-impact m-0 text-[clamp(3.2rem,5vw,5.2rem)] font-normal leading-[0.9] tracking-[0.01em]">
            SEGURANÇA
          </h2>

          <svg
            className="about-outline-title mt-3"
            viewBox="0 0 780 150"
            preserveAspectRatio="xMinYMid meet"
            aria-label="SEM LIMITES."
            role="img"
          >
            <defs>
              <linearGradient id="about-outline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="42%" stopColor="#4F46E5" />
                <stop offset="72%" stopColor="#D946EF" />
                <stop offset="100%" stopColor="#FF4FD8" />
              </linearGradient>
            </defs>

            <text
              x="0"
              y="76"
              dominantBaseline="middle"
              fill="transparent"
              stroke="url(#about-outline-gradient)"
              strokeWidth="2.2"
            >
              SEM LIMITES.
            </text>
          </svg>

          <p className="mt-9 max-w-[500px] text-[1rem] leading-[1.75] text-[#F0F2F4]/70">
            A TrustWay redefine o mercado de seguros automotivos premium. Não
            somos apenas uma seguradora; somos guardiões da sua paixão por
            dirigir. Nossa tecnologia integra dados FIPE em tempo real para
            coberturas dinâmicas e precisas.
          </p>

          <div className="mt-11 flex gap-16 max-[520px]:flex-col max-[520px]:gap-6">
            <div>
              <h3 className="font-impact m-0 text-[2.8rem] font-normal leading-[0.9]">
                15k+
              </h3>

              <p className="mt-3 text-[0.68rem] font-black tracking-[0.18rem] text-[#F0F2F4]/35">
                VEÍCULOS PROTEGIDOS
              </p>
            </div>

            <div>
              <h3 className="font-impact m-0 text-[2.8rem] font-normal leading-[0.9]">
                2.4s
              </h3>

              <p className="mt-3 text-[0.7rem] font-black tracking-[0.12rem] text-[#F0F2F4]/35">
                TEMPO DE RESPOSTA
              </p>
            </div>
          </div>
        </div>

        <video
          src={carroAnimado}
          aria-label="Carro animado"
          autoPlay
          muted
          loop
          playsInline
          className="aspect-square w-[min(560px,44vw)] rounded-lg object-cover opacity-75 shadow-[0_2.5rem_5rem_rgba(0,0,0,0.55)] grayscale-[0.2] contrast-[1.12] transition duration-300 hover:scale-[1.015] hover:opacity-95 hover:grayscale-0 hover:contrast-[1.1] max-[1100px]:w-[min(100%,560px)]"
        />
      </section>

      <section
        id="beneficios"
        className="bg-[#18181b] px-10 py-25 max-[760px]:px-5"
      >
        <div className="mx-auto w-[min(1400px,100%)]">
          <div className="mb-[4.4rem] flex items-end justify-between gap-8 max-[760px]:block">
            <h2 className="m-0 font-[var(--font-display)] text-[clamp(3.1rem,5.8vw,5.4rem)] font-normal leading-[0.9] tracking-[0.03em]">
              VANTAGENS PREMIUM
            </h2>

            <p className="mb-2 mt-0 text-[0.72rem] font-black tracking-[0.25rem] text-[#4F46E5]">
              PROTEÇÃO TOTAL
            </p>
          </div>

          <motion.div
            className="grid grid-cols-3 border border-[#F0F2F4]/10 max-[760px]:grid-cols-1"
            variants={benefitsGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.28 }}
          >
            {[
              {
                titulo: "ASSISTÊNCIA 24H VIP",
                texto:
                  "Guincho e socorro mecânico em todo território nacional com atendimento prioritário.",
              },
              {
                titulo: "PEÇAS ORIGINAIS",
                texto:
                  "Garantia total de reposição com componentes de fábrica certificados.",
              },
              {
                titulo: "UPGRADE DE APÓLICE",
                texto:
                  "Ajuste seu seguro instantaneamente conforme o valor de mercado do seu veículo.",
              },
            ].map((beneficio, index) => (
              <motion.div
                key={index}
                variants={benefitCardVariants}
                className="benefit-card-neon relative min-h-[230px] border-r border-[#F0F2F4]/10 bg-[#050505] p-[clamp(2rem,4vw,3.2rem)] transition duration-300 hover:z-[2] hover:-translate-y-1 hover:border-transparent hover:bg-[#0b0b0c] last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0"
              >
                <p className="mb-8 mt-0 text-[0.75rem] font-black text-[#4F46E5]">
                  0{index + 1}
                </p>

                <h3 className="mb-4 mt-0 font-[var(--font-display)] text-[2rem] font-normal tracking-[0.05em]">
                  {beneficio.titulo}
                </h3>

                <span className="leading-[1.75] text-[#F0F2F4]/70">{beneficio.texto}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        id="simulador"
        className="simulator-section relative isolate grid min-h-screen grid-cols-[minmax(0,680px)_minmax(360px,520px)] items-center justify-center gap-[clamp(2rem,4vw,4rem)] overflow-hidden bg-black px-[clamp(1.25rem,6vw,6rem)] py-28 max-[980px]:grid-cols-1 max-[760px]:py-24"
      >
        <div className="simulator-copy">
          <p className="mb-6 mt-0 text-[0.72rem] font-black tracking-[0.4rem] text-[#22D3EE] max-[520px]:tracking-[0.22rem]">
            COTAÇÃO INTELIGENTE
          </p>

          <h2 className="m-0 max-w-[620px] font-[var(--font-impact)] text-[clamp(4rem,8vw,7.5rem)] font-normal leading-[0.9] tracking-[0.01em] text-[#F0F2F4]">
            Sua proteção começa{" "}
            <span className="animated-gradient-text inline-block">aqui.</span>
          </h2>

          <p className="mt-9 max-w-[610px] text-[clamp(1rem,1.5vw,1.35rem)] leading-[1.65] text-[#F0F2F4]/78">
            Simule seu seguro em poucos minutos e descubra a cobertura ideal para o
            seu veículo. Na <span className="text-[#22D3EE]">Trust Way</span>, sua
            segurança vem em primeiro lugar.
          </p>
        </div>

        <form
          className="simulator-card"
          onSubmit={(event) => {
            event.preventDefault();
            setSimulacaoEnviada(true);
          }}
        >
          <h3>Simule seu seguro</h3>

          <label>
            <span>Marca do veículo</span>
            <Combobox
              value={simulacao.marca}
              inputValue={buscaSimulacao.marca}
              options={opcoesMarca}
              placeholder="Digite a marca"
              onInputChange={(value) => {
                setBuscaSimulacao({ marca: value, modelo: "", ano: "" });
                setSimulacao({ marca: "", modelo: "", ano: "" });
                setModelosFipe([]);
                setAnosFipe([]);
                setPrecoFipe(null);
              }}
              onSelect={(option) => {
                setBuscaSimulacao({ marca: option.label, modelo: "", ano: "" });
                setSimulacao({ marca: option.value, modelo: "", ano: "" });
                setModelosFipe([]);
                setAnosFipe([]);
                setPrecoFipe(null);
              }}
            />
          </label>

          <label>
            <span>Modelo do veículo</span>
            <Combobox
              value={simulacao.modelo}
              inputValue={buscaSimulacao.modelo}
              options={opcoesModelo}
              placeholder={simulacao.marca ? "Digite o modelo" : "Escolha uma marca primeiro"}
              disabled={!simulacao.marca || carregandoFipe}
              onInputChange={(value) => {
                setBuscaSimulacao((atual) => ({ ...atual, modelo: value, ano: "" }));
                setSimulacao((atual) => ({ ...atual, modelo: "", ano: "" }));
                setAnosFipe([]);
                setPrecoFipe(null);
              }}
              onSelect={(option) => {
                setBuscaSimulacao((atual) => ({ ...atual, modelo: option.label, ano: "" }));
                setSimulacao((atual) => ({ ...atual, modelo: option.value, ano: "" }));
                setAnosFipe([]);
                setPrecoFipe(null);
              }}
            />
          </label>

          <label>
            <span>Ano do veículo</span>
            <Combobox
              value={simulacao.ano}
              inputValue={buscaSimulacao.ano}
              options={opcoesAno}
              placeholder={simulacao.modelo ? "Digite o ano" : "Escolha um modelo primeiro"}
              disabled={!simulacao.modelo || carregandoFipe}
              onInputChange={(value) => {
                setBuscaSimulacao((atual) => ({ ...atual, ano: value }));
                setSimulacao((atual) => ({ ...atual, ano: "" }));
                setPrecoFipe(null);
              }}
              onSelect={(option) => {
                setBuscaSimulacao((atual) => ({ ...atual, ano: option.label }));
                setSimulacao((atual) => ({ ...atual, ano: option.value }));
              }}
            />
          </label>

          {erroFipe && <p className="simulator-error">{erroFipe}</p>}

          <button type="submit" disabled={!precoFipe || carregandoFipe}>
            {carregandoFipe ? "Carregando FIPE..." : "Simular Agora"}
          </button>

          {simulacaoEnviada && precoFipe && (
            <div className="simulator-result" role="status">
              <span>Estimativa baseada na tabela FIPE</span>
              {veiculoComDescontoAntiguidade ? (
                <div className="mt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <strong className="!mt-0 text-[#F0F2F4]/45 line-through decoration-[#F0F2F4]/55 decoration-2">
                      {formatarMoeda(mensalidadeSimulada)} / mês
                    </strong>
                    <span className="!block rounded-md border border-[#22D3EE]/35 bg-[#22D3EE]/10 px-3 py-1 text-[0.72rem] font-black tracking-[0.12rem] text-[#22D3EE]">
                      -20%
                    </span>
	                  </div>
	                  <strong>{formatarMoeda(mensalidadeComDesconto)} / mês</strong>
	                  <small className="mt-2 block text-[0.74rem] font-bold leading-[1.5] text-[#F0F2F4]/58">
	                    *Desconto aplicado para veículos com mais de 10 anos.
	                  </small>
	                </div>
	              ) : (
                <strong>{formatarMoeda(mensalidadeSimulada)} / mês</strong>
              )}

              <div className="simulator-result-grid">
                <p>
                  <span>Valor FIPE</span>
                  <strong>{precoFipe.Valor}</strong>
                </p>

                <p>
                  <span>Franquia</span>
                  <strong>{formatarMoeda(valorFranquia)}</strong>
                </p>
              </div>

              <div className="simulator-coverage-control">
                <div>
                  <span>Cobertura dos danos</span>
                  <strong>{percentualCobertura}%</strong>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={percentualCobertura}
                  onChange={(event) => setPercentualCobertura(Number(event.target.value))}
                  aria-label="Percentual de cobertura"
                />
              </div>

	              <Link
	                to="/cadastro"
	                className="mt-4 flex min-h-[3.6rem] items-center justify-center rounded-lg border border-[#22D3EE]/25 bg-[#F0F2F4]/[0.035] px-5 text-center text-[0.95rem] font-black shadow-[0_0_20px_rgba(34,211,238,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-[#22D3EE]/45 hover:bg-[#F0F2F4]/[0.055]"
	              >
	                <span className="animated-gradient-text">Contrate agora</span>
	              </Link>
            </div>
          )}
        </form>
      </section>

      <section
        id="duvidas"
        className="faq-section relative isolate overflow-hidden bg-[#02050a] px-10 py-28 max-[760px]:px-5"
      >
        <div className="faq-orbit" aria-hidden="true" />

        <div className="mx-auto w-[min(980px,100%)]">
          <div className="mb-14 text-center">
            <p className="mb-4 mt-0 text-[0.72rem] font-black tracking-[0.45rem] text-[#22D3EE] max-[520px]:tracking-[0.22rem]">
              TIRE SUAS DÚVIDAS
            </p>

            <h2 className="m-0 font-[var(--font-display)] text-[clamp(4rem,8vw,7rem)] font-normal leading-[0.88] tracking-[0.03em] text-[#F0F2F4]">
              Dúvidas{" "}
              <span className="animated-gradient-text inline-block">
                Frequentes
              </span>
            </h2>
          </div>

          <div className="grid gap-4">
            {duvidasFrequentes.map((duvida, index) => {
              const estaAberta = faqAberta === index;

              return (
                <div
                  key={duvida.pergunta}
                  className={`faq-item ${estaAberta ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => setFaqAberta(estaAberta ? -1 : index)}
                    aria-expanded={estaAberta}
                  >
                    <span>{duvida.pergunta}</span>
                    <CaretDown
                      size={19}
                      weight="bold"
                      className="faq-caret"
                      aria-hidden="true"
                    />
                  </button>

                  <div className="faq-answer" aria-hidden={!estaAberta}>
                    <p>{duvida.resposta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="equipe" className="bg-black px-10 py-30 text-center max-[760px]:px-5">
        <h2 className="animated-gradient-text font-impact m-0 text-[clamp(4rem,7.5vw,7rem)] font-normal leading-[0.88] tracking-[0.02em]">
          EQUIPE
        </h2>

        <p className="mb-[4.4rem] mt-4 text-[0.72rem] font-black tracking-[0.25rem] text-[#F0F2F4]/35">
          DESENVOLVEDORES POR TRÁS DA TRUSTWAY
        </p>

        <div className="flex flex-wrap justify-center gap-7">
          {equipe.map((pessoa, index) => (
            <div key={index} className="team-member-card w-[210px]">
              <img
                src={imageSrc(pessoa.imagem)}
                alt={pessoa.nome}
                className="relative z-[1] h-[270px] w-[210px] bg-[#181818] object-cover transition duration-300"
              />

              <h3 className="mb-1 mt-4 font-[var(--font-display)] text-[1.55rem] font-normal tracking-[0.05em]">
                {pessoa.nome}
              </h3>

              <p className="m-0 text-[0.68rem] font-black tracking-[0.13rem] text-[#4F46E5]">
                {pessoa.cargo}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
