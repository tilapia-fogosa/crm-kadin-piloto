
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase, debugSession } from '@/integrations/supabase/client';
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
  const isAuthInitialized = useRef(false);
  const isProcessingRedirect = useRef(false);
  
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

  // Função para processar navegação pós-login
  const handlePostLoginNavigation = useCallback(async (currentSession: Session | null) => {
    console.log('Processando navegação pós-login:', currentSession ? 'Com sessão' : 'Sem sessão');
    
    if (isProcessingRedirect.current) {
      console.log('Já existe um redirecionamento em andamento, ignorando');
      return;
    }
    
    if (!currentSession) {
      console.log('Sem sessão, não há redirecionamento a fazer');
      return;
    }
    
    try {
      isProcessingRedirect.current = true;
      
      // Verificar requisitos de senha e bloqueio
      const { mustChangePassword, accessBlocked } = 
        await checkPasswordChangeRequirement(currentSession.user.id);
      
      if (accessBlocked) {
        console.log('Acesso do usuário está bloqueado, fazendo logout');
        await supabase.auth.signOut();
        toast({
          title: "Acesso bloqueado",
          description: "Seu acesso foi bloqueado. Entre em contato com o administrador.",
          variant: "destructive",
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      if (mustChangePassword) {
        console.log('Usuário precisa trocar a senha, redirecionando');
        
        // Adicionar um pequeno atraso antes do redirecionamento para evitar problemas de rota
        setTimeout(() => {
          navigate('/auth/change-password', { replace: true });
        }, 100);
        return;
      }
      
      // Se estiver na página de login e tiver sessão válida, redireciona para dashboard
      if (location.pathname === '/auth') {
        console.log('Redirecionando para dashboard da página de auth');
        
        // Adicionar um pequeno atraso antes do redirecionamento para garantir que o estado foi atualizado
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao processar navegação pós-login:', error);
    } finally {
      isProcessingRedirect.current = false;
    }
  }, [navigate, location.pathname, toast, checkPasswordChangeRequirement]);

  // Inicialização do estado de autenticação
  useEffect(() => {
    console.log('Inicializando estado de autenticação:', { 
      isAuthInitialized: isAuthInitialized.current,
      path: location.pathname
    });
    
    if (isAuthInitialized.current) {
      console.log('Autenticação já inicializada, ignorando');
      return;
    }
    
    const initAuth = async () => {
      try {
        console.log('Inicializando autenticação');
        setIsLoading(true);
        isAuthInitialized.current = true;
        
        // Configurar listener de estado de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('Evento de autenticação recebido:', event, currentSession ? 'Com sessão' : 'Sem sessão');
          
          // Atualizar estado de sessão de forma síncrona
          setSession(currentSession);
          
          // Evento de login ou atualização de token - processar navegação
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (currentSession) {
              console.log(`Evento ${event}: atualizando sessão e verificando navegação`);
              
              // Verificar e processar navegação imediatamente
              setTimeout(() => {
                handlePostLoginNavigation(currentSession);
              }, 0);
            }
          } 
          // Evento de logout - redirecionar para login se necessário
          else if (event === 'SIGNED_OUT') {
            console.log('Usuário fez logout');
            setSession(null);
            
            if (!location.pathname.startsWith('/auth')) {
              console.log('Redirecionando para login após logout');
              navigate('/auth', { replace: true });
            }
          }
        });
        
        // Verificar sessão inicial
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Sessão inicial verificada:', initialSession ? 'Presente' : 'Nenhuma');
        
        // Atualizar estado com a sessão inicial
        setSession(initialSession);
        
        // Processar navegação baseada na sessão inicial
        if (initialSession) {
          console.log('Processando navegação com sessão inicial');
          setTimeout(() => {
            handlePostLoginNavigation(initialSession);
          }, 0);
        }
        
        setIsLoading(false);
        
        return () => {
          console.log('Limpando subscription de autenticação');
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [handlePostLoginNavigation, location.pathname]);

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
