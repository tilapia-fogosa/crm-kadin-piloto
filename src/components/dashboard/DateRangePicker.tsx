
import React, { useState } from 'react';
import { Calendar, CalendarRange } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { DateRangeType } from "@/hooks/useLeadFunnelStats";

interface DateRangePickerProps {
  dateRange: DateRangeType;
  onDateRangeChange: (type: DateRangeType, range?: DateRange | undefined) => void;
  customRange: DateRange | undefined;
}

export function DateRangePicker({ 
  dateRange, 
  onDateRangeChange,
  customRange
}: DateRangePickerProps) {
  console.log('Renderizando DateRangePicker:', { dateRange, customRange });
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Preparar labels para exibição
  const getDateRangeLabel = () => {
    if (dateRange === 'custom' && customRange?.from) {
      const fromDate = format(customRange.from, 'dd/MM/yyyy', { locale: ptBR });
      const toDate = customRange.to 
        ? format(customRange.to, 'dd/MM/yyyy', { locale: ptBR })
        : format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
      return `${fromDate} - ${toDate}`;
    } else if (dateRange === 'quarter') {
      return 'Últimos 3 meses';
    } else {
      return 'Último mês';
    }
  };
  
  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-2">
        <Button 
          variant={dateRange === 'month' ? 'default' : 'outline'}
          size="sm" 
          onClick={() => onDateRangeChange('month')}
        >
          Mês
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
              <Calendar className="h-4 w-4 mr-2" />
              {dateRange === 'custom' ? getDateRangeLabel() : 'Personalizado'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={subMonths(new Date(), 1)}
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
        {dateRange !== 'custom' ? 'Selecione um período' : getDateRangeLabel()}
      </div>
    </div>
  );
}
