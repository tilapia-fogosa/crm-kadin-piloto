
import { useCalendarSettings } from './useCalendarSettings';
import { useCalendarList } from './useCalendarList';
import { useCalendarActions } from './useCalendarActions';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useCalendarOperations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { 
    data: settings, 
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useCalendarSettings();

  const { 
    data: calendars, 
    isLoading: isLoadingCalendars,
    refetch: refetchCalendars
  } = useCalendarList(settings);

  const {
    syncCalendars,
    updateSelectedCalendars,
    setDefaultCalendar,
    disconnectCalendar
  } = useCalendarActions();

  const handleSyncCalendars = async () => {
    try {
      await syncCalendars();
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "Sincronização concluída",
        description: "Calendários atualizados com sucesso!"
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os calendários",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSelectedCalendars = async (calendarIds: string[]) => {
    try {
      await updateSelectedCalendars(calendarIds);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['calendar-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      ]);
      toast({
        title: "Calendários atualizados",
        description: "Suas preferências foram salvas com sucesso!"
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

  const handleSetDefaultCalendar = async (calendarId: string) => {
    try {
      await setDefaultCalendar(calendarId);
      await queryClient.invalidateQueries({ queryKey: ['calendar-settings'] });
      toast({
        title: "Calendário padrão atualizado",
        description: "Suas preferências foram salvas com sucesso!"
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

  const handleDisconnectCalendar = async () => {
    try {
      await disconnectCalendar();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['calendar-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      ]);
      toast({
        title: "Conta desconectada",
        description: "Sua conta do Google Calendar foi desconectada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao desconectar conta:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar sua conta",
        variant: "destructive"
      });
    }
  };

  return {
    settings,
    calendars,
    isLoading: isLoadingSettings || isLoadingCalendars,
    refetchSettings,
    refetchCalendars,
    syncCalendars: handleSyncCalendars,
    updateSelectedCalendars: handleUpdateSelectedCalendars,
    setDefaultCalendar: handleSetDefaultCalendar,
    disconnectCalendar: handleDisconnectCalendar
  };
}
