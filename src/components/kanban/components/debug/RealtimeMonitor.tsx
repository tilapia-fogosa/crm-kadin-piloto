
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface RealtimeMonitorProps {
  enabled?: boolean;
}

/**
 * Componente de diagnóstico para monitorar eventos realtime
 * Só visível quando enabled=true
 */
export function RealtimeMonitor({ enabled = false }: RealtimeMonitorProps) {
  const [events, setEvents] = useState<{
    clients: number;
    activities: number;
    timestamp: string;
  }>({
    clients: 0,
    activities: 0,
    timestamp: '-',
  });

  useEffect(() => {
    if (!enabled) return;
    
    // Monkey patch console.log para capturar logs de realtime
    const originalLog = console.log;
    console.log = function(...args) {
      originalLog(...args);
      
      // Detectar eventos de subscription
      const message = args.join(' ');
      if (message.includes('Mudança de cliente detectada')) {
        setEvents(prev => ({
          ...prev,
          clients: prev.clients + 1,
          timestamp: new Date().toLocaleTimeString()
        }));
      } else if (message.includes('Mudança de atividade detectada')) {
        setEvents(prev => ({
          ...prev,
          activities: prev.activities + 1,
          timestamp: new Date().toLocaleTimeString()
        }));
      }
    };
    
    return () => {
      console.log = originalLog;
    };
  }, [enabled]);
  
  if (!enabled) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow-md border border-gray-300 text-xs z-50">
      <div className="font-semibold mb-1">Diagnóstico Realtime</div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span>Clients:</span>
          <Badge variant="outline">{events.clients}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span>Activities:</span>
          <Badge variant="outline">{events.activities}</Badge>
        </div>
        <div className="text-gray-500">
          Último: {events.timestamp}
        </div>
      </div>
    </div>
  );
}
