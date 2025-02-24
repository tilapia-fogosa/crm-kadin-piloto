
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useCalendarActions() {
  const { toast } = useToast();

  const syncCalendars = async () => {
    try {
      console.log('Iniciando sincronização dos calendários');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session token available');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User ID not found');
      
      const { data: settings } = await supabase
        .from('user_calendar_settings')
        .select('selected_calendars, sync_token')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!settings) {
        throw new Error('Calendar settings not found');
      }

      const { data: response, error } = await supabase.functions.invoke('google-calendar-manage', {
        body: { 
          path: 'sync-events',
          calendars: settings?.selected_calendars || [],
          syncToken: settings?.sync_token
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error syncing calendars:', error);
        if (error.message.includes('token')) {
          toast({
            title: "Erro de autenticação",
            description: "Por favor, reconecte sua conta do Google Calendar",
            variant: "destructive"
          });
        }
        throw error;
      }

      await supabase
        .from('user_calendar_settings')
        .update({ 
          sync_token: response.nextSyncToken,
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      toast({
        title: "Sincronização concluída",
        description: "Calendários atualizados com sucesso!",
      });

      return response.events;
    } catch (error) {
      console.error('Erro ao sincronizar calendários:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os calendários",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateSelectedCalendars = async (calendarIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User ID not found');

      const { error } = await supabase
        .from('user_calendar_settings')
        .update({ 
          selected_calendars: calendarIds,
          sync_token: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Calendários atualizados",
        description: "Suas preferências foram salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar calendários:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar suas preferências",
        variant: "destructive"
      });
    }
  };

  const setDefaultCalendar = async (calendarId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User ID not found');

      const { error } = await supabase
        .from('user_calendar_settings')
        .update({ 
          default_calendar_id: calendarId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Calendário padrão atualizado",
        description: "Suas preferências foram salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao definir calendário padrão:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível definir o calendário padrão",
        variant: "destructive"
      });
    }
  };

  const disconnectCalendar = async () => {
    try {
      console.log('Iniciando processo de desconexão do Google Calendar');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session token available');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('User ID not found');

      // Mostrar toast de início do processo
      const disconnectToast = toast({
        title: "Desconectando conta...",
        description: "Isso pode levar alguns segundos",
      });

      // 1. Criar array de promessas para execução paralela
      const disconnectPromises = [
        // Revogar acesso no Google com timeout de 5 segundos
        Promise.race([
          supabase.functions.invoke('google-calendar-manage', {
            body: { path: 'revoke-access' },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]).catch(error => {
          console.log('Aviso: Falha ao revogar acesso no Google:', error);
          // Não falhar o processo por erro do Google
          return null;
        }),

        // Deletar eventos do calendário
        supabase
          .from('calendar_events')
          .delete()
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Erro ao deletar eventos:', error);
          }),

        // Deletar configurações do usuário
        supabase
          .from('user_calendar_settings')
          .delete()
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) {
              console.error('Erro ao deletar configurações:', error);
              throw error;
            }
          })
      ];

      // 2. Executar todas as operações em paralelo
      await Promise.all(disconnectPromises);

      // 3. Atualizar toast com sucesso
      toast({
        title: "Conta desconectada",
        description: "Sua conta do Google Calendar foi desconectada com sucesso",
      });

      // Limpar o toast de loading
      disconnectToast.dismiss();
    } catch (error) {
      console.error('Erro ao desconectar conta:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Os dados locais foram limpos, mas houve um erro ao desconectar do Google",
        variant: "destructive"
      });
    }
  };

  return {
    syncCalendars,
    updateSelectedCalendars,
    setDefaultCalendar,
    disconnectCalendar
  };
}
