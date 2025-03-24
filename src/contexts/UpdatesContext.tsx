
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SystemUpdate, UpdateType, UpdatesContextType } from '@/types/updates';

// Tamanho da página para paginação
const PAGE_SIZE = 10;

// Criar o contexto
const UpdatesContext = createContext<UpdatesContextType | undefined>(undefined);

// Provider Component
export function UpdatesProvider({ children }: { children: React.ReactNode }) {
  console.log('Renderizando UpdatesProvider');
  
  const { session } = useAuth();
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUpdates, setTotalUpdates] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  
  // Calcular o total de páginas
  const totalPages = Math.ceil(totalUpdates / PAGE_SIZE);

  // Função para verificar se o tipo é válido
  const isValidUpdateType = (type: string): type is UpdateType => {
    return ['melhoria', 'implementacao', 'correcao'].includes(type);
  };

  // Função para buscar atualizações com paginação
  const fetchUpdates = async (page: number = 1, showDrafts: boolean = false) => {
    console.log('Buscando atualizações - página:', page, 'mostrar rascunhos:', showDrafts);
    
    if (!session?.user?.id) {
      console.log('Usuário não autenticado, retornando');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Se usuário é admin, vamos buscar também o contador de rascunhos
      if (isAdmin) {
        const { data: draftCountData, error: draftCountError } = await supabase
          .rpc('count_draft_updates');
          
        if (draftCountError) throw draftCountError;
        setDraftCount(draftCountData || 0);
        console.log('Número de rascunhos:', draftCountData);
      }
      
      // Preparar a query base
      let query = supabase
        .from('system_updates')
        .select('*', { count: 'exact' })
        .eq('active', true);
      
      // Filtrar por published se não for para mostrar rascunhos
      if (!showDrafts) {
        query = query.eq('published', true);
      }
      
      // Obter contagem total
      const { count, error: countError } = await query;
      
      if (countError) throw countError;
      setTotalUpdates(count || 0);
      
      // Calcular offset baseado na página atual
      const offset = (page - 1) * PAGE_SIZE;
      
      // Buscar atualizações com paginação
      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
        
      if (fetchError) throw fetchError;
      
      // Buscar status de leitura das atualizações para o usuário atual
      const { data: readData, error: readError } = await supabase
        .from('user_update_reads')
        .select('update_id')
        .eq('user_id', session.user.id);
        
      if (readError) throw readError;
      
      // Criar conjunto de IDs lidos para fácil verificação
      const readIds = new Set(readData?.map(item => item.update_id) || []);
      
      // Validar e converter os dados para o tipo SystemUpdate
      const updatesWithReadStatus: SystemUpdate[] = (data || []).map(update => {
        // Verificar se o tipo é válido, caso contrário usar fallback
        let updateType: UpdateType = 'melhoria'; // Valor padrão
        if (isValidUpdateType(update.type)) {
          updateType = update.type as UpdateType;
        } else {
          console.warn(`Tipo de atualização inválido: ${update.type}, usando fallback`);
        }
        
        return {
          ...update,
          type: updateType,
          read: readIds.has(update.id)
        };
      });
      
      setUpdates(updatesWithReadStatus);
      
      // Verificar se existem atualizações não lidas (apenas para publicadas)
      if (!showDrafts) {
        const unreadExists = updatesWithReadStatus.some(update => !update.read && update.published);
        setHasUnreadUpdates(unreadExists);
        console.log('Tem atualizações não lidas:', unreadExists);
      }
      
      console.log('Atualizações carregadas:', updatesWithReadStatus.length);
      
    } catch (err) {
      console.error('Erro ao buscar atualizações:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar atualizações'));
      
      toast({
        title: 'Erro ao carregar atualizações',
        description: 'Ocorreu um erro ao buscar as atualizações do sistema.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se há atualizações não lidas
  const checkUnreadUpdates = async () => {
    console.log('Verificando atualizações não lidas');
    
    if (!session?.user?.id) {
      console.log('Usuário não autenticado, retornando');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .rpc('has_unread_updates', { p_user_id: session.user.id });
        
      if (error) throw error;
      
      setHasUnreadUpdates(data || false);
      console.log('Status de atualizações não lidas:', data);
      
    } catch (err) {
      console.error('Erro ao verificar atualizações não lidas:', err);
    }
  };

  // Marcar uma atualização como lida
  const markAsRead = async (updateId: string) => {
    console.log('Marcando atualização como lida:', updateId);
    
    if (!session?.user?.id) {
      console.log('Usuário não autenticado, retornando');
      return;
    }
    
    try {
      const { error } = await supabase
        .rpc('mark_update_as_read', { p_update_id: updateId });
        
      if (error) throw error;
      
      // Atualizar o estado localmente
      setUpdates(prev => 
        prev.map(update => 
          update.id === updateId 
            ? { ...update, read: true } 
            : update
        )
      );
      
      // Verificar se ainda há atualizações não lidas
      const stillHasUnread = updates.some(update => 
        update.id !== updateId && !update.read && update.published
      );
      
      setHasUnreadUpdates(stillHasUnread);
      console.log('Atualização marcada como lida com sucesso');
      
    } catch (err) {
      console.error('Erro ao marcar atualização como lida:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar a atualização como lida.',
        variant: 'destructive',
      });
    }
  };

  // Marcar todas as atualizações como lidas
  const markAllAsRead = async () => {
    console.log('Marcando todas atualizações como lidas');
    
    if (!session?.user?.id) {
      console.log('Usuário não autenticado, retornando');
      return;
    }
    
    try {
      const { error } = await supabase
        .rpc('mark_all_updates_as_read');
        
      if (error) throw error;
      
      // Atualizar o estado localmente
      setUpdates(prev => 
        prev.map(update => ({ ...update, read: true }))
      );
      
      setHasUnreadUpdates(false);
      console.log('Todas atualizações marcadas como lidas com sucesso');
      
      toast({
        title: 'Sucesso',
        description: 'Todas as atualizações foram marcadas como lidas.',
      });
      
    } catch (err) {
      console.error('Erro ao marcar todas atualizações como lidas:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar todas as atualizações como lidas.',
        variant: 'destructive',
      });
    }
  };

  // Função para criar uma nova atualização
  const createUpdate = async (update: Omit<SystemUpdate, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'active' | 'published' | 'read'>) => {
    console.log('Criando nova atualização:', update);
    
    if (!session?.user?.id) {
      console.log('Usuário não autenticado, retornando');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('system_updates')
        .insert({
          ...update,
          created_by: session.user.id,
          published: false // Novas atualizações são criadas como rascunho
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Atualização criada com sucesso como rascunho!',
      });
      
      // Recarregar atualizações
      await fetchUpdates(currentPage, true);
      
    } catch (err) {
      console.error('Erro ao criar atualização:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a atualização.',
        variant: 'destructive',
      });
    }
  };

  // Função para atualizar uma atualização existente
  const updateUpdate = async (id: string, updateData: Partial<SystemUpdate>) => {
    console.log('Atualizando atualização:', id, updateData);
    
    if (!session?.user?.id) {
      console.log('Usuário não autenticado, retornando');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('system_updates')
        .update({
          ...updateData,
          // Não permitir atualizar estes campos diretamente
          created_by: undefined,
          created_at: undefined,
          updated_at: undefined,
          id: undefined,
          read: undefined
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Atualização modificada com sucesso!',
      });
      
      // Recarregar atualizações
      await fetchUpdates(currentPage, true);
      
    } catch (err) {
      console.error('Erro ao atualizar atualização:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a atualização.',
        variant: 'destructive',
      });
    }
  };

  // Função para publicar uma atualização
  const publishUpdate = async (id: string) => {
    console.log('Publicando atualização:', id);
    
    if (!session?.user?.id) {
      console.log('Usuário não autenticado, retornando');
      return;
    }
    
    try {
      const { error } = await supabase
        .rpc('publish_update', { p_update_id: id });
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Atualização publicada com sucesso!',
      });
      
      // Recarregar atualizações
      await fetchUpdates(currentPage, true);
      
    } catch (err) {
      console.error('Erro ao publicar atualização:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível publicar a atualização.',
        variant: 'destructive',
      });
    }
  };

  // Função para despublicar uma atualização
  const unpublishUpdate = async (id: string) => {
    console.log('Despublicando atualização:', id);
    
    if (!session?.user?.id) {
      console.log('Usuário não autenticado, retornando');
      return;
    }
    
    try {
      const { error } = await supabase
        .rpc('unpublish_update', { p_update_id: id });
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Atualização despublicada com sucesso!',
      });
      
      // Recarregar atualizações
      await fetchUpdates(currentPage, true);
      
    } catch (err) {
      console.error('Erro ao despublicar atualização:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível despublicar a atualização.',
        variant: 'destructive',
      });
    }
  };

  // Função para "excluir" uma atualização (desativar)
  const deleteUpdate = async (id: string) => {
    console.log('Desativando atualização:', id);
    
    if (!session?.user?.id) {
      console.log('Usuário não autenticado, retornando');
      return;
    }
    
    try {
      // Na verdade, apenas marcamos como inativa ao invés de excluir
      const { error } = await supabase
        .from('system_updates')
        .update({ active: false })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Atualização removida com sucesso!',
      });
      
      // Recarregar atualizações
      await fetchUpdates(currentPage, true);
      
    } catch (err) {
      console.error('Erro ao desativar atualização:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a atualização.',
        variant: 'destructive',
      });
    }
  };

  // Função para mudar de página
  const goToPage = (page: number) => {
    console.log('Navegando para página:', page);
    setCurrentPage(page);
  };

  // Efeito para carregar atualizações inicialmente e quando a página mudar
  useEffect(() => {
    if (session?.user?.id) {
      // Se o usuário for admin, buscar também os rascunhos
      fetchUpdates(currentPage, isAdmin);
    }
  }, [session?.user?.id, currentPage, isAdmin]);
  
  // Verificar atualizações não lidas periodicamente e após login
  useEffect(() => {
    if (session?.user?.id) {
      checkUnreadUpdates();
      
      // Verificar a cada 5 minutos
      const interval = setInterval(checkUnreadUpdates, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  // Verificar se o usuário é admin para fornecer funcionalidades adicionais
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('unit_users')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('active', true)
          .eq('role', 'admin')
          .limit(1);
          
        if (error) throw error;
        
        setIsAdmin(data && data.length > 0);
        console.log('Status de admin:', data && data.length > 0);
        
      } catch (err) {
        console.error('Erro ao verificar status de admin:', err);
      }
    };
    
    checkAdminStatus();
  }, [session?.user?.id]);

  // Construir o valor do contexto
  const contextValue: UpdatesContextType = {
    updates,
    hasUnreadUpdates,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshUpdates: () => fetchUpdates(currentPage, isAdmin),
    pagination: {
      currentPage,
      totalPages,
      goToPage
    },
    // Incluir funções de admin apenas se o usuário for admin
    ...(isAdmin && {
      createUpdate,
      updateUpdate,
      deleteUpdate,
      publishUpdate,
      unpublishUpdate,
      draftCount
    })
  };

  return (
    <UpdatesContext.Provider value={contextValue}>
      {children}
    </UpdatesContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useUpdates() {
  const context = useContext(UpdatesContext);
  
  if (context === undefined) {
    throw new Error('useUpdates deve ser usado dentro de um UpdatesProvider');
  }
  
  return context;
}
