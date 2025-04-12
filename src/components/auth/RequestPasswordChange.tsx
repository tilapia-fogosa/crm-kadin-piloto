
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function RequestPasswordChange() {
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();

  console.log('RequestPasswordChange: Iniciando componente', {
    hasSession: !!session,
    isLoading
  });

  useEffect(() => {
    // Verificação de sessão
    if (!session) {
      console.log('RequestPasswordChange: Sem sessão, aguardando...');
      
      // Aguarda um pouco para verificar se a sessão está sendo carregada
      const timer = setTimeout(() => {
        if (!session) {
          console.log('RequestPasswordChange: Sem sessão após tempo de espera, redirecionando');
          navigate('/auth', { replace: true });
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Se tem sessão, verifica o perfil
    const checkProfile = async () => {
      try {
        console.log('RequestPasswordChange: Verificando perfil do usuário');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('must_change_password, access_blocked')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('RequestPasswordChange: Erro ao buscar perfil:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível verificar seu perfil',
            variant: 'destructive',
          });
          navigate('/auth', { replace: true });
          return;
        }
        
        console.log('RequestPasswordChange: Dados do perfil:', data);
        
        // Verifica se acesso está bloqueado
        if (data.access_blocked) {
          console.log('RequestPasswordChange: Acesso bloqueado');
          toast({
            title: 'Acesso bloqueado',
            description: 'Seu acesso foi bloqueado. Entre em contato com o administrador.',
            variant: 'destructive',
          });
          
          // Faz logout e redireciona
          await supabase.auth.signOut();
          navigate('/auth', { replace: true });
          return;
        }
        
        // Verifica se precisa trocar senha
        if (!data.must_change_password) {
          console.log('RequestPasswordChange: Não precisa trocar senha, redirecionando');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        // Configura estado
        setMustChangePassword(true);
        setProfileChecked(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error('RequestPasswordChange: Erro ao verificar perfil', error);
        toast({
          title: 'Erro',
          description: 'Falha ao verificar seu perfil',
          variant: 'destructive',
        });
        navigate('/auth', { replace: true });
      }
    };
    
    checkProfile();
    
  }, [session, navigate, toast]);

  // Se estiver carregando ou não tiver verificado o perfil, mostra loader
  if (isLoading || !profileChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-muted-foreground">
          Verificando suas informações...
        </span>
      </div>
    );
  }

  // Se precisa trocar senha, mostra o formulário
  if (mustChangePassword) {
    console.log('RequestPasswordChange: Renderizando formulário de troca de senha');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm p-4">
          <ChangePasswordForm />
        </div>
      </div>
    );
  }

  // Fallback - não deveria chegar aqui devido aos redirecionamentos acima
  console.log('RequestPasswordChange: Estado inesperado, redirecionando');
  navigate('/auth', { replace: true });
  return null;
}
