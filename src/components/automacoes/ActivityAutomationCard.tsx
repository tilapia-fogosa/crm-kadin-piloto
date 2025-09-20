import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { AutomationMetrics } from "./AutomationMetrics";
import { AutomationActions } from "./AutomationActions";
import { CreateAutomationModal } from "./CreateAutomationModal";
import { cn } from "@/lib/utils";

export interface ActivityType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  created: number;
  active: number;
  dispatches: number;
}

interface ActivityAutomationCardProps {
  activity: ActivityType;
}

// Log: Card individual de automação por tipo de atividade
export function ActivityAutomationCard({ activity }: ActivityAutomationCardProps) {
  console.log('ActivityAutomationCard: Renderizando card', { activityId: activity.id });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateNew = () => {
    console.log('ActivityAutomationCard: Criar nova automação', { activityId: activity.id });
    setIsModalOpen(true);
  };

  const handleManageExisting = () => {
    console.log('ActivityAutomationCard: Gerenciar automações existentes', { activityId: activity.id });
    // TODO: Implementar gerenciamento
  };

  const handleDuplicate = () => {
    console.log('ActivityAutomationCard: Duplicar automação', { activityId: activity.id });
    // TODO: Implementar duplicação
  };

  const hasAutomations = activity.created > 0;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <activity.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{activity.name}</h3>
                </div>
              </div>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
            <div className="mt-4">
              <AutomationMetrics 
                created={activity.created}
                active={activity.active}
                dispatches={activity.dispatches}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {hasAutomations ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>Lista de automações configuradas aparecerá aqui.</p>
                  <p className="mt-1">Em desenvolvimento...</p>
                </div>
                <AutomationActions
                  onCreateNew={handleCreateNew}
                  onManageExisting={handleManageExisting}
                  onDuplicate={handleDuplicate}
                  hasAutomations={hasAutomations}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <activity.icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-1">Nenhuma automação criada</h4>
                  <p className="text-sm text-muted-foreground">
                    Crie sua primeira automação para {activity.name.toLowerCase()}
                  </p>
                </div>
                <AutomationActions
                  onCreateNew={handleCreateNew}
                  onManageExisting={handleManageExisting}
                  hasAutomations={hasAutomations}
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Modal de criação de automação */}
      <CreateAutomationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        activityType={activity}
      />
    </Card>
  );
}