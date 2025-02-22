
import { Button } from "@/components/ui/button";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Calendar } from "lucide-react";

export function GoogleCalendarConnect() {
  const { isConnecting, startGoogleAuth } = useGoogleCalendar();

  return (
    <Button 
      variant="outline" 
      className="gap-2" 
      onClick={startGoogleAuth}
      disabled={isConnecting}
    >
      <Calendar className="h-4 w-4" />
      {isConnecting ? "Conectando..." : "Conectar Google Calendar"}
    </Button>
  );
}
