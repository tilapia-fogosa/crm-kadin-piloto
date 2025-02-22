
import { Button } from "@/components/ui/button";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Calendar, Loader2 } from "lucide-react";

export function GoogleCalendarConnect() {
  const { isConnecting, startGoogleAuth } = useGoogleCalendar();

  return (
    <Button 
      variant="outline" 
      className="gap-2" 
      onClick={startGoogleAuth}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4" />
          Conectar Google Calendar
        </>
      )}
    </Button>
  );
}
