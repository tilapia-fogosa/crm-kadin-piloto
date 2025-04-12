
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  // Log de início da verificação de proteção
  console.log('ProtectedRoute iniciando verificação:', {
    path: location.pathname,
    hasSession: !!session,
    isLoading,
    isInitialCheck
  });

  // Efeito para verificação de autenticação
  useEffect(() => {
    // Se ainda estiver carregando, não faz nada
    if (isLoading) {
      console.log('ProtectedRoute: Auth ainda carregando, aguardando...');
      return;
    }

    console.log('ProtectedRoute: verificando acesso para', {
      path: location.pathname,
      hasSession: !!session,
      isInitialCheck
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
      console.log('ProtectedRoute: Usuário já autenticado, redirecionando para dashboard');
      navigate("/dashboard", { replace: true });
      return;
    }

    // Finaliza verificação inicial
    if (isInitialCheck) {
      console.log('ProtectedRoute: Finalizando verificação inicial');
      setIsInitialCheck(false);
    }
  }, [session, isLoading, navigate, location.pathname, isInitialCheck]);

  // Mostra loader durante o carregamento inicial
  if (isLoading || isInitialCheck) {
    console.log('ProtectedRoute: Exibindo loader');
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando autenticação...</span>
      </div>
    );
  }

  // Se não tiver sessão e não estiver em rota pública, não renderiza
  if (!session && !location.pathname.startsWith('/auth')) {
    console.log('ProtectedRoute: Acesso negado');
    return null;
  }

  // Renderiza o conteúdo protegido
  console.log('ProtectedRoute: Renderizando conteúdo protegido');
  return <>{children}</>;
}
