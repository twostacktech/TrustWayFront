import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { List, ShieldCheck, User } from "@phosphor-icons/react";

const sideLinks = [
  { id: "showcase", label: "01 - SHOWCASE" },
  { id: "sobre", label: "02 - SOBRE NÓS" },
  { id: "beneficios", label: "03 - BENEFÍCIOS" },
  { id: "equipe", label: "04 - EQUIPE" },
];

function Navbar() {
  const [activeSection, setActiveSection] = useState(sideLinks[0].id);

  useEffect(() => {
    const updateActiveSection = () => {
      const currentSection = sideLinks
        .map((link) => document.getElementById(link.id))
        .filter((section): section is HTMLElement => Boolean(section))
        .findLast((section) => {
          const sectionTop = section.getBoundingClientRect().top;
          return sectionTop <= window.innerHeight * 0.38;
        });

      setActiveSection(currentSection?.id ?? sideLinks[0].id);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  return (
    <>
      <nav className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/85 px-8 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <button
            type="button"
            aria-label="Abrir menu"
            className="grid size-10 place-items-center border border-white/10 text-white transition-colors hover:border-[#ff1744] hover:text-[#ff1744]"
          >
            <List size={23} weight="bold" />
          </button>

          <p className="hidden text-[11px] tracking-[4px] text-[#666] sm:block">
            EST. 2024 / TRUSTWAY
          </p>
        </div>

        <Link
          to="/home"
          className="absolute left-1/2 -translate-x-1/2 font-[var(--font-display)] text-3xl leading-none tracking-[10px] text-white"
        >
          TRUSTWAY
        </Link>

        <div className="hidden gap-3 md:flex">
          <Link to="/login" className="inline-flex min-h-9 items-center gap-2 border border-[#333] px-5 text-[0.68rem] font-black tracking-[0.08rem] text-white transition duration-200 hover:-translate-y-px hover:border-[#ff1744]">
            <User size={15} weight="bold" />
            LOGIN USUÁRIO
          </Link>

          <Link to="/admcliente" className="inline-flex min-h-9 items-center gap-2 bg-[#ff1744] px-5 text-[0.68rem] font-black tracking-[0.08rem] text-white transition duration-200 hover:-translate-y-px">
            <ShieldCheck size={15} weight="bold" />
            PAINEL ADMIN
          </Link>
        </div>
      </nav>

      <aside className="side-rail fixed left-6 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-5 max-[1100px]:hidden">
        {sideLinks.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={`text-[0.67rem] font-extrabold tracking-[0.18rem] transition duration-200 hover:translate-x-1 hover:text-[#ff1744] ${
              activeSection === link.id
                ? "active translate-x-1 text-[#ff1744]"
                : "text-[#666]"
            }`}
          >
            {link.label}
          </a>
        ))}
      </aside>
    </>
  );
}

export default Navbar;
