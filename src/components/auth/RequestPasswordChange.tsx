
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function RequestPasswordChange() {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile-password-check'],
    queryFn: async () => {
      console.log('Checking user profile for password change requirement');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        throw new Error('Usuário não autenticado');
      }

      console.log('Querying profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('must_change_password, access_blocked')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      console.log('Profile data:', data);
      return data;
    },
    retry: 1,
  });

  useEffect(() => {
    if (!isLoading && profile) {
      console.log('Profile loaded, checking access state');
      
      if (profile.access_blocked) {
        console.log('User access is blocked, signing out');
        setIsRedirecting(true);
        // Fazemos logout e redirecionamos para login
        supabase.auth.signOut().then(() => {
          navigate('/auth', { replace: true });
        });
      } else if (!profile.must_change_password) {
        console.log('User does not need to change password, redirecting to dashboard');
        setIsRedirecting(true);
        // Se não precisa trocar a senha, redireciona para o dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [profile, isLoading, navigate]);

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          {isRedirecting ? 'Redirecionando...' : 'Carregando...'}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-4">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
