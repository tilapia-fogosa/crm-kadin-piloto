
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Definição do contexto de autenticação
interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

// Inicialização do contexto com valor undefined para detecção de erro
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Log de criação do contexto
console.log('AuthContext: Contexto criado');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  console.log('AuthProvider: Inicializando...', { 
    path: location.pathname,
    isLoading 
  });

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

  // Função para verificar se o usuário precisa alterar a senha
  const checkPasswordRequirement = async (userId: string) => {
    console.log('AuthProvider: Verificando necessidade de troca de senha');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('must_change_password, access_blocked')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('AuthProvider: Erro ao verificar perfil:', error);
        return false;
      }
      
      if (data?.access_blocked) {
        console.log('AuthProvider: Acesso bloqueado, forçando logout');
        toast({
          title: "Acesso bloqueado",
          description: "Seu acesso foi bloqueado. Entre em contato com o administrador.",
          variant: "destructive",
        });
        await signOut();
        return false;
      }
      
      console.log('AuthProvider: Perfil verificado, must_change_password =', data?.must_change_password);
      return data?.must_change_password || false;
    } catch (err) {
      console.error('AuthProvider: Erro ao verificar perfil:', err);
      return false;
    }
  };

  // Efeito para lidar com navegação pós-login
  useEffect(() => {
    if (!session || isLoading) return;
    
    // Não redireciona se estiver na página de login e não tiver sessão
    if (!session && location.pathname === '/auth') return;

    // Não redireciona se já estiver em alguma rota protegida
    if (session && !location.pathname.startsWith('/auth')) return;

    // Verifica se precisa trocar senha apenas se tiver sessão e estiver em /auth
    const handleRedirect = async () => {
      console.log('AuthProvider: Verificando redirecionamento necessário');
      
      // Se está na página de login com sessão válida, redireciona
      if (session && location.pathname === '/auth') {
        console.log('AuthProvider: Logado e na página de login, redirecionando');
        
        try {
          // Verifica se precisa trocar senha
          const mustChangePassword = await checkPasswordRequirement(session.user.id);
          
          if (mustChangePassword) {
            console.log('AuthProvider: Redirecionando para troca de senha');
            navigate('/auth/change-password', { replace: true });
          } else {
            console.log('AuthProvider: Redirecionando para dashboard');
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('AuthProvider: Erro ao redirecionar:', error);
        }
      }
    };
    
    handleRedirect();
  }, [session, isLoading, location.pathname, navigate]);

  // Efeito para lidar com eventos de autenticação
  useEffect(() => {
    console.log('AuthProvider: Configurando ouvinte de eventos de autenticação');
    setIsLoading(true);
    
    // Verifica sessão existente primeiro
    const initSession = async () => {
      try {
        console.log('AuthProvider: Verificando sessão existente');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('AuthProvider: Sessão existente:', currentSession ? 'Presente' : 'Ausente');
        
        if (currentSession) {
          setSession(currentSession);
        }
      } catch (error) {
        console.error('AuthProvider: Erro ao verificar sessão existente:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initSession();
    
    // Configura ouvinte para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('AuthProvider: Evento de autenticação:', event);
      
      // Atualiza estado da sessão
      setSession(currentSession);
      
      // Finaliza carregamento
      setIsLoading(false);
      
      // Handle eventos específicos - removido o toast de login bem-sucedido
      if (event === 'SIGNED_IN') {
        console.log('AuthProvider: Usuário fez login');
        // Toast de login removido aqui
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthProvider: Usuário fez logout');
      }
    });
    
    // Limpa subscription
    return () => {
      console.log('AuthProvider: Limpando subscription');
      subscription.unsubscribe();
    };
  }, [toast]);

  console.log('AuthProvider: Renderizando com estado:', { 
    hasSession: !!session, 
    isLoading, 
    currentPath: location.pathname 
  });

  // IMPORTANTE: Certifique-se de que o valor do contexto nunca seja undefined
  const contextValue: AuthContextType = { 
    session, 
    isLoading, 
    signOut 
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth chamado fora de um AuthProvider');
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
