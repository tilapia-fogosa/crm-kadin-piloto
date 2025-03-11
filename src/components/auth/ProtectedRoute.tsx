
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !session && location.pathname !== '/auth') {
      console.log('Usuário não autenticado, redirecionando para login');
      navigate("/auth", { replace: true });
    }
  }, [session, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading">Carregando...</span>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza nada
  if (!session) {
    return null;
  }

  // Se estiver autenticado, renderiza o conteúdo
  return <>{children}</>;
}
