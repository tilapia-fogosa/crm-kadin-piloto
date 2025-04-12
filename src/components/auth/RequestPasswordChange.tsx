
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function RequestPasswordChange() {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { session, isLoading: authLoading } = useAuth();

  console.log('RequestPasswordChange: Iniciando componente', {
    hasSession: !!session,
    authLoading
  });

  // Só verifica o perfil se já tiver sessão autenticada
  const enabled = !!session && !authLoading;

  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ['user-profile-password-check', session?.user.id],
    queryFn: async () => {
      console.log('Verificando perfil do usuário para requisito de troca de senha');
      
      if (!session?.user) {
        console.log('Nenhum usuário autenticado encontrado');
        throw new Error('Usuário não autenticado');
      }

      console.log('Consultando perfil para usuário:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('must_change_password, access_blocked')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }
      
      console.log('Dados do perfil:', data);
      return data;
    },
    enabled,
    retry: 1,
  });

  useEffect(() => {
    console.log('RequestPasswordChange: effect executando', {
      authLoading,
      profileLoading,
      session: !!session,
      profile
    });
    
    // Se auth estiver carregando, espera
    if (authLoading) return;
    
    // Se não tem sessão, redireciona para login
    if (!session) {
      console.log('Sem sessão, redirecionando para login');
      setIsRedirecting(true);
      navigate('/auth', { replace: true });
      return;
    }
    
    // Se profile ainda está carregando, espera
    if (enabled && profileLoading) return;
    
    // Se tem perfil, verifica regras
    if (profile) {
      console.log('Perfil carregado, verificando estado de acesso');
      
      if (profile.access_blocked) {
        console.log('Acesso do usuário está bloqueado, fazendo logout');
        setIsRedirecting(true);
        // Fazemos logout e redirecionamos para login
        supabase.auth.signOut().then(() => {
          navigate('/auth', { replace: true });
        });
        return;
      } 
      
      if (!profile.must_change_password) {
        console.log('Usuário não precisa trocar a senha, redirecionando para dashboard');
        setIsRedirecting(true);
        // Se não precisa trocar a senha, redireciona para o dashboard
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [profile, profileLoading, authLoading, session, navigate, enabled]);

  // Condição de loading
  const isLoading = authLoading || (enabled && profileLoading) || isRedirecting;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          {isRedirecting ? 'Redirecionando...' : 'Verificando perfil...'}
        </span>
      </div>
    );
  }

  // Se tiver erro, mostra
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-red-500">
          Erro ao verificar perfil. Por favor, tente novamente.
        </div>
      </div>
    );
  }

  // Mostra o formulário se chegou até aqui (tem sessão e precisa trocar senha)
  console.log('Renderizando formulário de troca de senha');
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-4">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
