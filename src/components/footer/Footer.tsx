import { FacebookLogo, InstagramLogo, WhatsappLogo } from "@phosphor-icons/react";

const footerLinks = [
  { href: "#home", label: "Início" },
  { href: "#sobre", label: "Sobre nós" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#simulador", label: "Simule seu seguro" },
  { href: "#duvidas", label: "Dúvidas" },
];

function Footer() {
  return (
    <footer className="border-t border-[#F0F2F4]/10 bg-[#030305] px-6 py-12 text-[#F0F2F4] md:px-20">
      <div className="mx-auto grid w-[min(1180px,100%)] gap-10 md:grid-cols-[1.25fr_0.85fr_0.9fr]">
        <div>
          <h2 className="m-0 font-[var(--font-display)] text-4xl tracking-[0.22em]">
            TRUSTWAY
          </h2>
          <p className="mt-4 max-w-[340px] text-sm leading-7 text-[#F0F2F4]/58">
            Seguro automotivo inteligente e pensado para acompanhar você em cada trajeto.
          </p>
        </div>

        <nav aria-label="Links do rodapé">
          <p className="mb-4 mt-0 text-[0.68rem] font-black uppercase tracking-[0.22rem] text-[#4F46E5]">
            Navegação
          </p>
          <div className="grid gap-3">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-[#F0F2F4]/62 transition-colors hover:text-[#22D3EE]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div>
          <p className="mb-4 mt-0 text-[0.68rem] font-black uppercase tracking-[0.22rem] text-[#4F46E5]">
            Atendimento
          </p>
          <div className="grid gap-3 text-sm font-bold text-[#F0F2F4]/62">
            <span>suporte@trustway.com</span>
            <span>Contratação 24hrs</span>
            <span>Contratação 100% online</span>
          </div>
        </div>
      </div>

      <div className="-mx-6 mt-10 border-t border-[#F0F2F4]/10 px-6 pt-6 md:-mx-20 md:px-20">
        <div className="mx-auto grid w-[min(1180px,100%)] gap-5 text-center text-[0.68rem] font-black uppercase tracking-[0.18rem] text-[#F0F2F4]/35 md:grid-cols-[1.25fr_0.85fr_0.9fr] md:items-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <span>2026 TrustWay</span>
            <div className="flex items-center gap-2" aria-label="Redes sociais">
              <a
                href="#"
                aria-label="Instagram"
                className="grid size-8 place-items-center rounded-md border border-[#F0F2F4]/12 text-[#F0F2F4]/60 transition hover:border-[#22D3EE]/55 hover:text-[#22D3EE]"
              >
                <InstagramLogo size={16} weight="bold" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="grid size-8 place-items-center rounded-md border border-[#F0F2F4]/12 text-[#F0F2F4]/60 transition hover:border-[#22D3EE]/55 hover:text-[#22D3EE]"
              >
                <FacebookLogo size={16} weight="bold" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="grid size-8 place-items-center rounded-md border border-[#F0F2F4]/12 text-[#F0F2F4]/60 transition hover:border-[#22D3EE]/55 hover:text-[#22D3EE]"
              >
                <WhatsappLogo size={16} weight="bold" />
              </a>
            </div>
          </div>
          <span aria-hidden="true" />
          <span className="md:text-left">TwoStack Group</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
