
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UnitActionsProps {
  unit: any;
  onEdit: () => void;
}

export function UnitActions({ unit, onEdit }: UnitActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('units')
        .update({ active: false })
        .eq('id', unit.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['units'] });
      
      toast({
        title: "Unidade removida",
        description: "A unidade foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover unidade:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar remover a unidade.",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(`/regions/units/${unit.id}/users`)}
      >
        <Users className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
