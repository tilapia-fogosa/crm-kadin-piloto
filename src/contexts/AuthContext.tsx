import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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
  console.log('AuthProvider rendering');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);
  const authInitialized = useRef(false);

  // Função para verificar se o usuário precisa alterar a senha
  const checkPasswordChangeRequirement = async (userId: string) => {
    console.log('Checking if user needs to change password:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('must_change_password, access_blocked')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error checking password change requirement:', error);
        return { mustChangePassword: false, accessBlocked: false };
      }
      
      console.log('Password change profile check result:', profile);
      return { 
        mustChangePassword: profile?.must_change_password || false, 
        accessBlocked: profile?.access_blocked || false 
      };
    } catch (err) {
      console.error('Exception in password change check:', err);
      return { mustChangePassword: false, accessBlocked: false };
    }
  };

  // Initialize auth state once
  useEffect(() => {
    console.log('Initializing auth state, authInitialized:', authInitialized.current);
    
    if (authInitialized.current) return;
    
    async function initializeAuth() {
      try {
        console.log('Getting initial session');
        setIsLoading(true);
        
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession ? 'Present' : 'None');
        
        if (initialSession) {
          setSession(initialSession);
          setHasShownWelcomeToast(true);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
        authInitialized.current = true;
      }
    }

    initializeAuth();
    
    // Set up the auth state change listener
    console.log('Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession ? 'Has session' : 'No session');
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in');
        setSession(newSession);
        
        // Show welcome toast
        if (!hasShownWelcomeToast) {
          console.log('Showing welcome toast');
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!",
            variant: "default",
          });
          setHasShownWelcomeToast(true);
        }
        
        // Check password change requirement
        if (newSession) {
          // Use setTimeout to avoid race conditions with state updates
          setTimeout(async () => {
            try {
              const { mustChangePassword, accessBlocked } = 
                await checkPasswordChangeRequirement(newSession.user.id);
              
              if (accessBlocked) {
                console.log('User access is blocked, signing out');
                await supabase.auth.signOut();
                navigate('/auth', { replace: true });
                return;
              }
              
              if (mustChangePassword) {
                console.log('User must change password, redirecting');
                navigate('/auth/change-password', { replace: true });
                return;
              }
              
              // Otherwise redirect to dashboard if on auth page
              if (location.pathname.startsWith('/auth') && 
                  location.pathname !== '/auth/change-password') {
                console.log('Redirecting to dashboard from auth page');
                navigate('/dashboard', { replace: true });
              }
            } catch (error) {
              console.error('Error handling post sign-in:', error);
            }
          }, 0);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setSession(null);
        setHasShownWelcomeToast(false);
        navigate('/auth', { replace: true });
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
        setSession(newSession);
      }
    });

    return () => {
      console.log('Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname, hasShownWelcomeToast]);

  const signOut = async () => {
    console.log('Signing out user');
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
