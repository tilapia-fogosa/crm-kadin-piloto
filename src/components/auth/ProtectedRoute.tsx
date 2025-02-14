
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  useEffect(() => {
    // Verificar apenas autenticação, sem verificar roles
    if (!sessionLoading && !session) {
      navigate("/auth");
      return;
    }
  }, [session, sessionLoading, navigate]);

  if (sessionLoading || profileLoading) {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
