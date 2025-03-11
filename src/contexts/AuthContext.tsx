
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
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

  // Use React Query to manage session state
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      console.log('Fetching initial session state');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session state:', session ? 'Authenticated' : 'Not authenticated');
      return session;
    },
  });

  // Handle auth state changes
  useEffect(() => {
    console.log('Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Has session' : 'No session');
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in, showing success toast');
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
          variant: "default",
        });
        navigate('/dashboard', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to login');
        navigate('/auth', { replace: true });
      }
    });

    return () => {
      console.log('Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Effect for handling authenticated state routing
  useEffect(() => {
    console.log('Checking auth state for routing', { 
      isLoading, 
      hasSession: !!session, 
      pathname: location.pathname 
    });
    
    if (!isLoading) {
      if (session && location.pathname === '/auth') {
        console.log('Authenticated user accessing /auth, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else if (!session && location.pathname !== '/auth' && location.pathname !== '/auth/callback') {
        console.log('Unauthenticated user accessing protected route, redirecting to login');
        navigate('/auth', { replace: true });
      }
    }
  }, [session, isLoading, navigate, location.pathname]);

  const signOut = async () => {
    console.log('Signing out user');
    await supabase.auth.signOut();
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
