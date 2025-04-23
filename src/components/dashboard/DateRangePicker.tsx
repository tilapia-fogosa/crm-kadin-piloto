
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { DateRangeType } from "@/hooks/useLeadFunnelStats";

interface DateRangePickerProps {
  dateRange: DateRangeType;
  onDateRangeChange: (type: DateRangeType, range?: DateRange) => void;
  customRange: DateRange;
}

export function DateRangePicker({ 
  dateRange, 
  onDateRangeChange,
  customRange
}: DateRangePickerProps) {
  console.log('Renderizando DateRangePicker:', { dateRange, customRange });
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Efeito para garantir que o customRange esteja sempre definido quando necessário
  useEffect(() => {
    if (dateRange === 'custom' && (!customRange.from)) {
      // Definir intervalo padrão para o último mês se customRange não estiver definido
      onDateRangeChange('custom', {
        from: subMonths(new Date(), 1),
        to: new Date()
      });
    }
  }, [dateRange, customRange, onDateRangeChange]);
  
  // Preparar labels para exibição
  const getDateRangeLabel = () => {
    if (dateRange === 'custom' && customRange.from) {
      const fromDate = format(customRange.from, 'dd/MM/yyyy', { locale: ptBR });
      const toDate = customRange.to 
        ? format(customRange.to, 'dd/MM/yyyy', { locale: ptBR })
        : format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
      return `${fromDate} - ${toDate}`;
    } else if (dateRange === 'quarter') {
      return 'Últimos 3 meses';
    } else if (dateRange === 'current-month') {
      return 'Mês atual';
    } else {
      return 'Mês anterior';
    }
  };
  
  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-2">
        <Button 
          variant={dateRange === 'current-month' ? 'default' : 'outline'}
          size="sm" 
          onClick={() => onDateRangeChange('current-month')}
        >
          Mês Atual
        </Button>
        <Button 
          variant={dateRange === 'previous-month' ? 'default' : 'outline'}
          size="sm" 
          onClick={() => onDateRangeChange('previous-month')}
        >
          Mês Anterior
        </Button>
        <Button 
          variant={dateRange === 'quarter' ? 'default' : 'outline'}
          size="sm" 
          onClick={() => onDateRangeChange('quarter')}
        >
          3 Meses
        </Button>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant={dateRange === 'custom' ? 'default' : 'outline'}
              size="sm" 
              className="ml-auto"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {dateRange === 'custom' ? getDateRangeLabel() : 'Personalizado'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={customRange.from || subMonths(new Date(), 1)}
              selected={customRange}
              onSelect={(range) => {
                if (range) {
                  onDateRangeChange('custom', range);
                  if (range.from && range.to) {
                    setIsCalendarOpen(false);
                  }
                }
              }}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-xs text-muted-foreground">
        {getDateRangeLabel()}
      </div>
    </div>
  );
}
