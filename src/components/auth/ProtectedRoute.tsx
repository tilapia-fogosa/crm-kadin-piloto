
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute check:', {
      isLoading,
      hasSession: !!session,
      pathname: location.pathname
    });

    // Se não estiver carregando e não tiver sessão, redireciona para login
    // Exceto na rota de troca de senha, que tem lógica especial
    if (!isLoading && !session && !location.pathname.startsWith('/auth')) {
      console.log('Unauthorized access, redirecting to login');
      navigate("/auth", { replace: true });
    }
  }, [session, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session && !location.pathname.startsWith('/auth')) {
    return null;
  }

  return <>{children}</>;
}
