
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  // Efeito para verificação de autenticação
  useEffect(() => {
    console.log('ProtectedRoute check:', {
      isLoading,
      hasSession: !!session,
      pathname: location.pathname,
      isInitialCheck
    });

    if (isLoading) {
      console.log('Auth is still loading, waiting...');
      return; // Espera pelo carregamento do auth
    }

    // Caso especial: página de troca de senha
    const isChangePasswordPage = location.pathname === '/auth/change-password';
    
    // Se não tem sessão e não está em uma rota pública de auth
    if (!session && !location.pathname.startsWith('/auth')) {
      console.log('Unauthorized access, redirecting to login');
      navigate("/auth", { replace: true });
      return;
    }
    
    // Se tem sessão mas está tentando acessar a página de login
    if (session && location.pathname === '/auth') {
      console.log('User already logged in, redirecting to dashboard');
      navigate("/dashboard", { replace: true });
      return;
    }

    // Finaliza a verificação inicial
    if (isInitialCheck) {
      setIsInitialCheck(false);
    }
  }, [session, isLoading, navigate, location.pathname, isInitialCheck]);

  // Mostra loader durante a verificação inicial de autenticação
  if (isLoading || isInitialCheck) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando autenticação...</span>
      </div>
    );
  }

  // Se não tem sessão e não está em uma rota pública, não renderiza nada
  // (o redirecionamento já foi acionado no useEffect)
  if (!session && !location.pathname.startsWith('/auth')) {
    return null;
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>;
}
