
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

  // Só verifica o perfil se já tiver sessão autenticada
  const enabled = !!session && !authLoading;

  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ['user-profile-password-check', session?.user.id],
    queryFn: async () => {
      console.log('Checking user profile for password change requirement');
      
      if (!session?.user) {
        console.log('No authenticated user found');
        throw new Error('Usuário não autenticado');
      }

      console.log('Querying profile for user:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('must_change_password, access_blocked')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      console.log('Profile data:', data);
      return data;
    },
    enabled,
    retry: 1,
  });

  useEffect(() => {
    console.log('RequestPasswordChange component mounted', {
      authLoading,
      profileLoading,
      session: !!session,
      profile
    });
    
    // Se auth estiver carregando, espera
    if (authLoading) return;
    
    // Se não tem sessão, redireciona para login
    if (!session) {
      console.log('No session, redirecting to login');
      setIsRedirecting(true);
      navigate('/auth', { replace: true });
      return;
    }
    
    // Se profile ainda está carregando, espera
    if (enabled && profileLoading) return;
    
    // Se tem perfil, verifica regras
    if (profile) {
      console.log('Profile loaded, checking access state');
      
      if (profile.access_blocked) {
        console.log('User access is blocked, signing out');
        setIsRedirecting(true);
        // Fazemos logout e redirecionamos para login
        supabase.auth.signOut().then(() => {
          navigate('/auth', { replace: true });
        });
        return;
      } 
      
      if (!profile.must_change_password) {
        console.log('User does not need to change password, redirecting to dashboard');
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-4">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
