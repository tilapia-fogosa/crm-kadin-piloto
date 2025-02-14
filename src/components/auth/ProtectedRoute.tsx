
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

  // Verificar permissões de acesso à página atual
  const { data: hasAccess, isLoading: permissionLoading } = useQuery({
    queryKey: ['page-access', location.pathname, profile?.role],
    queryFn: async () => {
      if (!profile?.role) return false;

      const { data: permissions } = await supabase
        .from('access_permissions')
        .select('page_id')
        .eq('profile', profile.role)
        .innerJoin('system_pages', {
          'access_permissions.page_id': 'system_pages.id',
          'path': location.pathname
        });

      return permissions && permissions.length > 0;
    },
    enabled: !!profile?.role && !!location.pathname,
  });

  useEffect(() => {
    if (sessionLoading || profileLoading || permissionLoading) return;

    if (!session) {
      navigate("/auth");
      return;
    }

    if (profile?.role && !hasAccess) {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
      });
      navigate("/");
      return;
    }
  }, [session, sessionLoading, profile, profileLoading, hasAccess, permissionLoading, navigate, toast]);

  if (sessionLoading || profileLoading || permissionLoading) {
    return <div>Carregando...</div>;
  }

  if (!session || (profile?.role && !hasAccess)) {
    return null;
  }

  return <>{children}</>;
}
