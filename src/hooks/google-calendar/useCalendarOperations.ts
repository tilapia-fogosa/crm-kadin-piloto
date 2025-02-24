
import { useCalendarSettings } from './useCalendarSettings';
import { useCalendarList } from './useCalendarList';
import { useCalendarActions } from './useCalendarActions';

export function useCalendarOperations() {
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

  return {
    settings,
    calendars,
    isLoading: isLoadingSettings || isLoadingCalendars,
    refetchSettings,
    refetchCalendars,
    syncCalendars,
    updateSelectedCalendars,
    setDefaultCalendar,
    disconnectCalendar
  };
}
