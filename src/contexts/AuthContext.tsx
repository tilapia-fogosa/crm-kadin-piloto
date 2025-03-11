
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { toast } = useToast();

  // Use React Query to manage session state
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
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
