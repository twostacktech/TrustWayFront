import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login, buscar, obterHeaderAutenticado } from '../../services/Service';

type LoginResponse = {
  token?: string;
  accessToken?: string;
  authToken?: string;
  usuario?: string; // Aqui vem o e-mail do usuário (v@gmail.com)
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
          () => {}, 
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
    <div className="min-h-screen bg-[#16151E] flex items-center justify-center p-6 text-[#F0F2F4]">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Lado Esquerdo - Informações */}
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#1C1A74] to-[#9D4EDD]">TrustWay</span>
          </div>

          <div className="space-y-4">
            <p className="text-[#9D4EDD] font-semibold tracking-widest text-sm uppercase">Acesso ao Painel</p>
            <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tight">
              Acesse sua conta <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1C1A74] to-[#9D4EDD]">Trustway</span><br />
            </h1>
            <p className="text-[#F0F2F4]/70 text-lg max-w-md">
              Gerencie apólices, veículos e seu perfil em um só lugar. Tudo com a segurança e velocidade que você merece.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="bg-[#1F1B2E] border border-[#9D4EDD]/15 p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest">Entrar</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#F0F2F4]/90">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@email.com"
                className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#F0F2F4]/90">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#16151E] border border-[#9D4EDD]/15 rounded-lg px-4 py-3 text-[#F0F2F4] focus:outline-none focus:border-[#1C1A74] focus:ring-1 focus:ring-[#1C1A74] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1C1A74] hover:bg-gradient-to-r hover:from-[#1C1A74] hover:to-[#9D4EDD] shadow-[0_-4px_12px_rgba(28,26,116,0.4)] hover:shadow-[0_0_20px_rgba(157,78,221,0.8)] disabled:opacity-50 disabled:cursor-not-allowed text-[#F0F2F4] font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 mt-4 uppercase tracking-wider text-sm"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-[#F0F2F4]/70">
              Não tem conta? <Link to="/cadastro" className="text-[#9D4EDD] hover:text-[#1C1A74] underline underline-offset-4">Crie uma agora.</Link>
            </p>
            <Link to="/" className="text-sm text-[#F0F2F4]/50 hover:text-[#F0F2F4] transition-colors block">
              ← Voltar ao site
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
