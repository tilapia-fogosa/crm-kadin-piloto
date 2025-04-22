
import React from 'react';
import { UserUnit } from '@/components/kanban/hooks/useUserUnit';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MONTHS, YEARS } from '@/components/kanban/constants/dashboard.constants';
import { Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

/**
 * Interface para as props do componente PainelFilters
 */
interface PainelFiltersProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedUnitIds: string[];
  setSelectedUnitIds: (unitIds: string[]) => void;
  userUnits: UserUnit[];
  isLoading: boolean;
}

/**
 * Componente de filtros para o painel de atividades
 * 
 * Permite selecionar mês, ano e unidades
 */
export function PainelFilters({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedUnitIds,
  setSelectedUnitIds,
  userUnits,
  isLoading
}: PainelFiltersProps) {
  // Log para depuração
  console.log('[PAINEL FILTERS] Renderizado com:', {
    selectedMonth,
    selectedYear,
    selectedUnitIds,
    totalUnidades: userUnits.length
  });

  // Função para alternar uma unidade na seleção - Corrigindo o tipo retornado
  const toggleUnitSelection = (unitId: string) => {
    console.log('Toggling unit:', unitId);
    const newSelectedUnits = selectedUnitIds.includes(unitId)
      ? selectedUnitIds.filter(id => id !== unitId)
      : [...selectedUnitIds, unitId];
    
    // Corrigido: agora passamos diretamente um array de strings, não uma função
    setSelectedUnitIds(newSelectedUnits);
  };

  // Função para selecionar todas as unidades
  const selectAllUnits = () => {
    const allUnitIds = userUnits.map(unit => unit.unit_id);
    console.log('[PAINEL FILTERS] Selecionando todas unidades:', allUnitIds);
    setSelectedUnitIds(allUnitIds);
  };

  // Função para limpar a seleção de unidades
  const clearUnitSelection = () => {
    console.log('[PAINEL FILTERS] Limpando seleção de unidades');
    setSelectedUnitIds([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>
          Selecione o período e as unidades para visualizar as atividades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filtro de Mês */}
          <div className="w-full md:w-1/4">
            <label className="text-sm font-medium mb-2 block">
              Mês
            </label>
            <Select 
              value={selectedMonth} 
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Ano */}
          <div className="w-full md:w-1/4">
            <label className="text-sm font-medium mb-2 block">
              Ano
            </label>
            <Select 
              value={selectedYear} 
              onValueChange={setSelectedYear}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Unidades */}
          <div className="w-full md:w-1/2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium block">
                Unidades
              </label>
              <div className="flex gap-2 text-xs">
                <button 
                  onClick={selectAllUnits}
                  className="text-primary hover:underline"
                >
                  Selecionar todas
                </button>
                <span>|</span>
                <button 
                  onClick={clearUnitSelection}
                  className="text-primary hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Loading state para unidades */}
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Carregando unidades...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {userUnits.map(unit => (
                  <div key={unit.unit_id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`unit-${unit.unit_id}`}
                      checked={selectedUnitIds.includes(unit.unit_id)}
                      onCheckedChange={() => toggleUnitSelection(unit.unit_id)}
                    />
                    <label 
                      htmlFor={`unit-${unit.unit_id}`}
                      className="text-sm cursor-pointer"
                    >
                      {unit.units.name}
                    </label>
                  </div>
                ))}
                {userUnits.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2 p-2">
                    Nenhuma unidade encontrada
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
