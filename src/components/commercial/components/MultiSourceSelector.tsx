
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SourceItem {
  id: string;
  name: string;
}

interface MultiSourceSelectorProps {
  selectedSourceIds: string[];
  onSourceChange: (sourceIds: string[]) => void;
  isLoading?: boolean;
}

export function MultiSourceSelector({ 
  selectedSourceIds, 
  onSourceChange,
  isLoading = false
}: MultiSourceSelectorProps) {
  // Estado local para seleções temporárias
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  // Buscar origens de leads
  const { data: sources, isLoading: isLoadingSources } = useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      console.log('Buscando origens de leads para MultiSourceSelector');
      const { data, error } = await supabase.from('lead_sources').select('*').order('name');
      if (error) throw error;
      return data as SourceItem[];
    }
  });
  
  // Sincroniza o estado temporário quando as props mudam
  useEffect(() => {
    setTempSelectedIds(selectedSourceIds);
  }, [selectedSourceIds, open]);
  
  // Verificações de segurança
  if (isLoading || isLoadingSources) {
    return (
      <Button variant="outline" disabled className="w-[180px] justify-start">
        Carregando origens...
      </Button>
    );
  }
  
  if (!sources || sources.length === 0) {
    return (
      <Button variant="outline" disabled className="w-[180px] justify-start">
        Nenhuma origem disponível
      </Button>
    );
  }
  
  // Verifica se todas as origens estão selecionadas
  const allSelected = tempSelectedIds.includes('todos') || 
                     (tempSelectedIds.length === sources.length && !tempSelectedIds.includes('todos'));
  
  // Gerencia a seleção de todas as origens
  const handleSelectAll = () => {
    if (allSelected) {
      setTempSelectedIds([]);
    } else {
      setTempSelectedIds(['todos']);
    }
  };
  
  // Gerencia a seleção individual de origens
  const handleSelectSource = (sourceId: string) => {
    // Se estamos selecionando uma origem individual e 'todos' está selecionado, remova 'todos'
    let newSelected = [...tempSelectedIds];
    if (sourceId !== 'todos' && newSelected.includes('todos')) {
      newSelected = newSelected.filter(id => id !== 'todos');
    }
    
    // Alternar a seleção da origem
    if (newSelected.includes(sourceId)) {
      newSelected = newSelected.filter(id => id !== sourceId);
    } else {
      newSelected.push(sourceId);
    }
    
    // Se todas as origens individuais estão selecionadas, selecione 'todos' em vez disso
    if (sourceId !== 'todos' && 
        sources.every(source => newSelected.includes(source.id)) && 
        !newSelected.includes('todos')) {
      newSelected = ['todos'];
    }
    
    setTempSelectedIds(newSelected);
  };
  
  // Função para aplicar as seleções
  const handleConfirm = () => {
    // Se nenhuma seleção, padrão para 'todos'
    if (tempSelectedIds.length === 0) {
      onSourceChange(['todos']);
    } else {
      onSourceChange(tempSelectedIds);
    }
    setOpen(false);
  };
  
  // Função para cancelar as alterações
  const handleCancel = () => {
    setTempSelectedIds(selectedSourceIds);
    setOpen(false);
  };
  
  // Texto que mostra no botão principal
  const getButtonText = () => {
    if (selectedSourceIds.includes('todos') || selectedSourceIds.length === 0) {
      return "Todas origens";
    }
    
    if (selectedSourceIds.length === 1) {
      if (selectedSourceIds[0] === 'todos') {
        return "Todas origens";
      }
      const selectedSource = sources.find(source => source.id === selectedSourceIds[0]);
      return selectedSource?.name || "Uma origem";
    }
    
    return `${selectedSourceIds.length} origens`;
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[180px] justify-start text-left font-normal"
        >
          <span className="truncate">{getButtonText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="p-2">
          <div className="space-y-2">
            <div className="border-b pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all-sources" 
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all-sources"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Selecionar todas
                </label>
              </div>
            </div>
            
            <div className="max-h-[200px] overflow-auto space-y-2 py-1">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`source-${source.id}`} 
                    checked={tempSelectedIds.includes(source.id) || tempSelectedIds.includes('todos')}
                    onCheckedChange={() => handleSelectSource(source.id)}
                  />
                  <label
                    htmlFor={`source-${source.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {source.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirm}
            >
              <Check className="h-4 w-4 mr-1" />
              Confirmar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
