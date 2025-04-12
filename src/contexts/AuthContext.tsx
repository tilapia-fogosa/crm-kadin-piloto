
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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
  console.log('AuthProvider renderizando');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Função para verificar se o usuário precisa alterar a senha
  const checkPasswordChangeRequirement = useCallback(async (userId: string) => {
    console.log('Verificando necessidade de troca de senha para:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('must_change_password, access_blocked')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao verificar requisito de troca de senha:', error);
        return { mustChangePassword: false, accessBlocked: false };
      }
      
      console.log('Resultado da verificação do perfil para troca de senha:', profile);
      return { 
        mustChangePassword: profile?.must_change_password || false, 
        accessBlocked: profile?.access_blocked || false 
      };
    } catch (err) {
      console.error('Exceção na verificação de troca de senha:', err);
      return { mustChangePassword: false, accessBlocked: false };
    }
  }, []);

  // Função para lidar com mudanças no estado de autenticação
  const handleAuthChange = useCallback(async (newSession: Session | null) => {
    console.log('Alteração de estado de autenticação detectada:', newSession ? 'Com sessão' : 'Sem sessão');
    
    if (newSession) {
      setSession(newSession);
      
      // Mostra toast de boas-vindas apenas no login
      if (!session) {
        console.log('Mostrando toast de boas-vindas');
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
          variant: "default",
        });
      }
      
      // Verifica necessidade de troca de senha apenas se mudou a sessão
      if (!session || session.user.id !== newSession.user.id) {
        try {
          const { mustChangePassword, accessBlocked } = 
            await checkPasswordChangeRequirement(newSession.user.id);
          
          if (accessBlocked) {
            console.log('Acesso do usuário está bloqueado, fazendo logout');
            await supabase.auth.signOut();
            navigate('/auth', { replace: true });
            return;
          }
          
          if (mustChangePassword) {
            console.log('Usuário precisa trocar a senha, redirecionando');
            navigate('/auth/change-password', { replace: true });
            return;
          }
          
          // Redireciona para dashboard se estiver na página de auth
          if (location.pathname === '/auth') {
            console.log('Redirecionando para dashboard da página de auth');
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Erro ao processar pós-login:', error);
        }
      }
    } else {
      // Limpeza de sessão
      setSession(null);
      
      // Redireciona para login se não estiver em uma rota de auth
      if (!location.pathname.startsWith('/auth')) {
        console.log('Usuário desconectado, redirecionando para login');
        navigate('/auth', { replace: true });
      }
    }
  }, [session, navigate, location.pathname, toast, checkPasswordChangeRequirement]);

  // Inicialização única do estado de autenticação
  useEffect(() => {
    console.log('Inicializando estado de autenticação, initializing:', isInitialized);
    
    if (isInitialized) return;
    
    const initAuth = async () => {
      try {
        console.log('Obtendo sessão inicial');
        setIsLoading(true);
        
        // Configura o listener de mudança de estado ANTES de checar a sessão inicial
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('Evento de estado de autenticação:', event, currentSession ? 'Com sessão' : 'Sem sessão');
          
          if (event === 'SIGNED_IN') {
            console.log('Usuário fez login');
            handleAuthChange(currentSession);
          } else if (event === 'SIGNED_OUT') {
            console.log('Usuário fez logout');
            handleAuthChange(null);
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token atualizado');
            handleAuthChange(currentSession);
          }
        });
        
        // DEPOIS configura o listener, obtém a sessão inicial
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Sessão inicial:', initialSession ? 'Presente' : 'Nenhuma');
        
        // Atualiza o estado com a sessão inicial
        await handleAuthChange(initialSession);
        
        setIsInitialized(true);
        setIsLoading(false);
        
        return () => {
          console.log('Limpando listener de estado de autenticação');
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [handleAuthChange, isInitialized]);

  // Função para fazer logout
  const signOut = async () => {
    console.log('Iniciando processo de logout');
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
