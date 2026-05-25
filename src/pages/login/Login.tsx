import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login, buscar, obterHeaderAutenticado } from "../../services/Service";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data: LoginResponse = await login(
        "/usuarios/logar",
        { usuario: email, senha: password },
        () => {},
      );

      const token = data.token ?? data.accessToken ?? data.authToken;
      const cpfUsuario = data.cpf;

      if (!token) throw new Error("Token nao retornado pela API");
      if (!cpfUsuario) throw new Error("CPF nao retornado pela API de login");

      localStorage.setItem("token", token);

      let usuarioCompleto: any = null;
      try {
        usuarioCompleto = await buscar(
          `/usuario/${cpfUsuario}`,
          () => {},
          obterHeaderAutenticado(),
        );
      } catch (getErr) {
        throw new Error("Falha ao buscar dados detalhados do usuário via GET.");
      }

      if (!usuarioCompleto)
        throw new Error("Não foi possível encontrar os dados deste usuário.");

      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioCompleto));

      const tipoUsuario = String(usuarioCompleto.tipo ?? "")
        .toUpperCase()
        .trim();

      if (tipoUsuario === "ADM" || tipoUsuario === "ADMINISTRADOR") {
        navigate("/admcliente");
      } else {
        navigate("/minhas-apolices");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0a1a] to-[#0a0a0a] flex items-center justify-center p-6 text-[#F0F2F4] antialiased font-['Inter']">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Lado Esquerdo - Informações */}
        <div className="space-y-6 flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-1 w-full">
            <h1 className="font-['Anton'] text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] uppercase tracking-wide text-[#FAFAFA] leading-tight lg:leading-[0.85]">
              Acesse
            </h1>
            <h1 className="font-['Anton'] text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] uppercase tracking-wide text-[#FAFAFA] leading-tight lg:leading-[0.85]">
              sua conta
            </h1>

            {/* VERSÃO MOBILE*/}
            <svg
              className="block lg:hidden w-full max-w-[320px] sm:max-w-[420px] mx-auto -mt-1 sm:-mt-2"
              viewBox="0 0 400 90"
              preserveAspectRatio="xMinYMid meet"
              aria-label="Trustway"
              role="img"
            >
              <defs>
                <linearGradient
                  id="login-outline-gradient-mobile"
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
                x="65"
                y="45"
                fontFamily="Anton, sans-serif"
                fontSize="60"
                fontWeight="normal"
                letterSpacing="5"
                dominantBaseline="middle"
                textAnchor="start"
                fill="transparent"
                stroke="url(#login-outline-gradient-mobile)"
                strokeWidth="2.5"
              >
                TRUSTWAY
              </text>
            </svg>

            {/* VERSÃO DESKTOP*/}
            <svg
              className="hidden lg:block w-full max-w-[500px] lg:max-w-[550px] lg:-ml-1"
              viewBox="0 0 550 110"
              preserveAspectRatio="xMinYMid meet"
              aria-label="Trustway"
              role="img"
            >
              <defs>
                <linearGradient
                  id="login-outline-gradient-desktop"
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
                x="0"
                y="65"
                fontFamily="Anton, sans-serif"
                fontSize="95"
                fontWeight="normal"
                letterSpacing="3"
                dominantBaseline="middle"
                textAnchor="start"
                fill="transparent"
                stroke="url(#login-outline-gradient-desktop)"
                strokeWidth="2.5"
              >
                TRUSTWAY
              </text>
            </svg>
            <p className="text-[#FFFFFFFF]/80 text-sm sm:text-base lg:text-lg max-w-md pt-4 lg:pr-8">
              Gerencie apólices, veículos e seu perfil em um só lugar. Tudo com
              a segurança e velocidade que você merece.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full max-w-md border border-[#22D3EE]/15 bg-[#F0F2F4]/[0.025] backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.05)] relative overflow-hidden mx-auto lg:mx-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#22D3EE]/40 to-transparent" />

          <h2 className="text-2xl sm:text-3xl font-[var(--font-display)] font-normal text-center mb-6 sm:mb-8 tracking-[0.05em] uppercase text-[#F0F2F4]">
            <span className="animated-gradient-text block mt-1 font-bold">
              ENTRAR
            </span>
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-xs font-bold tracking-wide text-center uppercase">
              {error}
            </div>
          )}

          <form className="space-y-5 sm:space-y-6" onSubmit={handleLogin}>
            <div className="flex flex-col space-y-2">
              <label className="text-[0.8rem] sm:text-[0.9rem] font-black tracking-[0.15rem] text-[#22D3EE] uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@email.com"
                className="w-full h-[3.2rem] sm:h-[3.4rem] bg-[#F0F2F4]/[0.035] border border-[#22D3EE]/25 rounded-lg px-4 text-[#F0F2F4] placeholder-[#F0F2F4]/30 text-[0.95rem] focus:outline-none focus:border-[#22D3EE]/60 focus:bg-[#F0F2F4]/[0.055] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-200"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[0.8rem] sm:text-[0.9rem] font-black tracking-[0.15rem] text-[#22D3EE] uppercase">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-[3.2rem] sm:h-[3.4rem] bg-[#F0F2F4]/[0.035] border border-[#22D3EE]/25 rounded-lg px-4 text-[#F0F2F4] placeholder-[#F0F2F4]/30 text-[0.95rem] focus:outline-none focus:border-[#22D3EE]/60 focus:bg-[#F0F2F4]/[0.055] focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[3.4rem] sm:min-h-[3.6rem] mt-6 flex items-center justify-center rounded-lg border border-[#22D3EE]/25 bg-[#F0F2F4]/[0.035] px-5 text-center text-[0.95rem] font-black shadow-[0_0_20px_rgba(34,211,238,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-[#22D3EE]/45 hover:bg-[#F0F2F4]/[0.055] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-[#22D3EE]" />
              ) : (
                <span className="animated-gradient-text uppercase tracking-[0.12rem] flex items-center gap-2 font-bold text-base sm:text-lg">
                  Acessar Painel{" "}
                  <ArrowRight size={16} className="text-[#D946EF]" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4 pt-4 border-t border-[#F0F2F4]/10">
            <p className="text-sm sm:text-[1rem] font-medium text-[#F0F2F4]/60">
              Não tem conta?{" "}
              <Link
                to="/cadastro"
                className="text-[#22D3EE] hover:text-[#D946EF] font-bold underline underline-offset-4 transition-colors"
              >
                Crie uma agora.
              </Link>
            </p>
            <Link
              to="/"
              className="group flex items-center justify-center gap-2 text-[0.7rem] sm:text-[0.74rem] font-black tracking-[0.1em] text-[#F0F2F4]/35 hover:text-[#F0F2F4]/70 transition-colors uppercase block py-2"
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
