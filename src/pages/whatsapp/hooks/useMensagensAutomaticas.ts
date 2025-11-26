/**
 * Hook para gerenciar mensagens automáticas do WhatsApp
 * 
 * Log: Hooks para buscar e atualizar mensagens automáticas
 * Etapas:
 * 1. useMensagensAutomaticas - buscar todas as mensagens do usuário
 * 2. useUpdateMensagemAutomatica - atualizar mensagem existente
 * 
 * Nota: Não há hooks de criar/deletar pois as mensagens são fixas
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Tipos
export interface MensagemAutomatica {
  id: string;
  profileId: string;
  tipo: 'boas_vindas' | 'valorizacao';
  mensagem: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mapear label amigável
export const getTipoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    'boas_vindas': 'Boas-vindas',
    'valorizacao': 'Valorização',
  };
  return labels[tipo] || tipo;
};

/**
 * Hook para buscar mensagens automáticas
 * Log: Busca as 2 mensagens automáticas do usuário logado
 */
export function useMensagensAutomaticas() {
  console.log('useMensagensAutomaticas: Iniciando busca de mensagens automáticas');

  return useQuery({
    queryKey: ['whatsapp-mensagens-automaticas'],
    queryFn: async () => {
      console.log('useMensagensAutomaticas: Buscando mensagens no Supabase');

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('useMensagensAutomaticas: Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('whatsapp_mensagens_automaticas')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('tipo', { ascending: true });

      if (error) {
        console.error('useMensagensAutomaticas: Erro ao buscar mensagens:', error);
        throw error;
      }

      console.log('useMensagensAutomaticas: Mensagens encontradas:', data?.length || 0);

      return (data || []).map((msg: any) => ({
        id: msg.id,
        profileId: msg.profile_id,
        tipo: msg.tipo,
        mensagem: msg.mensagem,
        ativo: msg.ativo,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
      })) as MensagemAutomatica[];
    },
  });
}

/**
 * Hook para atualizar mensagem automática
 * Log: Atualiza mensagem e mensagem de uma mensagem automática
 */
interface UpdateMensagemParams {
  id: string;
  mensagem?: string;
  ativo?: boolean;
}

export function useUpdateMensagemAutomatica() {
  console.log('useUpdateMensagemAutomatica: Hook de atualização inicializado');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, mensagem, ativo }: UpdateMensagemParams) => {
      console.log('useUpdateMensagemAutomatica: Atualizando mensagem:', { id, mensagem, ativo });

      const updateData: any = {};
      if (mensagem !== undefined) updateData.mensagem = mensagem;
      if (ativo !== undefined) updateData.ativo = ativo;

      const { error } = await supabase
        .from('whatsapp_mensagens_automaticas')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('useUpdateMensagemAutomatica: Erro ao atualizar:', error);
        throw error;
      }

      console.log('useUpdateMensagemAutomatica: Mensagem atualizada com sucesso');
    },
    onSuccess: () => {
      console.log('useUpdateMensagemAutomatica: Invalidando cache de mensagens');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-mensagens-automaticas'] });
      toast.success('Mensagem automática atualizada com sucesso');
    },
    onError: (error: any) => {
      console.error('useUpdateMensagemAutomatica: Erro na mutação:', error);
      toast.error('Erro ao atualizar mensagem automática');
    },
  });
}
