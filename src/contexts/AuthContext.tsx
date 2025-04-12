
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);

  useEffect(() => {
    console.log('Initializing auth state');
    
    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession ? 'Present' : 'None');
        setSession(initialSession);
        if (initialSession) {
          setHasShownWelcomeToast(true);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  useEffect(() => {
    console.log('Setting up auth state change listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession ? 'Has session' : 'No session');
      setSession(newSession);

      if (event === 'SIGNED_IN') {
        console.log('User signed in, checking if welcome toast should be shown');
        if (!hasShownWelcomeToast) {
          console.log('Showing welcome toast');
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!",
            variant: "default",
          });
          setHasShownWelcomeToast(true);
        }
        
        // Verificar se o usuário precisa alterar a senha
        if (newSession) {
          try {
            console.log('Checking if user needs to change password');
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('must_change_password')
              .eq('id', newSession.user.id)
              .single();
              
            if (error) {
              console.error('Error checking password change requirement:', error);
            } else if (profile && profile.must_change_password) {
              console.log('User must change password, redirecting');
              // Use setTimeout para evitar conflito com outras navegações
              setTimeout(() => {
                navigate('/auth/change-password', { replace: true });
              }, 0);
              return; // Interrompe a execução para não redirecionar para o dashboard
            }
          } catch (error) {
            console.error('Error in password change check:', error);
          }
        }
        
        // Apenas redireciona para o dashboard se não estiver na rota de alteração de senha
        if (location.pathname.startsWith('/auth') && location.pathname !== '/auth/change-password') {
          console.log('Redirecting to dashboard from auth page');
          navigate('/dashboard', { replace: true });
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to login');
        navigate('/auth', { replace: true });
        setHasShownWelcomeToast(false);
      }
    });

    return () => {
      console.log('Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname, hasShownWelcomeToast]);

  useEffect(() => {
    // Apenas executa após carregar a sessão inicial
    if (!isLoading) {
      console.log('Route protection check:', {
        hasSession: !!session,
        currentPath: location.pathname
      });

      const isChangePasswordPage = location.pathname === '/auth/change-password';
      
      // Se tem sessão mas está na página de login (não na troca de senha), vai para dashboard
      if (session && location.pathname === '/auth' && !isChangePasswordPage) {
        console.log('Authenticated user on auth page, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } 
      // Se não tem sessão e não está em uma rota pública, redireciona para login
      else if (!session && !location.pathname.startsWith('/auth')) {
        console.log('Unauthenticated user on protected route, redirecting to login');
        navigate('/auth', { replace: true });
      }
    }
  }, [session, isLoading, navigate, location.pathname]);

  const signOut = async () => {
    console.log('Signing out user');
    try {
      await supabase.auth.signOut();
      console.log('User signed out successfully');
      navigate('/auth', { replace: true });
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
