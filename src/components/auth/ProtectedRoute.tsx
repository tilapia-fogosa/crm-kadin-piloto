
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Log de verificação de proteção inicial
  console.log('ProtectedRoute: Iniciando verificação', {
    path: location.pathname,
    hasSession: !!session,
    isLoading
  });

  // Efeito para redirecionamento
  useEffect(() => {
    // Se ainda estiver carregando, aguarda finalização
    if (isLoading) {
      console.log('ProtectedRoute: Auth ainda carregando, aguardando...');
      return;
    }

    console.log('ProtectedRoute: Verificando acesso para', {
      path: location.pathname,
      hasSession: !!session
    });

    const isChangePasswordPage = location.pathname === '/auth/change-password';
    const isLoginPage = location.pathname === '/auth';
    
    // Se NÃO tem sessão e NÃO está em rota pública de auth
    if (!session && !location.pathname.startsWith('/auth')) {
      console.log('ProtectedRoute: Acesso não autorizado, redirecionando para login');
      navigate("/auth", { replace: true });
      return;
    }
    
    // Se tem sessão e está tentando acessar login
    if (session && isLoginPage) {
      console.log('ProtectedRoute: Usuário já autenticado em página de login, redirecionando para dashboard');
      navigate("/dashboard", { replace: true });
      return;
    }

  }, [session, isLoading, navigate, location.pathname]);

  // Se ainda está carregando, mostra o loader
  if (isLoading) {
    console.log('ProtectedRoute: Exibindo loader durante verificação');
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <span>Verificando autenticação...</span>
      </div>
    );
  }

  // Se não tiver sessão e não estiver em rota pública, exibe loader durante redirecionamento
  if (!session && !location.pathname.startsWith('/auth')) {
    console.log('ProtectedRoute: Acesso negado, exibindo loader durante redirecionamento');
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <span>Redirecionando para login...</span>
      </div>
    );
  }

  // Renderiza o conteúdo protegido
  console.log('ProtectedRoute: Renderizando conteúdo protegido');
  return <>{children}</>;
}
