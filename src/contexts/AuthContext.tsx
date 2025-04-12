
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Definição simplificada do contexto de autenticação
interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('AuthProvider: Inicializando...');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Função para verificar se o usuário precisa alterar a senha
  const checkPasswordChangeRequirement = useCallback(async (userId: string): Promise<boolean> => {
    console.log('AuthProvider: Verificando necessidade de troca de senha para:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('must_change_password, access_blocked')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('AuthProvider: Erro ao verificar requisito de troca de senha:', error);
        return false;
      }
      
      if (profile?.access_blocked) {
        console.log('AuthProvider: Acesso do usuário está bloqueado');
        await supabase.auth.signOut();
        toast({
          title: "Acesso bloqueado",
          description: "Seu acesso foi bloqueado. Entre em contato com o administrador.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('AuthProvider: Perfil verificado, must_change_password =', profile?.must_change_password);
      return profile?.must_change_password || false;
    } catch (err) {
      console.error('AuthProvider: Exceção na verificação de troca de senha:', err);
      return false;
    }
  }, [toast]);

  // Função para processar navegação pós-login
  const handlePostLoginNavigation = useCallback(async (currentSession: Session) => {
    console.log('AuthProvider: Processando navegação pós-login');
    
    try {
      // Verificar requisito de troca de senha
      const mustChangePassword = await checkPasswordChangeRequirement(currentSession.user.id);
      
      if (mustChangePassword) {
        console.log('AuthProvider: Usuário precisa trocar senha, redirecionando para /auth/change-password');
        navigate('/auth/change-password', { replace: true });
      } else {
        console.log('AuthProvider: Redirecionando para dashboard após login bem-sucedido');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('AuthProvider: Erro ao processar navegação pós-login:', error);
    }
  }, [navigate, checkPasswordChangeRequirement]);

  // Efeito para lidar com eventos de autenticação
  useEffect(() => {
    if (isInitialized) {
      console.log('AuthProvider: Já inicializado, ignorando');
      return;
    }
    
    console.log('AuthProvider: Configurando ouvinte de eventos de autenticação');
    setIsInitialized(true);
    
    // Configurar ouvinte de eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('AuthProvider: Evento de autenticação:', event);
      
      // Atualizar estado com a sessão atual
      setSession(currentSession);
      
      // Processar eventos específicos
      if (event === 'SIGNED_IN') {
        console.log('AuthProvider: Usuário autenticado');
        setIsLoading(false);
        
        if (currentSession) {
          console.log('AuthProvider: Processando navegação pós-login após SIGNED_IN');
          // Use setTimeout para evitar problemas de concorrência
          setTimeout(() => {
            handlePostLoginNavigation(currentSession);
          }, 100);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        console.log('AuthProvider: Usuário desconectado');
        setIsLoading(false);
        
        // Redirecionar para página de login se necessário
        navigate('/auth', { replace: true });
      }
      else if (event === 'TOKEN_REFRESHED') {
        console.log('AuthProvider: Token atualizado');
        setIsLoading(false);
      }
      else if (event === 'INITIAL_SESSION') {
        console.log('AuthProvider: Sessão inicial verificada:', currentSession ? 'Presente' : 'Ausente');
        setIsLoading(false);
        
        if (currentSession) {
          // Use setTimeout para evitar problemas de concorrência
          setTimeout(() => {
            handlePostLoginNavigation(currentSession);
          }, 100);
        }
      }
    });
    
    // Verificar sessão inicial
    const initializeSession = async () => {
      try {
        console.log('AuthProvider: Verificando sessão inicial');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        console.log('AuthProvider: Sessão inicial obtida:', initialSession ? 'Presente' : 'Ausente');
        setSession(initialSession);
        
        if (!initialSession) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Erro ao verificar sessão inicial:', error);
        setIsLoading(false);
      }
    };
    
    initializeSession();
    
    // Limpar subscription ao desmontar
    return () => {
      console.log('AuthProvider: Limpando subscription');
      subscription.unsubscribe();
    };
  }, [navigate, handlePostLoginNavigation, isInitialized]);

  // Função para fazer logout
  const signOut = async () => {
    console.log('AuthProvider: Iniciando processo de logout');
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      console.log('AuthProvider: Logout bem-sucedido');
      setSession(null);
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('AuthProvider: Erro ao fazer logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Valor do contexto
  const value = {
    session,
    isLoading,
    signOut,
  };

  console.log('AuthProvider: Renderizando com estado:', { 
    hasSession: !!session, 
    isLoading, 
    isInitialized 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
