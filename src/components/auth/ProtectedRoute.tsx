
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('must_change_password, access_blocked')
        .eq('id', session!.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!isLoadingSession && !session && location.pathname !== '/auth') {
      // Redireciona para a tela de login se não estiver autenticado
      navigate("/auth");
    } else if (session && profile) {
      if (profile.access_blocked) {
        // Se o acesso está bloqueado, faz logout
        supabase.auth.signOut();
        navigate("/auth");
      } else if (profile.must_change_password && location.pathname !== '/auth/change-password') {
        // Se precisa trocar a senha e não está na página de troca, redireciona
        navigate("/auth/change-password");
      }
    }
  }, [session, profile, isLoadingSession, navigate, location]);

  // Mostra um loading enquanto verifica a sessão e o perfil
  if (isLoadingSession || (session && isLoadingProfile)) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // Se não estiver autenticado, não renderiza nada
  if (!session) {
    return null;
  }

  // Se estiver autenticado, renderiza o conteúdo
  return <>{children}</>;
}
