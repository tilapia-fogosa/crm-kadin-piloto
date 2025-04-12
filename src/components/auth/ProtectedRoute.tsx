
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Log de início da verificação de proteção
  console.log('ProtectedRoute iniciando verificação:', {
    path: location.pathname,
    hasSession: !!session,
    isLoading,
    hasCheckedAuth
  });

  // Efeito para verificação de autenticação
  useEffect(() => {
    // Se ainda estiver carregando, aguarda finalização
    if (isLoading) {
      console.log('ProtectedRoute: Auth ainda carregando, aguardando...');
      return;
    }

    console.log('ProtectedRoute: verificando acesso para', {
      path: location.pathname,
      hasSession: !!session,
      hasCheckedAuth
    });

    // Se já fez a verificação inicial, evita múltiplos redirecionamentos
    if (hasCheckedAuth) {
      console.log('ProtectedRoute: Já realizou verificação inicial');
      return;
    }

    // Indica que já realizou a verificação inicial
    setHasCheckedAuth(true);

    const isChangePasswordPage = location.pathname === '/auth/change-password';
    const isLoginPage = location.pathname === '/auth';
    
    // Se NÃO tem sessão e NÃO está em rota pública de auth
    if (!session && !location.pathname.startsWith('/auth')) {
      console.log('ProtectedRoute: Acesso não autorizado, redirecionando para login');
      
      // Adiciona pequeno atraso para garantir que o redirecionamento funcionará
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 50);
      return;
    }
    
    // Se tem sessão e está tentando acessar login
    if (session && isLoginPage) {
      console.log('ProtectedRoute: Usuário já autenticado, redirecionando para dashboard');
      
      // Adiciona pequeno atraso para garantir que o redirecionamento funcionará
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 50);
      return;
    }

  }, [session, isLoading, navigate, location.pathname, hasCheckedAuth]);

  // Se ainda está carregando e não fez a verificação inicial, mostra o loader
  if (isLoading || !hasCheckedAuth) {
    console.log('ProtectedRoute: Exibindo loader durante verificação');
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <span>Verificando autenticação...</span>
      </div>
    );
  }

  // Se não tiver sessão e não estiver em rota pública, não renderiza
  if (!session && !location.pathname.startsWith('/auth')) {
    console.log('ProtectedRoute: Acesso negado, aguardando redirecionamento');
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
