
import { Button } from "@/components/ui/button"
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar"
import { Loader2 } from "lucide-react"

export function GoogleCalendarConnect() {
  const { calendarSettings, isConnecting, startGoogleAuth } = useGoogleCalendar()

  if (calendarSettings?.sync_enabled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <span className="w-2 h-2 bg-green-600 rounded-full" />
        Conectado ao Google Calendar
      </div>
    )
  }

  return (
    <Button 
      variant="outline" 
      onClick={startGoogleAuth}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Conectando...
        </>
      ) : (
        'Conectar Google Calendar'
      )}
    </Button>
  )
}
