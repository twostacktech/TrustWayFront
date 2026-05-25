import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login, buscar, obterHeaderAutenticado } from '../../services/Service';

type LoginResponse = {
  token?: string;
  accessToken?: string;
  authToken?: string;
  usuario?: string;
  nome?: string;
  cpf?: string;
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Faz o Login normal para pegar Token e CPF
      const data: LoginResponse = await login(
        '/usuarios/logar',
        {
          usuario: email,
          senha: password
        },
        () => { }
      );

      const token = data.token ?? data.accessToken ?? data.authToken;
      const cpfUsuario = data.cpf;

      if (!token) {
        throw new Error('Token nao retornado pela API');
      }

      if (!cpfUsuario) {
        throw new Error('CPF nao retornado pela API de login');
      }

      // 2. Salva o token no localStorage (O GET precisa dele para passar pelo JwtAuthGuard do NestJS)
      localStorage.setItem('token', token);

      // 3. FAZ O GET DO USUÁRIO COMPLETO USANDO O CPF
      // Rota ajustada com base no seu UsuarioController do NestJS ('/usuario/:cpf')
      let usuarioCompleto: any = null;
      try {
        usuarioCompleto = await buscar(
          `/usuario/${cpfUsuario}`,
          () => { },
          obterHeaderAutenticado()
        );
      } catch (getErr) {
        throw new Error('Falha ao buscar dados detalhados do usuário via GET.');
      }

      if (!usuarioCompleto) {
        throw new Error('Não foi possível encontrar os dados deste usuário.');
      }

      // 4. Salva o objeto completo (que agora contém o "tipo") no localStorage
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioCompleto));

      // 5. Descobre o tipo de forma blindada (Maiúsculo e sem espaços)
      const tipoUsuario = String(usuarioCompleto.tipo ?? '').toUpperCase().trim();

      // 6. Redirecionamento correto baseado no tipo real do banco
      if (tipoUsuario === 'ADM' || tipoUsuario === 'ADMINISTRADOR') {
        navigate('/admcliente');
      } else {
        navigate('/minhas-apolices');
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] flex items-center justify-center p-6 text-[#F0F2F4] antialiased font-['Inter']">      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      {/* Lado Esquerdo - Informações */}
      <div className="space-y-6 flex flex-col items-center text-center lg:items-start lg:text-left">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left pt-10 md:pt-16 lg:pt-0 space-y-4 w-full">
          <h1 className="font-['Anton'] text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] uppercase tracking-wide text-[#FAFAFA] leading-[0.85]">            Acesse
          </h1>
          <h1 className="-mt-1 md:mt-0 font-['Anton'] text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] uppercase tracking-wide text-[#FAFAFA] leading-[0.85]">            sua conta
          </h1>

          {/* Definição do Gradiente de Cores */}
          <svg className="!absolute !w-0 !h-0">
            <defs>
              <linearGradient id="login-outline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={1} />
                <stop offset="100%" stopColor="#FF4FD8" stopOpacity={1} />
              </linearGradient>
            </defs>
          </svg>

          {/* 1. TRUSTWAY MOBILE - Forçado para sumir a partir do MD */}
          <svg
            className="about-outline-title mt-1 md:-mt-1 w-full max-w-[240px] !block md:!hidden"
            viewBox="0 0 800 110"
            preserveAspectRatio="xMinYMid meet"
            aria-label="Trustway"
            role="img"
          >
            <text x="50%" y="70" fontFamily="Anton, sans-serif" fontSize="55" textAnchor="middle" fill="transparent" stroke="url(#login-outline-gradient)" strokeWidth="2">
              TRUSTWAY
            </text>
          </svg>

          {/* 2. TRUSTWAY TABLET - Forçado para aparecer SÓ no MD */}
          <svg
            className="about-outline-title mt-4 !hidden md:!block lg:!hidden"
            style={{ width: '450px', maxWidth: '100%' }}
            viewBox="0 0 800 110"
            preserveAspectRatio="xMinYMid meet"
            aria-label="Trustway"
            role="img"
          >
            <text x="50%" y="80" fontFamily="Anton, sans-serif" fontSize="55" textAnchor="middle" fill="transparent" stroke="url(#login-outline-gradient)" strokeWidth="2">
              TRUSTWAY
            </text>
          </svg>

          {/* 3. TRUSTWAY DESKTOP - Forçado para aparecer SÓ no LG */}
          <svg
            className="about-outline-title mt-2 w-full max-w-[450px] !hidden lg:!block lg:self-start"
            viewBox="0 0 800 110"
            preserveAspectRatio="xMinYMid meet"
            aria-label="Trustway"
            role="img"
          >
            <text x="0" y="85" fontFamily="Anton, sans-serif" fontSize="60" textAnchor="start" fill="transparent" stroke="url(#login-outline-gradient)" strokeWidth="2">
              TRUSTWAY
            </text>
          </svg>

          {/* 1. TEXTO DESCRITIVO MOBILE/TABLET */}
          <p className="!block lg:!hidden text-[#FFFFFFFF]/80 text-base sm:text-base md:text-xl max-w-sm md:max-w-lg pt-3">
            Gerencie apólices, veículos e seu perfil. Tudo com a segurança e velocidade que você merece.
          </p>

          {/* 2. TEXTO DESCRITIVO DESKTOP */}
          <p className="!hidden lg:!block text-[#FFFFFFFF]/80 text-lg max-w-md pt-4 pr-8">
            Gerencie apólices, veículos e seu perfil em um só lugar. Tudo com a segurança e velocidade que você merece.
          </p>

        </div>
      </div>

      {/* 
                <div className="space-y-6 flex flex-col items-center text-center lg:items-start lg:text-left">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-4 w-full">

          <h1 className="mt-1 font-['Anton'] text-4xl sm:text-5xl md:text-5xl lg:text-[4.5rem] uppercase tracking-wide text-[#FAFAFA] leading-[0.85]">
            <br></br>
            Acesse
          </h1>
          <h1 className="mt-1 font-['Anton'] text-4xl sm:text-5xl md:text-5xl lg:text-[4.5rem] uppercase tracking-wide text-[#FAFAFA] leading-[0.85]">
            sua conta
          </h1> */}

      {/* <svg
            className="about-outline-title -mt-1 w-full max-w-[240px] sm:max-w-[280px] md:max-w-[180px] lg:max-w-[450px]"
            viewBox="0 0 800 110"
            preserveAspectRatio="xMinYMid meet"
            aria-label="Trustway"
            role="img"
          >
            <defs>
              <linearGradient id="login-outline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="42%" stopColor="#4F46E5" />
                <stop offset="72%" stopColor="#D946EF" />
                <stop offset="100%" stopColor="#FF4FD8" />
              </linearGradient>
            </defs> */}

      {/* 1. TEXTO MOBILE E TABLET VERTICAL: Fica centralizado e menor (fontSize="65")
            <text
              x="50%"
              y="70"
              fontFamily="Anton, sans-serif"
              fontSize="65"
              fontWeight="normal"
              letterSpacing="2"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="transparent"
              stroke="url(#login-outline-gradient)"
              strokeWidth="2"
              className="block lg:hidden"
            >
              TRUSTWAY
              <br></br>
            </text> */}

      {/* 2. TEXTO DESKTOP: Fica oculto no mobile e só aparece no desktop (lg:block)
            <text
              x="0"
              y="70"
              fontFamily="Anton, sans-serif"
              fontSize="60"
              fontWeight="normal"
              letterSpacing="2"
              dominantBaseline="middle"
              textAnchor="start"
              fill="transparent"
              stroke="url(#login-outline-gradient)"
              strokeWidth="2"
              className="hidden lg:block"
            >
              TRUSTWAY
            </text>
          </svg> */}

      {/* 1. TEXTO DESCRITIVO MOBILE: Aparece em telas pequenas e some no desktop (lg:hidden)
          <p className="block lg:hidden text-[#FFFFFFFF]/80 text-sm sm:text-base max-w-sm pt-2">
            Gerencie apólices, veículos e seu perfil em um só lugar. Tudo com a segurança e velocidade que você merece.
          </p> */}

      {/* 2. TEXTO DESCRITIVO DESKTOP: Fica oculto por padrão e aparece a partir do desktop (lg:block)
          <p className="hidden lg:block text-[#FFFFFFFF]/80 text-lg max-w-md pt-4 pr-8">
            Gerencie apólices, veículos e seu perfil em um só lugar. Tudo com a segurança e velocidade que você merece.
          </p> */}

      {/* </div>
      </div> */}

      {/* Lado Direito - Formulário */}
      <div className="w-full max-w-md md:max-w-xl border border-[#22D3EE]/15 bg-[#F0F2F4]/[0.025] backdrop-blur-md p-8 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.05)] relative overflow-hidden mx-auto lg:mx-0">

        {/* Detalhe de iluminação sutil de fundo*/}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#22D3EE]/40 to-transparent" />

        {/* Título */}
        <h2 className="text-3xl font-[var(--font-display)] font-normal text-center mb-8 tracking-[0.05em] uppercase text-[#F0F2F4]">
          <span className="animated-gradient-text block mt-1 font-bold">ENTRAR</span>
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-xs font-bold tracking-wide text-center uppercase">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>

          {/* Campo de Email */}
          <div className="flex flex-col space-y-2">
            <label className="text-[0.9rem] font-black tracking-[0.15rem] text-[#22D3EE] uppercase">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="voce@email.com"
              className="w-full h-[3.4rem] bg-[#F0F2F4]/[0.035] border border-[#22D3EE]/25 rounded-lg px-4 text-[#F0F2F4] placeholder-[#F0F2F4]/30 text-[0.95rem] focus:outline-none focus:border-[#22D3EE]/60 focus:bg-[#F0F2F4]/[0.055] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-200"
            />
          </div>

          {/* Campo de Senha */}
          <div className="flex flex-col space-y-2">
            <label className="text-[0.9rem] font-black tracking-[0.15rem] text-[#22D3EE] uppercase">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full h-[3.4rem] bg-[#F0F2F4]/[0.035] border border-[#22D3EE]/25 rounded-lg px-4 text-[#F0F2F4] placeholder-[#F0F2F4]/30 text-[0.95rem] focus:outline-none focus:border-[#22D3EE]/60 focus:bg-[#F0F2F4]/[0.055] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-200"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[3.6rem] mt-6 flex items-center justify-center rounded-lg border border-[#22D3EE]/25 bg-[#F0F2F4]/[0.035] px-5 text-center text-[0.95rem] font-black shadow-[0_0_20px_rgba(34,211,238,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-[#22D3EE]/45 hover:bg-[#F0F2F4]/[0.055] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-[#22D3EE]" />
            ) : (
              <span className="animated-gradient-text uppercase tracking-[0.12rem] flex items-center gap-2 font-bold text-lg">
                Acessar Painel <ArrowRight size={16} className="text-[#D946EF]" />
              </span>
            )}
          </button>
        </form>

        {/* Footer do formulário */}
        <div className="mt-8 text-center space-y-4 pt-4 border-t border-[#F0F2F4]/10">
          <p className="text-[1rem] font-medium text-[#F0F2F4]/60">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-[#22D3EE] hover:text-[#D946EF] font-bold underline underline-offset-4 transition-colors">
              Crie uma agora.
            </Link>
          </p>
          <Link
            to="/"
            className="group flex items-center justify-center gap-2 text-[0.74rem] font-black tracking-[0.1em] text-[#F0F2F4]/35 hover:text-[#F0F2F4]/70 transition-colors uppercase block py-4"
          >
            <ArrowLeft
              size={14}
              className="text-[#22D3EE]/60 transition-transform duration-200 group-hover:-translate-x-1"
            />
            Voltar para a Home
          </Link>
        </div>
      </div>

    </div>
    </div>
  );
}


// import { ArrowRight, Loader2 } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useState } from 'react';
// import { login, buscar, obterHeaderAutenticado } from '../../services/Service';

// type LoginResponse = {
//   token?: string;
//   accessToken?: string;
//   authToken?: string;
//   usuario?: string; // Aqui vem o e-mail do usuário (v@gmail.com)
//   nome?: string;
//   cpf?: string;
// };

// export default function Login() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       // 1. Faz o Login normal para pegar Token e CPF
//       const data: LoginResponse = await login(
//         '/usuarios/logar',
//         {
//           usuario: email,
//           senha: password
//         },
//         () => { }
//       );

//       const token = data.token ?? data.accessToken ?? data.authToken;
//       const cpfUsuario = data.cpf;

//       if (!token) {
//         throw new Error('Token nao retornado pela API');
//       }

//       if (!cpfUsuario) {
//         throw new Error('CPF nao retornado pela API de login');
//       }

//       // 2. Salva o token no localStorage (O GET precisa dele para passar pelo JwtAuthGuard do NestJS)
//       localStorage.setItem('token', token);

//       // 3. FAZ O GET DO USUÁRIO COMPLETO USANDO O CPF
//       // Rota ajustada com base no seu UsuarioController do NestJS ('/usuario/:cpf')
//       let usuarioCompleto: any = null;
//       try {
//         usuarioCompleto = await buscar(
//           `/usuario/${cpfUsuario}`,
//           () => { },
//           obterHeaderAutenticado()
//         );
//       } catch (getErr) {
//         throw new Error('Falha ao buscar dados detalhados do usuário via GET.');
//       }

//       if (!usuarioCompleto) {
//         throw new Error('Não foi possível encontrar os dados deste usuário.');
//       }

//       // 4. Salva o objeto completo (que agora contém o "tipo") no localStorage
//       localStorage.setItem('usuarioLogado', JSON.stringify(usuarioCompleto));

//       // 5. Descobre o tipo de forma blindada (Maiúsculo e sem espaços)
//       const tipoUsuario = String(usuarioCompleto.tipo ?? '').toUpperCase().trim();

//       // 6. Redirecionamento correto baseado no tipo real do banco
//       if (tipoUsuario === 'ADM' || tipoUsuario === 'ADMINISTRADOR') {
//         navigate('/admcliente');
//       } else {
//         navigate('/minhas-apolices');
//       }

//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'Erro ao fazer login');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] flex items-center justify-center p-6 text-[#F0F2F4] antialiased font-['Inter']">      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

//       {/* Lado Esquerdo - Informações */}
//       <div className="space-y-8">
//         {/* <div className="flex items-center gap-2">
//             <span className="font-bold text-xl tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#1C1A74] to-[#9D4EDD]">TrustWay</span>
//           </div> */}

//         <div className="space-y-4">
//           {/* <p className="text-[#9D4EDD] font-semibold tracking-widest text-sm uppercase">Acesso ao Painel</p> */}
//           {/* <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tight"> */}
//           <h1 className="mt-1 font-['Anton'] text-[5.25rem] uppercase tracking-wide text-[#FAFAFA] leading-[0.85]">
//             Acesse
//           </h1>
//                     <h1 className="mt-1 font-['Anton'] text-[5.25rem] uppercase tracking-wide text-[#FAFAFA] leading-[0.85]">
//             sua conta
//           </h1>

//           <svg
//             className="about-outline-title -mt-2 w-full max-w-[450px]"
//             viewBox="0 0 550 110"
//             preserveAspectRatio="xMinYMid meet"
//             aria-label="Trustway"
//             role="img"
//           >
//             <defs>
//               <linearGradient id="login-outline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                 <stop offset="0%" stopColor="#22D3EE" />
//                 <stop offset="42%" stopColor="#4F46E5" />
//                 <stop offset="72%" stopColor="#D946EF" />
//                 <stop offset="100%" stopColor="#FF4FD8" />
//               </linearGradient>
//             </defs>

//             <text
//               x="0"
//               y="65"
//               fontFamily="Anton, sans-serif"
//               fontSize="90"
//               fontWeight="normal"
//               letterSpacing="2"
//               dominantBaseline="middle"
//               fill="transparent"
//               stroke="url(#login-outline-gradient)"
//               strokeWidth="2"
//             >
//               TRUSTWAY
//             </text>
//           </svg>

//           {/* <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1C1A74] to-[#9D4EDD]"> Trustway</span><br /> */}
//           <p className="text-[#FFFFFFFF]/80  text-lg max-w-md py-6 pr-8 ">
//             Gerencie apólices, veículos e seu perfil em um só lugar. Tudo com a segurança e velocidade que você merece.
//           </p>
//         </div>
//       </div>

//       {/* Lado Direito - Formulário */}
//       <div className="bg-[#1F1B2E] border border-[#9D4EDD]/15 p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
//         <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest">Entrar</h2>

//         {error && (
//           <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
//             {error}
//           </div>
//         )}

//         <form className="space-y-5" onSubmit={handleLogin}>
//           <div className="space-y-2">
//             <label className="text-sm font-semibold text-[#F0F2F4]/90">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               placeholder="voce@email.com"
//               className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="text-sm font-semibold text-[#F0F2F4]/90">Senha</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               placeholder="••••••••"
//               className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-[#1C1A74] hover:bg-gradient-to-r hover:from-[#1C1A74] hover:to-[#9D4EDD] shadow-[0_-4px_12px_rgba(28,26,116,0.4)] hover:shadow-[0_0_20px_rgba(157,78,221,0.8)] disabled:opacity-50 disabled:cursor-not-allowed text-[#F0F2F4] font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 mt-4 uppercase tracking-wider text-sm"
//           >
//             {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
//             {isLoading ? 'Entrando...' : 'Entrar'}
//           </button>
//         </form>

//         <div className="mt-8 text-center space-y-4">
//           <p className="text-sm text-[#F0F2F4]/70">
//             Não tem conta? <Link to="/cadastro" className="text-[#9D4EDD] hover:text-[#1C1A74] underline underline-offset-4">Crie uma agora.</Link>
//           </p>
//           <Link to="/" className="text-sm text-[#F0F2F4]/50 hover:text-[#F0F2F4] transition-colors block">
//             ← Voltar ao site
//           </Link>
//         </div>
//       </div>

//     </div>
//     </div>
//   );
// }
