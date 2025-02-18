
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "./useRole";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { role, isCheckingRole } = useRole();

  const { data: session, isLoading: isCheckingSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Sessão atual:", session);
      return session;
    },
  });

  useEffect(() => {
    // Se estiver carregando, não faz nada ainda
    if (isCheckingSession || isCheckingRole) return;

    // Se não tiver sessão, redireciona para login
    if (!session && location.pathname !== '/auth') {
      console.log("Usuário não autenticado, redirecionando para /auth");
      toast({
        title: "Sessão expirada",
        description: "Por favor, faça login para continuar.",
      });
      navigate("/auth");
      return;
    }

    // Se tiver sessão mas não tiver papel, algo está errado
    if (session && !role && !isCheckingRole) {
      console.log("Usuário sem papel definido");
      toast({
        variant: "destructive",
        title: "Erro de permissão",
        description: "Você não tem um papel definido no sistema. Entre em contato com o administrador.",
      });
      navigate("/auth");
      return;
    }
  }, [session, isCheckingSession, role, isCheckingRole, navigate, location.pathname, toast]);

  // Mostra um loading enquanto verifica a sessão ou o papel
  if (isCheckingSession || isCheckingRole) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  // Se não estiver autenticado ou não tiver papel, não renderiza nada
  if (!session || !role) {
    return null;
  }

  // Se estiver autenticado e tiver papel, renderiza o conteúdo
  return <>{children}</>;
}
