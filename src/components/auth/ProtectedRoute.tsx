
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Log de verificação de proteção inicial
  console.log('ProtectedRoute: Verificando rota', {
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

    // Verifica o caminho atual para determinar ação
    const isAuthPage = location.pathname.startsWith('/auth');
    const isChangePasswordPage = location.pathname === '/auth/change-password';
    const isLoginPage = location.pathname === '/auth';
    
    console.log('ProtectedRoute: Verificando redirecionamento', {
      isAuthPage,
      isChangePasswordPage,
      isLoginPage,
      hasSession: !!session
    });
    
    // Lógica de redirecionamento
    
    // Caso 1: Página de login com sessão - redireciona para dashboard
    if (session && isLoginPage) {
      console.log('ProtectedRoute: Usuário já autenticado tentando acessar login, redirecionando');
      navigate("/dashboard", { replace: true });
      return;
    }
    
    // Caso 2: Rota protegida sem sessão - redireciona para login
    if (!session && !isAuthPage) {
      console.log('ProtectedRoute: Acesso negado a rota protegida, redirecionando para login');
      navigate("/auth", { replace: true });
      return;
    }
    
    // Caso 3: Página de troca de senha sem sessão - redireciona para login
    if (!session && isChangePasswordPage) {
      console.log('ProtectedRoute: Tentativa de acessar troca de senha sem sessão, redirecionando para login');
      navigate("/auth", { replace: true });
      return;
    }

  }, [session, isLoading, navigate, location.pathname]);

  // Se está carregando, mostra loader
  if (isLoading) {
    console.log('ProtectedRoute: Exibindo loader durante verificação');
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <span>Verificando autenticação...</span>
      </div>
    );
  }

  // Caso 1: Página protegida sem sessão - mostra loader durante redirecionamento
  if (!session && !location.pathname.startsWith('/auth')) {
    console.log('ProtectedRoute: Renderizando loader durante redirecionamento para login');
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <span>Redirecionando para login...</span>
      </div>
    );
  }
  
  // Caso 2: Página de login com sessão - mostra loader durante redirecionamento
  if (session && location.pathname === '/auth') {
    console.log('ProtectedRoute: Renderizando loader durante redirecionamento para dashboard');
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <span>Redirecionando para dashboard...</span>
      </div>
    );
  }

  // Renderiza o conteúdo protegido
  console.log('ProtectedRoute: Renderizando conteúdo', {
    path: location.pathname,
    hasSession: !!session
  });
  return <>{children}</>;
}
