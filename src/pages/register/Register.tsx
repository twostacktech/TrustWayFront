import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cadastrarUsuario } from '../../services/Service';

export default function Register() {

  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [tipo] = useState('CLIENTE');
  const [dataNascimento, setDataNascimento] = useState('');
  const [numeroTelefone, setNumeroTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setIsLoading(true);

      await cadastrarUsuario(
        '/usuario',
        {
          cpf,
          nome,
          tipo,
          dataNascimento,
          email,
          senha,
          numeroTelefone
        },
        () => {}
      );

      navigate('/login');

    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao cadastrar usuário'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#16151E] flex items-center justify-center p-6 text-[#F0F2F4]">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Lado Esquerdo */}
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#1C1A74] to-[#9D4EDD]">
              TrustWay
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-[#9D4EDD] font-semibold tracking-widest text-sm uppercase">
              Novo Usuário
            </p>

            <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tight">
              Junte-se à{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1C1A74] to-[#9D4EDD]">
                TrustWay
              </span>
            </h1>

            <p className="text-[#F0F2F4]/70 text-lg max-w-md">
              Crie sua conta em menos de 2 minutos e tenha acesso à plataforma
              de engenharia de seguros mais robusta do mercado.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="bg-[#1F1B2E] border border-[#9D4EDD]/15 p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

          <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest">
            Cadastro
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>

            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#F0F2F4]/90">
                Nome Completo
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="João Silva"
                className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#F0F2F4]/90">
                CPF
              </label>

              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
                placeholder="12345678900"
                className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
              />
            </div>

            {/* Data nascimento */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#F0F2F4]/90">
                Data de Nascimento
              </label>

              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
                className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#F0F2F4]/90">
                Telefone
              </label>

              <input
                type="text"
                value={numeroTelefone}
                onChange={(e) => setNumeroTelefone(e.target.value)}
                required
                placeholder="11999999999"
                className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#F0F2F4]/90">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="sua@empresa.com"
                className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
              />
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#F0F2F4]/90">
                  Senha
                </label>

                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#F0F2F4]/90">
                  Confirmar Senha
                </label>

                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
                />
              </div>

            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1C1A74] hover:bg-gradient-to-r hover:from-[#1C1A74] hover:to-[#9D4EDD] shadow-[0_-4px_12px_rgba(28,26,116,0.4)] hover:shadow-[0_0_20px_rgba(157,78,221,0.8)] disabled:opacity-50 disabled:cursor-not-allowed text-[#F0F2F4] font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 mt-4 uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}

              {isLoading ? 'Cadastrando...' : 'Criar Conta'}
            </button>

          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-[#F0F2F4]/70">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="text-[#9D4EDD] hover:text-[#1C1A74] underline underline-offset-4"
              >
                Faça login.
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
// import { ArrowRight } from 'lucide-react';
// import { Link } from 'react-router-dom';

// export default function Register() {
//   return (
//     <div className="min-h-screen bg-[#16151E] flex items-center justify-center p-6 text-[#F0F2F4]">
//       <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
//         {/* Lado Esquerdo */}
//         <div className="space-y-8">
//           <div className="flex items-center gap-2">
//             <span className="font-bold text-xl tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#1C1A74] to-[#9D4EDD]">TrustWay</span>
//           </div>
          
//           <div className="space-y-4">
//             <p className="text-[#9D4EDD] font-semibold tracking-widest text-sm uppercase">Novo Usuário</p>
//             <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tight">
//               Junte-se à <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1C1A74] to-[#9D4EDD]">TrustWay</span>
//             </h1>
//             <p className="text-[#F0F2F4]/70 text-lg max-w-md">
//               Crie sua conta em menos de 2 minutos e tenha acesso à plataforma de engenharia de seguros mais robusta do mercado.
//             </p>
//           </div>
//         </div>

//         {/* Lado Direito - Formulário */}
//         <div className="bg-[#1F1B2E] border border-[#9D4EDD]/15 p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
//           <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest">Cadastro</h2>
          
//           <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
//             <div className="space-y-2">
//               <label className="text-sm font-semibold text-[#F0F2F4]/90">Nome Completo</label>
//               <input 
//                 type="text" 
//                 placeholder="João Silva" 
//                 className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-semibold text-[#F0F2F4]/90">Email</label>
//               <input 
//                 type="email" 
//                 placeholder="sua@empresa.com" 
//                 className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
//               />
//             </div>
            
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-[#F0F2F4]/90">Senha</label>
//                 <input 
//                   type="password" 
//                   placeholder="••••••••" 
//                   className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-[#F0F2F4]/90">Confirmar Senha</label>
//                 <input 
//                   type="password" 
//                   placeholder="••••••••" 
//                   className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
//                 />
//               </div>
//             </div>

//              <button className="w-full bg-[#1C1A74] hover:bg-gradient-to-r hover:from-[#1C1A74] hover:to-[#9D4EDD] shadow-[0_-4px_12px_rgba(28,26,116,0.4)] hover:shadow-[0_0_20px_rgba(157,78,221,0.8)] text-[#F0F2F4] font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 mt-4 uppercase tracking-wider text-sm">
//               <ArrowRight size={18} />
//               Criar Conta
//             </button>
//           </form>

//           <div className="mt-8 text-center space-y-4">
//             <p className="text-sm text-[#F0F2F4]/70">
//               Já possui uma conta? <Link to="/login" className="text-[#9D4EDD] hover:text-[#1C1A74] underline underline-offset-4">Faça login.</Link>
//             </p>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
