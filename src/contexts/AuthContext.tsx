
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

  useEffect(() => {
    console.log('Initializing auth state');
    
    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession ? 'Present' : 'None');
        setSession(initialSession);
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
        console.log('User signed in, showing success toast');
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
          variant: "default",
        });
        // Só redireciona para o dashboard se estiver na página de autenticação
        if (location.pathname.startsWith('/auth')) {
          navigate('/dashboard', { replace: true });
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to login');
        navigate('/auth', { replace: true });
      }
    });

    return () => {
      console.log('Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname]);

  useEffect(() => {
    console.log('Route protection check:', {
      isLoading,
      hasSession: !!session,
      currentPath: location.pathname
    });

    if (!isLoading) {
      if (session && location.pathname === '/auth') {
        console.log('Authenticated user on auth page, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else if (!session && !location.pathname.startsWith('/auth')) {
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
