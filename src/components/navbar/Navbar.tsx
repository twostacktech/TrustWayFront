import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  Car,
  Lightning,
  List,
  Question,
  Shield,
  User,
  Users,
} from "@phosphor-icons/react";

const sideLinks = [
  { id: "showcase", icon: Car, eyebrow: "01", label: "Trust Way" },
  { id: "sobre", icon: Shield, eyebrow: "02", label: "Sobre nós" },
  { id: "beneficios", icon: Lightning, eyebrow: "03", label: "Benefícios" },
  { id: "simulador", icon: Calculator, eyebrow: "04", label: "Simulador" },
  { id: "duvidas", icon: Question, eyebrow: "05", label: "Dúvidas" },
  { id: "equipe", icon: Users, eyebrow: "06", label: "Equipe" },
];

function Navbar() {
  const [activeSection, setActiveSection] = useState(sideLinks[0].id);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateRail = () => {
      const currentSection = sideLinks
        .map((link) => document.getElementById(link.id))
        .filter((section): section is HTMLElement => Boolean(section))
        .findLast((section) => {
          const sectionTop = section.getBoundingClientRect().top;
          return sectionTop <= window.innerHeight * 0.38;
        });

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

      setActiveSection(currentSection?.id ?? sideLinks[0].id);
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };

    updateRail();
    window.addEventListener("scroll", updateRail, { passive: true });
    window.addEventListener("resize", updateRail);

    return () => {
      window.removeEventListener("scroll", updateRail);
      window.removeEventListener("resize", updateRail);
    };
  }, []);

  return (
    <>
      <nav className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#F0F2F4]/5 bg-black/85 px-8 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <button
            type="button"
            aria-label="Abrir menu"
            className="grid size-10 place-items-center border border-[#F0F2F4]/10 text-[#F0F2F4] transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]"
          >
            <List size={23} weight="bold" />
          </button>

          <p className="hidden pl-14 text-[11px] tracking-[4px] text-[#F0F2F4]/35 lg:block">
            2026 / TRUSTWAY
          </p>
        </div>

        <Link
          to="/home"
          className="absolute left-1/2 -translate-x-1/2 font-[var(--font-display)] text-3xl leading-none tracking-[10px] text-[#F0F2F4]"
        >
          TRUSTWAY
        </Link>

        <div className="hidden gap-3 md:flex">
          <Link
            to="/login"
            className="sliding-button inline-flex min-h-9 items-center gap-2 border border-[#F0F2F4]/15 px-5 text-[0.68rem] font-black tracking-[0.08rem] text-[#F0F2F4]"
          >
            <span>
              <User size={15} weight="bold" />
              LOGIN
            </span>
          </Link>
        </div>
      </nav>

      <aside className="neon-sidebar group fixed left-5 top-1/2 z-50 flex h-[min(620px,calc(100vh-7rem))] w-[78px] -translate-y-1/2 flex-col overflow-visible rounded-[8px] p-3 text-[#F0F2F4] transition-[width] duration-300 hover:w-[260px] max-[1100px]:hidden">
        <div className="neon-sidebar-glow" aria-hidden="true" />

	        <div className="neon-sidebar-progress" aria-hidden="true">
	          <span style={{ height: `${scrollProgress * 100}%` }} />
	        </div>

        <div className="flex flex-1 flex-col justify-center gap-4">
          {sideLinks.map((link) => {
            const isActive = activeSection === link.id;
            const Icon = link.icon;

            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`neon-sidebar-link ${isActive ? "active" : ""}`}
                aria-label={link.label}
              >
                <span className="neon-sidebar-icon" aria-hidden="true">
                  <Icon size={23} weight="bold" />
                </span>
                <span className="neon-sidebar-label">
                  <small>{link.eyebrow}</small>
                  <strong>{link.label}</strong>
                </span>
              </a>
            );
          })}
        </div>
      </aside>
    </>
  );
}

export default Navbar;
