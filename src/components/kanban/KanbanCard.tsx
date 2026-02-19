
import React, { useCallback, memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { KanbanCard as KanbanCardType } from "./types";
import { format, parseISO, isBefore, isAfter, startOfDay, isToday } from "date-fns";
import { WhatsAppIcon } from "./components/icons/WhatsAppIcon";
import { ValorizationButtons } from './components/ValorizationButtons';

/**
 * Determina a cor do próximo contato com base na data:
 * - Verde: data futura (após hoje)
 * - Amarelo: hoje, mas ainda não passou o horário
 * - Vermelho: atrasado (antes de agora)
 */
const getNextContactColor = (nextContactDate: Date | null): string => {
  if (!nextContactDate) return "text-muted-foreground";
  
  const now = new Date();
  const today = startOfDay(new Date());
  const contactDay = startOfDay(nextContactDate);

  // Data futura → verde
  if (isAfter(contactDay, today)) {
    return "text-[#00CC00]";
  }

  // Hoje → amarelo se ainda não passou, vermelho se já passou
  if (isToday(nextContactDate)) {
    if (isBefore(nextContactDate, now)) {
      return "text-[#FF3333]";
    }
    return "text-[#CCA405]";
  }

  // Passado → vermelho
  return "text-[#FF3333]";
}

/**
 * KanbanCardComponent - Card compacto do Kanban
 * 
 * Layout vertical em coluna única exibindo:
 * 1. Nome do cliente
 * 2. Próximo contato (com cores indicativas)
 * 3. Botões de valorização (quando há agendamento)
 * 4. Ícone do WhatsApp
 */
function KanbanCardComponent({
  card,
  onClick,
  onWhatsAppClick,
  onOpenSchedulingForm
}: {
  card: KanbanCardType;
  onClick: () => void;
  onWhatsAppClick: (e: React.MouseEvent) => void;
  onOpenSchedulingForm?: () => void;
}) {
  const nextContactDate = card.nextContactDate ? parseISO(card.nextContactDate) : null;
  const nextContactColor = getNextContactColor(nextContactDate);
  
  console.log(`[KanbanCard] Card ${card.id} - scheduledDate: ${card.scheduledDate}, valorizationConfirmed: ${card.valorizationConfirmed}`);

  /** Callback para atualizar estado de valorização no card */
  const handleValorizationChange = useCallback((confirmed: boolean) => {
    console.log(`[KanbanCard] Valorização mudou para: ${confirmed}`);
    card.valorizationConfirmed = confirmed;
  }, [card]);

  return (
    <Card 
      className="group cursor-pointer bg-card hover:bg-accent/10 transition-colors duration-200 rounded-xl border border-border"
      onClick={onClick}
    >
      <CardContent className="p-2 flex flex-col gap-1.5">
        {/* Sub-quadro 1: Nome do cliente */}
        <div className="rounded-lg border border-border bg-muted/40 px-2 py-1.5">
          <span className="text-sm font-semibold text-foreground truncate block">
            {card.clientName}
          </span>
        </div>

        {/* Sub-quadro 2: Próximo contato */}
        <div className="rounded-md border border-border bg-muted/40 px-2 py-1">
          {nextContactDate ? (
            <div className={`flex items-center gap-1 text-xs ${nextContactColor} font-medium`}>
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{format(nextContactDate, 'dd-MM-yy HH:mm')}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Sem contato agendado</span>
          )}
        </div>

        {/* Sub-quadro 3: Valorização + WhatsApp */}
        <div className="rounded-lg border border-border bg-muted/40 px-2 py-1.5 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <ValorizationButtons 
            clientId={card.id}
            clientName={card.clientName}
            scheduledDate={card.scheduledDate}
            valorizationConfirmed={card.valorizationConfirmed || false}
            onValorizationChange={handleValorizationChange}
            onOpenSchedulingForm={onOpenSchedulingForm}
          />
          <WhatsAppIcon 
            className="h-4 w-4 text-[hsl(142,71%,45%)] cursor-pointer flex-shrink-0" 
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onWhatsAppClick(e);
            }} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Memoização do KanbanCard
 * Compara apenas campos que afetam a renderização visual do card compacto
 */
export const KanbanCard = memo(KanbanCardComponent, (prevProps, nextProps) => {
  const prevCard = prevProps.card;
  const nextCard = nextProps.card;
  
  // Comparação via timestamp (mais eficiente)
  if (prevCard.lastUpdated && nextCard.lastUpdated) {
    return prevCard.lastUpdated === nextCard.lastUpdated;
  }
  
  // Fallback: comparação dos campos exibidos
  return (
    prevCard.id === nextCard.id &&
    prevCard.clientName === nextCard.clientName &&
    prevCard.nextContactDate === nextCard.nextContactDate &&
    prevCard.scheduledDate === nextCard.scheduledDate &&
    prevCard.valorizationConfirmed === nextCard.valorizationConfirmed
  );
});
