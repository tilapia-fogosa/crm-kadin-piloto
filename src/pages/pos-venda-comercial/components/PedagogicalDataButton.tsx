/**
 * LOG: Botão com indicador de completude para dados pedagógicos
 * Similar ao CommercialDataButton
 */
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PedagogicalDataButtonProps {
  activityId: string;
  onOpenModal: () => void;
}

export function PedagogicalDataButton({ activityId, onOpenModal }: PedagogicalDataButtonProps) {
  console.log('LOG: Renderizando PedagogicalDataButton para:', activityId);

  const { data: isComplete, isLoading } = useQuery({
    queryKey: ['pedagogical-data-complete', activityId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_pedagogical_data_complete', {
        p_activity_id: activityId
      });

      if (error) throw error;
      return data || false;
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onOpenModal}
      className="gap-1 px-2 py-1"
    >
      <GraduationCap className="h-4 w-4" />
      {isLoading ? (
        <div className="h-4 w-4 animate-pulse bg-muted rounded-full" />
      ) : isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
    </Button>
  );
}
