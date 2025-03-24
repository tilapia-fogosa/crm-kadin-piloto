
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdates } from '@/contexts/UpdatesContext';

// Componente que mostra um botão de atualizações com indicador de não lidas
export function UpdatesButton({ 
  currentPath 
}: { 
  currentPath: string 
}) {
  console.log('Renderizando UpdatesButton, path atual:', currentPath);
  
  const { hasUnreadUpdates } = useUpdates();
  const [pulse, setPulse] = useState(false);
  
  // Adicionar efeito de pulsar quando há atualizações não lidas
  useEffect(() => {
    if (hasUnreadUpdates) {
      setPulse(true);
      // Desativar o efeito de pulsar após 10 segundos
      const timer = setTimeout(() => setPulse(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [hasUnreadUpdates]);
  
  return (
    <Button
      variant={currentPath === '/updates' ? 'secondary' : 'ghost'}
      className={cn(
        "w-full justify-start text-white",
        "hover:bg-[#FF6B00] hover:text-white transition-colors duration-200",
        currentPath === '/updates' && "bg-white/20 text-white hover:bg-[#FF6B00]",
        hasUnreadUpdates && "font-bold"
      )}
      asChild
    >
      <Link to="/updates">
        <div className="relative">
          <Bell className="mr-2 h-5 w-5" />
          {/* Indicador de notificação não lida */}
          {hasUnreadUpdates && (
            <span 
              className={cn(
                "absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500",
                pulse && "animate-ping"
              )}
              aria-hidden="true"
            />
          )}
        </div>
        Melhorias e Novidades
        {hasUnreadUpdates && (
          <span className="ml-auto bg-red-500 text-white text-xs font-medium rounded-full px-1.5 py-0.5">
            Novo
          </span>
        )}
      </Link>
    </Button>
  );
}
