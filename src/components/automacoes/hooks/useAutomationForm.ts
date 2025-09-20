import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

interface ActivityType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  created: number;
  active: number;
  dispatches: number;
}

interface AutomationFormData {
  firstTimeOnly: "yes" | "no";
  delayAmount: number;
  delayUnit: "minutes" | "hours" | "days";
  message: string;
}

interface UseAutomationFormProps {
  form: UseFormReturn<AutomationFormData>;
  activityType: ActivityType;
  onClose: () => void;
}

// Log: Hook para gerenciar formulário de automação
export function useAutomationForm({ form, activityType, onClose }: UseAutomationFormProps) {
  console.log('useAutomationForm: Inicializando hook para', activityType.name);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AutomationFormData) => {
    console.log('useAutomationForm: Submetendo dados', data);
    setIsSubmitting(true);

    try {
      // Simular delay de criação
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Log dos dados que seriam enviados para API
      console.log('useAutomationForm: Dados da automação criada', {
        activityType: activityType.id,
        activityName: activityType.name,
        firstTimeOnly: data.firstTimeOnly === "yes",
        delay: {
          amount: data.delayAmount,
          unit: data.delayUnit,
        },
        message: data.message,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Automação criada com sucesso!",
        description: `Nova automação para "${activityType.name}" foi configurada.`,
      });

      onClose();
    } catch (error) {
      console.error('useAutomationForm: Erro ao criar automação', error);
      toast({
        title: "Erro ao criar automação",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertDynamicField = (
    field: string, 
    currentMessage: string, 
    setValue: (name: "message", value: string) => void
  ) => {
    console.log('useAutomationForm: Inserindo campo dinâmico', field);
    
    // Inserir campo no final da mensagem por simplicidade
    // Em uma implementação real, poderia inserir na posição do cursor
    const newMessage = currentMessage ? `${currentMessage} ${field}` : field;
    setValue("message", newMessage);
    
    toast({
      title: "Campo inserido",
      description: `Campo ${field} adicionado à mensagem.`,
    });
  };

  return {
    handleSubmit,
    insertDynamicField,
    isSubmitting,
  };
}