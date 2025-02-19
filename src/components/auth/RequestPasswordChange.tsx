
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function RequestPasswordChange() {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .select('must_change_password, access_blocked')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      if (profile.access_blocked) {
        // Se o acesso está bloqueado, faz logout e redireciona para login
        supabase.auth.signOut();
        navigate('/auth');
      } else if (!profile.must_change_password) {
        // Se não precisa trocar a senha, redireciona para o dashboard
        navigate('/dashboard');
      }
    }
  }, [profile, navigate]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-4">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
