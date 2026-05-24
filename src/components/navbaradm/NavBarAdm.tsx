import { ArrowLeft, ChartBar, FileText, Users } from '@phosphor-icons/react'
import { Link, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

const links = [
  {
    href: '/admcliente',
    label: 'Clientes',
    icon: Users,
  },
  {
    href: '/apolices',
    label: 'Apólices',
    icon: FileText,
  },
  {
    href: '/relatorios',
    label: 'Relatórios',
    icon: ChartBar,
  },
]

function NavBarAdm() {

  const navigate = useNavigate();

  const { pathname } = useLocation()

  return (
    <header className="border-b border-white/10 bg-[#16151E]">
      <div className="flex min-h-[124px] flex-col justify-between">
        <div className="flex items-center justify-between px-4 py-5 sm:px-8 lg:px-14">
          <div className="flex items-center gap-6">
            <Link
              to="/home"
              className="flex items-center gap-2 border-r border-white/10 pr-6 text-sm text-[#A1A1AA] transition hover:text-[#FAFAFA]"
            >
              <ArrowLeft size={17} weight="bold" />
              Voltar ao site
            </Link>

            <div>
              <strong className="block font-display text-2xl leading-5 tracking-tight text-[#FAFAFA]">
                TRUSTWAY
              </strong>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.42em] text-[#A1A1AA]">
                Painel Administrativo
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/gestao-colaborador')}
            className="flex items-center gap-2 rounded-full border border-[#22D3EE] bg-[#22D3EE]/5 px-4 py-2 text-sm font-bold uppercase text-[#22D3EE] transition-all duration-300 hover:scale-105"
          >
            Gestão do Colaborador
          </button>

          </div>

          <nav className="flex gap-8 overflow-x-auto px-4 sm:px-8 lg:px-14">
            {links.map(({ href, label, icon: Icon }) => {
              const ativo = pathname === href

              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-bold transition hover:text-[#FAFAFA] ${ativo
                    ? 'border-[#9D4EDD] text-[#FAFAFA]'
                    : 'border-transparent text-[#A1A1AA]'
                    }`}
                >
                  <Icon size={18} weight="bold" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
    </header>
  )
}

export default NavBarAdm



