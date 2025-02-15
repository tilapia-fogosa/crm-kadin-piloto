
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SystemUserWithUnits } from "@/types/system-user";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SystemUserForm } from "./system-user-form";

interface SystemUserActionsProps {
  user: SystemUserWithUnits;
}

export function SystemUserActions({ user }: SystemUserActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    // Força um pequeno delay para garantir que o overlay seja removido
    setTimeout(() => {
      document.body.style.pointerEvents = 'auto';
    }, 100);
  };

  const handleEdit = async (data: SystemUserWithUnits) => {
    try {
      // Primeiro atualizamos os dados básicos do usuário
      const { error: userError } = await supabase
        .from("system_users")
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
        })
        .eq("id", user.id);

      if (userError) throw userError;

      // Desativa as unidades que não estão mais presentes
      const newUnitIds = data.units.map(u => u.unit_id);
      const { error: deactivateError } = await supabase
        .from("system_user_units")
        .update({ active: false })
        .eq("user_id", user.id)
        .not("unit_id", "in", `(${newUnitIds.join(",")})`);

      if (deactivateError) throw deactivateError;

      // Para cada unidade no formulário
      for (const unit of data.units) {
        // Verifica se já existe um vínculo
        const { data: existingUnit, error: checkError } = await supabase
          .from("system_user_units")
          .select()
          .eq("user_id", user.id)
          .eq("unit_id", unit.unit_id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingUnit) {
          // Atualiza o vínculo existente
          const { error: updateError } = await supabase
            .from("system_user_units")
            .update({
              role: unit.role,
              active: true
            })
            .eq("id", existingUnit.id);

          if (updateError) throw updateError;
        } else {
          // Cria um novo vínculo
          const { error: insertError } = await supabase
            .from("system_user_units")
            .insert({
              user_id: user.id,
              unit_id: unit.unit_id,
              role: unit.role,
              active: true
            });

          if (insertError) throw insertError;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["system-users"] });

      toast({
        title: "Usuário atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });

      handleCloseEditDialog();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro ao atualizar o usuário. Tente novamente.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("system_users")
        .update({ active: false })
        .eq("id", user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["system-users"] });

      toast({
        title: "Usuário inativado com sucesso!",
        description: "O usuário foi inativado do sistema.",
      });

      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao inativar usuário",
        description: "Ocorreu um erro ao inativar o usuário. Tente novamente.",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showEditDialog && (
        <Dialog open={showEditDialog} onOpenChange={handleCloseEditDialog}>
          <DialogContent className="max-w-3xl z-50" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <SystemUserForm user={user} onSubmit={handleEdit} />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="z-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário {user.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
