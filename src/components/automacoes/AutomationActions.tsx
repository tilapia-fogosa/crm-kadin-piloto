import { Button } from "@/components/ui/button";
import { Plus, Settings, Copy } from "lucide-react";

interface AutomationActionsProps {
  onCreateNew: () => void;
  onManageExisting: () => void;
  onDuplicate?: () => void;
  hasAutomations: boolean;
}

// Log: Botões de ação para automações
export function AutomationActions({ 
  onCreateNew, 
  onManageExisting, 
  onDuplicate,
  hasAutomations 
}: AutomationActionsProps) {
  console.log('AutomationActions: Renderizando ações', { hasAutomations });

  return (
    <div className="flex flex-col gap-2 pt-4 border-t">
      <Button 
        onClick={onCreateNew}
        variant="default"
        size="sm"
        className="justify-start"
      >
        <Plus className="w-4 h-4 mr-2" />
        Criar Nova Automação
      </Button>
      
      {hasAutomations && (
        <div className="flex gap-2">
          <Button 
            onClick={onManageExisting}
            variant="outline"
            size="sm"
            className="flex-1 justify-start"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar
          </Button>
          
          {onDuplicate && (
            <Button 
              onClick={onDuplicate}
              variant="ghost"
              size="sm"
              className="justify-start"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}