
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Verificar se o usuário está autenticado
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Verificar se é admin
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ['is_admin', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return false;
      const { data, error } = await supabase.rpc('is_admin', { user_uid: profile.id });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    if (sessionLoading || profileLoading || isAdminLoading) return;

    if (!session) {
      navigate("/auth");
      return;
    }

    // Admins têm acesso a todas as páginas
    if (isAdmin) {
      return;
    }

    // Se não for admin, verificar rotas restritas
    const restrictedRoutes = ['/units', '/users'];
    if (restrictedRoutes.includes(location.pathname)) {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
      });
      navigate("/");
      return;
    }
  }, [session, sessionLoading, profile, profileLoading, isAdmin, isAdminLoading, location.pathname, navigate, toast]);

  if (sessionLoading || profileLoading || isAdminLoading) {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
