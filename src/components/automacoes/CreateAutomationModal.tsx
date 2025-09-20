import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AutomationForm } from "./AutomationForm";

interface ActivityType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  created: number;
  active: number;
  dispatches: number;
}

interface CreateAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityType: ActivityType;
}

// Log: Modal de criação de automação
export function CreateAutomationModal({ 
  open, 
  onOpenChange, 
  activityType 
}: CreateAutomationModalProps) {
  console.log('CreateAutomationModal: Renderizando modal para tipo', activityType.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <activityType.icon className="w-5 h-5 text-primary" />
            Criar Automação - {activityType.name}
          </DialogTitle>
          <DialogDescription>
            Configure uma nova automação para este tipo de atividade.
          </DialogDescription>
        </DialogHeader>
        
        <AutomationForm 
          activityType={activityType}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}