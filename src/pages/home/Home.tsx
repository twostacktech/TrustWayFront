import { useState } from "react";

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

  return (
    <main className="trustway-page min-h-screen overflow-x-hidden text-white">
      <section
        id="showcase"
        className="hero-section relative isolate min-h-screen px-5 pb-10 pt-24 max-[760px]:pt-24"
      >
        <div className="hero-noise absolute inset-0 -z-10 pointer-events-none opacity-30" aria-hidden="true" />

        <section className="relative flex min-h-[58vh] items-center justify-center max-[760px]:min-h-[52vh]">
          <p className="absolute top-0 left-[max(7vw,5.5rem)] z-[5] m-0 text-[0.62rem] font-black tracking-[0.24rem] text-[#ff1744] max-[760px]:left-5 max-[760px]:max-w-[calc(100%-2.5rem)] max-[760px]:tracking-[0.16rem]">
            AUTO INSURANCE / FIPE INTELLIGENCE
          </p>

          <h2 className="hero-ghost" key={`ghost-${carroSelecionado.id}`}>
            {carroSelecionado.fundo}
          </h2>

          <div
            className="car-frame relative z-[2] grid w-[min(68vw,1150px)] min-h-[410px] place-items-center overflow-visible max-[1100px]:w-[78vw] max-[760px]:min-h-[360px] max-[760px]:w-full max-[520px]:min-h-[320px]"
            key={`frame-${carroSelecionado.id}`}
          >
            <div className="price-block absolute left-[-4.2rem] top-10 z-[4] max-[1100px]:left-4 max-[760px]:top-5">
              <p className="m-0 text-[0.58rem] font-black tracking-[0.22rem] text-[#ff1744] max-[520px]:text-[0.56rem] max-[520px]:tracking-[0.14rem]">
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
              <p className="m-0 text-[0.58rem] font-black tracking-[0.22rem] text-[#ff1744] max-[520px]:text-[0.56rem] max-[520px]:tracking-[0.14rem]">
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
          <p className="mb-2 mt-0 text-[0.62rem] font-black tracking-[0.45rem] text-[#68686e] max-[760px]:tracking-[0.24rem]">
            {carroSelecionado.nome}
          </p>
          <span className="block text-[0.8rem] leading-[1.6] text-[#a4a4aa]">
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
                className={`cursor-pointer border-0 bg-transparent text-center transition duration-200 hover:-translate-y-1 hover:text-white ${
                  isActive ? "-translate-y-1 text-white" : "text-[#666]"
                }`}
              >
                <p
                  className={`m-0 text-[0.74rem] font-black ${
                    isActive ? "text-[#ff1744]" : "text-current"
                  }`}
                >
                  {carro.id}
                </p>

                <div
                  className={`mx-auto my-2 h-0.5 transition-all duration-200 ${
                    isActive ? "w-12 bg-[#ff1744]" : "w-8 bg-transparent"
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
        className="flex min-h-screen items-center justify-center gap-[clamp(3rem,6vw,5rem)] bg-black px-5 py-24 max-[1100px]:flex-col max-[1100px]:items-start max-[1100px]:px-[clamp(1.25rem,8vw,5rem)]"
      >
        <div className="w-[min(430px,100%)]">
          <p className="mb-4 mt-0 text-[0.72rem] font-black tracking-[0.24rem] text-[#ff1744]">
            ABOUT THE METHOD
          </p>

          <h2 className="m-0 font-[var(--font-display)] text-[clamp(3.8rem,7vw,6.5rem)] font-normal leading-[0.88] tracking-[0.03em]">
            SEGURANÇA
          </h2>

          <h2 className="m-0 font-[var(--font-display)] text-[clamp(3.8rem,7vw,6.5rem)] font-normal leading-[0.88] tracking-[0.03em] text-[#ff1744]">
            SEM LIMITES.
          </h2>

          <p className="mt-8 text-[1.05rem] leading-[1.85] text-[#aaa]">
            A TrustWay redefine o mercado de seguros automotivos premium. Não
            somos apenas uma seguradora; somos guardiões da sua paixão por
            dirigir. Nossa tecnologia integra dados FIPE em tempo real para
            coberturas dinâmicas e precisas.
          </p>

          <div className="mt-9 flex gap-15 max-[520px]:flex-col max-[520px]:gap-6">
            <div>
              <h3 className="m-0 font-[var(--font-display)] text-[3.4rem] font-normal leading-[0.9]">
                15k+
              </h3>

              <p className="mt-3 text-[0.7rem] font-black tracking-[0.12rem] text-[#555]">
                VEÍCULOS PROTEGIDOS
              </p>
            </div>

            <div>
              <h3 className="m-0 font-[var(--font-display)] text-[3.4rem] font-normal leading-[0.9]">
                2.4s
              </h3>

              <p className="mt-3 text-[0.7rem] font-black tracking-[0.12rem] text-[#555]">
                TEMPO DE RESPOSTA
              </p>
            </div>
          </div>
        </div>

        <img
          src={imageSrc(garagem)}
          alt="Garagem escura"
          className="aspect-square w-[min(620px,46vw)] rounded-lg object-cover opacity-75 shadow-[0_2.5rem_5rem_rgba(0,0,0,0.55)] grayscale-[0.2] contrast-[1.12] transition duration-300 hover:scale-[1.015] hover:opacity-95 hover:grayscale-0 hover:contrast-[1.1] max-[1100px]:w-[min(100%,620px)]"
        />
      </section>

      <section
        id="beneficios"
        className="bg-[linear-gradient(180deg,#151518,#0d0d0f)] px-10 py-25 max-[760px]:px-5"
      >
        <div className="mx-auto w-[min(1400px,100%)]">
          <div className="mb-[4.4rem] flex items-end justify-between gap-8 max-[760px]:block">
            <h2 className="m-0 font-[var(--font-display)] text-[clamp(3.8rem,7vw,6.5rem)] font-normal leading-[0.88] tracking-[0.03em]">
              VANTAGENS PREMIUM
            </h2>

            <p className="mb-2 mt-0 text-[0.72rem] font-black tracking-[0.25rem] text-[#ff1744]">
              FULL COVERAGE
            </p>
          </div>

          <div className="grid grid-cols-3 border border-white/10 max-[760px]:grid-cols-1">
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
              <div
                key={index}
                className="min-h-[230px] border-r border-white/10 bg-[#050505] p-[clamp(2rem,4vw,3.2rem)] transition duration-300 hover:z-[2] hover:-translate-y-2 hover:bg-[#0b0b0c] hover:shadow-[0_1.5rem_3rem_rgba(0,0,0,0.28)] last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0"
              >
                <p className="mb-8 mt-0 text-[0.75rem] font-black text-[#ff1744]">
                  0{index + 1}
                </p>

                <h3 className="mb-4 mt-0 font-[var(--font-display)] text-[2rem] font-normal tracking-[0.05em]">
                  {beneficio.titulo}
                </h3>

                <span className="leading-[1.75] text-[#aaa]">{beneficio.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="equipe" className="bg-black px-10 py-30 text-center max-[760px]:px-5">
        <h2 className="m-0 font-[var(--font-display)] text-[clamp(3.8rem,7vw,6.5rem)] font-normal leading-[0.88] tracking-[0.03em]">
          THE ENGINEERING CORE
        </h2>

        <p className="mb-[4.4rem] mt-4 text-[0.72rem] font-black tracking-[0.25rem] text-[#555]">
          BACKEND & FRONTEND ARCHITECTS
        </p>

        <div className="flex flex-wrap justify-center gap-7">
          {equipe.map((pessoa, index) => (
            <div key={index} className="w-[210px]">
              <img
                src={imageSrc(pessoa.imagem)}
                alt={pessoa.nome}
                className="h-[270px] w-[210px] bg-[#181818] object-cover grayscale transition duration-300 hover:-translate-y-1.5 hover:grayscale-0"
              />

              <h3 className="mb-1 mt-4 font-[var(--font-display)] text-[1.55rem] font-normal tracking-[0.05em]">
                {pessoa.nome}
              </h3>

              <p className="m-0 text-[0.68rem] font-black tracking-[0.13rem] text-[#ff1744]">
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
