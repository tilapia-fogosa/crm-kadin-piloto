
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

// Rotas que requerem role de franqueado
const FRANQUEADO_ROUTES = ['/units'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  useEffect(() => {
    // Verificar autenticação
    if (!sessionLoading && !session) {
      navigate("/auth");
      return;
    }

    // Verificar permissões baseadas em role
    if (!profileLoading && profile) {
      const isFranqueadoRoute = FRANQUEADO_ROUTES.some(route => 
        location.pathname.startsWith(route)
      );
      
      if (isFranqueadoRoute && profile.role !== 'franqueado') {
        navigate("/"); // Redireciona para home se não tiver permissão
      }
    }
  }, [session, sessionLoading, profile, profileLoading, navigate, location]);

  if (sessionLoading || profileLoading) {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
