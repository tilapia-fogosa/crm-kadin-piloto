
import { Calendar } from "@/hooks/useGoogleCalendar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface CalendarFiltersProps {
  calendars: Calendar[]
  activeFilters: {
    source: ('system' | 'google')[]
    calendars: string[]
  }
  onFilterChange: (filters: {
    source: ('system' | 'google')[]
    calendars: string[]
  }) => void
}

export function CalendarFilters({
  calendars,
  activeFilters,
  onFilterChange
}: CalendarFiltersProps) {
  const toggleSource = (source: 'system' | 'google') => {
    const newSources = activeFilters.source.includes(source)
      ? activeFilters.source.filter(s => s !== source)
      : [...activeFilters.source, source]
    
    onFilterChange({
      ...activeFilters,
      source: newSources
    })
  }

  const toggleCalendar = (calendarId: string) => {
    const newCalendars = activeFilters.calendars.includes(calendarId)
      ? activeFilters.calendars.filter(id => id !== calendarId)
      : [...activeFilters.calendars, calendarId]
    
    onFilterChange({
      ...activeFilters,
      calendars: newCalendars
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="system"
            checked={activeFilters.source.includes('system')}
            onCheckedChange={() => toggleSource('system')}
          />
          <Label htmlFor="system">Sistema</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="google"
            checked={activeFilters.source.includes('google')}
            onCheckedChange={() => toggleSource('google')}
          />
          <Label htmlFor="google">Google Calendar</Label>
        </div>
      </div>

      {calendars.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            {calendars.map(calendar => (
              <div key={calendar.id} className="flex items-center space-x-2">
                <Switch
                  id={calendar.id}
                  checked={activeFilters.calendars.includes(calendar.id)}
                  onCheckedChange={() => toggleCalendar(calendar.id)}
                />
                <Label htmlFor={calendar.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: calendar.backgroundColor }}
                  />
                  {calendar.summary}
                </Label>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
