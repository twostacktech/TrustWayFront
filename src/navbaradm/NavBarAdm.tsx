import { ArrowLeft, ChartBar, FileText, ShieldCheck, Users } from '@phosphor-icons/react'

function NavBarAdm() {
  return (
    <header className="border-b border-white/10">
      <div className="flex min-h-[124px] flex-col justify-between">
        <div className="flex items-center justify-between px-4 py-5 sm:px-8 lg:px-14">
          <div className="flex items-center gap-6">
            <a
              href="/home"//colocar link para o home do site
              className="flex items-center gap-2 border-r border-white/10 pr-6 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft size={17} weight="bold" />
              Voltar ao site
            </a>

            <div>
              <strong className="block font-display text-2xl leading-5 tracking-tight text-white">
                TRUSTWAY
              </strong>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.42em] text-zinc-500">
                Painel Administrativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase">
            <ShieldCheck size={16} weight="bold" className="text-rose-500" />
            Admin
          </div>
        </div>

        <nav className="flex gap-8 overflow-x-auto px-4 sm:px-8 lg:px-14">
          <a
            href="/clientes"//colocar link para clientes
            className="flex items-center gap-2 border-b-2 border-rose-500 pb-4 text-sm font-bold text-white"
          >
            <Users size={18} weight="bold" />
            Clientes
          </a>
          <a
            href="/apolices"//colocar link para apolices
            className="flex items-center gap-2 pb-4 text-sm font-bold text-zinc-500 transition hover:text-white"
          >
            <FileText size={18} weight="bold" />
            Apolices
          </a>
          <a
            href="/relatorios"//colocar link para relatorios
            className="flex items-center gap-2 pb-4 text-sm font-bold text-zinc-500 transition hover:text-white"
          >
            <ChartBar size={18} weight="bold" />
            Relatorios
          </a>
        </nav>
      </div>
    </header>
  )
}

export default NavBarAdm



