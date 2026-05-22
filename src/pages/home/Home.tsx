import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";

import popular from "../../assets/popular.png";
import luxury from "../../assets/luxury.png";
import sport from "../../assets/sport.png";
import garagem from "../../assets/garagem.png";
import Beatriz from "../../assets/equipe/Beatriz.jpg";
import Daniel from "../../assets/equipe/Daniel.png";
import Juliana from "../../assets/equipe/Juliana.jpg";
import Lorena from "../../assets/equipe/Lorena.png";
import Luanna from "../../assets/equipe/Luanna.png";
import Lucas from "../../assets/equipe/Lucas.png";

function Home() {
  const imageSrc = (image: string | { src: string }) =>
    typeof image === "string" ? image : image.src;

  const carros = [
    {
      id: "01",
      tipo: "POPULAR",
      nome: "HONDA CIVIC 2024",
      valorFipe: "R$ 142.500",
      mediaSeguro: "R$ 3.840 / ano",
      descricao:
        "Proteção inteligente para o carro de rotina, com resposta rápida e cobertura sem surpresa.",
      imagem: popular,
      fundo: "POPULAR",
    },
    {
      id: "02",
      tipo: "LUXURY",
      nome: "MERCEDES S-CLASS",
      valorFipe: "R$ 985.700",
      mediaSeguro: "R$ 24.600 / ano",
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
      mediaSeguro: "R$ 38.200 / ano",
      descricao:
        "Seguro de performance para quem exige precisão, agilidade e proteção em cada detalhe.",
      imagem: sport,
      fundo: "SPORT",
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
  const [simulacaoEnviada, setSimulacaoEnviada] = useState(false);

  const anoSimulado = Number(simulacao.ano);
  const mensalidadeSimulada =
    anoSimulado > 0
      ? Math.max(189, 520 - Math.min(Math.max(new Date().getFullYear() - anoSimulado, 0), 18) * 13)
      : 289;

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
        id="showcase"
        className="hero-section relative isolate min-h-screen px-5 pb-10 pt-24 max-[760px]:pt-24"
      >
        <div className="hero-noise absolute inset-0 -z-10 pointer-events-none opacity-30" aria-hidden="true" />

        <section className="relative flex min-h-[58vh] items-center justify-center max-[760px]:min-h-[52vh]">
          <p className="absolute top-0 left-[max(7vw,5.5rem)] z-[5] m-0 text-[0.62rem] font-black tracking-[0.24rem] text-[#4F46E5] max-[760px]:left-5 max-[760px]:max-w-[calc(100%-2.5rem)] max-[760px]:tracking-[0.16rem]">
            AUTO INSURANCE / FIPE INTELLIGENCE
          </p>

          <svg
            className="hero-ghost"
            key={`ghost-${carroSelecionado.id}`}
            viewBox="0 0 1600 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={`ghost-gradient-${carroSelecionado.id}`}
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
              stroke={`url(#ghost-gradient-${carroSelecionado.id})`}
              strokeWidth="1.4"
              textLength="1540"
              lengthAdjust="spacingAndGlyphs"
            >
              {carroSelecionado.fundo}
            </text>
          </svg>

          <div
            className="car-frame relative z-[2] grid w-[min(68vw,1150px)] min-h-[410px] place-items-center overflow-visible max-[1100px]:w-[78vw] max-[760px]:min-h-[360px] max-[760px]:w-full max-[520px]:min-h-[320px]"
            key={`frame-${carroSelecionado.id}`}
          >
            <div className="price-block absolute left-[-4.2rem] top-10 z-[4] max-[1100px]:left-4 max-[760px]:top-5">
              <p className="m-0 text-[0.58rem] font-black tracking-[0.22rem] text-[#4F46E5] max-[520px]:text-[0.56rem] max-[520px]:tracking-[0.14rem]">
                VALOR FIPE
              </p>

              <h3 className="m-0 font-[var(--font-display)] text-[clamp(2rem,3vw,3.2rem)] font-normal leading-[0.95] tracking-[0.01em] max-[760px]:text-[2.2rem] max-[520px]:text-[1.8rem]">
                {carroSelecionado.valorFipe}
              </h3>
            </div>

            <img
              src={imageSrc(carroSelecionado.imagem)}
              alt={carroSelecionado.nome}
              className="hero-car relative z-[2] h-[min(46vh,460px)] w-full object-contain max-[760px]:h-[310px] max-[520px]:h-[270px]"
            />

            <div className="price-block absolute right-[-3.6rem] bottom-10 z-[4] px-6 py-4 max-[1100px]:right-4 max-[760px]:bottom-4 max-[760px]:p-0">
              <p className="m-0 text-[0.58rem] font-black tracking-[0.22rem] text-[#4F46E5] max-[520px]:text-[0.56rem] max-[520px]:tracking-[0.14rem]">
                MÉDIA SEGURO
              </p>

              <h3 className="m-0 font-[var(--font-display)] text-[clamp(2rem,3vw,3.2rem)] font-normal leading-[0.95] tracking-[0.01em] max-[760px]:text-[2.2rem] max-[520px]:text-[1.8rem]">
                {carroSelecionado.mediaSeguro}
              </h3>
            </div>
          </div>
        </section>

        <div
          className="hero-caption relative z-[4] mx-auto mt-0 w-[min(620px,calc(100%-2rem))] text-center"
          key={`caption-${carroSelecionado.id}`}
        >
          <p className="mb-2 mt-0 text-[0.62rem] font-black tracking-[0.45rem] text-[#F0F2F4]/45 max-[760px]:tracking-[0.24rem]">
            {carroSelecionado.nome}
          </p>
          <span className="block text-[0.8rem] leading-[1.6] text-[#F0F2F4]/70">
            {carroSelecionado.descricao}
          </span>
        </div>

        <section
          className="relative z-[5] mt-12 flex justify-center gap-[clamp(2rem,5vw,4.5rem)] max-[760px]:mt-10 max-[760px]:gap-5"
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

        <img
          src={imageSrc(garagem)}
          alt="Garagem escura"
          className="aspect-square w-[min(560px,44vw)] rounded-lg object-cover opacity-75 shadow-[0_2.5rem_5rem_rgba(0,0,0,0.55)] grayscale-[0.2] contrast-[1.12] transition duration-300 hover:scale-[1.015] hover:opacity-95 hover:grayscale-0 hover:contrast-[1.1] max-[1100px]:w-[min(100%,560px)]"
        />
      </section>

      <section
        id="beneficios"
        className="bg-[#18181b] px-10 py-25 max-[760px]:px-5"
      >
        <div className="mx-auto w-[min(1400px,100%)]">
          <div className="mb-[4.4rem] flex items-end justify-between gap-8 max-[760px]:block">
            <h2 className="m-0 font-[var(--font-display)] text-[clamp(3.8rem,7vw,6.5rem)] font-normal leading-[0.88] tracking-[0.03em]">
              VANTAGENS PREMIUM
            </h2>

            <p className="mb-2 mt-0 text-[0.72rem] font-black tracking-[0.25rem] text-[#4F46E5]">
              FULL COVERAGE
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
            <input
              type="text"
              placeholder="Ex: Toyota"
              value={simulacao.marca}
              onChange={(event) =>
                setSimulacao((atual) => ({ ...atual, marca: event.target.value }))
              }
            />
          </label>

          <label>
            <span>Modelo do veículo</span>
            <input
              type="text"
              placeholder="Ex: Corolla"
              value={simulacao.modelo}
              onChange={(event) =>
                setSimulacao((atual) => ({ ...atual, modelo: event.target.value }))
              }
            />
          </label>

          <label>
            <span>Ano do veículo</span>
            <input
              type="number"
              min="1990"
              max={new Date().getFullYear() + 1}
              placeholder="Ex: 2022"
              value={simulacao.ano}
              onChange={(event) =>
                setSimulacao((atual) => ({ ...atual, ano: event.target.value }))
              }
            />
          </label>

          <button type="submit">Simular Agora</button>

          {simulacaoEnviada && (
            <div className="simulator-result" role="status">
              <span>Estimativa inicial</span>
              <strong>R$ {mensalidadeSimulada},00 / mês</strong>
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
