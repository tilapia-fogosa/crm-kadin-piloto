import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { UnitFormFields } from "@/components/units/unit-form-fields";
import { UnitFormData, unitFormSchema } from "@/types/unit-form";
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

interface UnitsTableProps {
  units: any[];
  isLoading: boolean;
}

export function UnitsTable({ units, isLoading }: UnitsTableProps) {
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<any | null>(null);
  const [pendingValues, setPendingValues] = useState<UnitFormData | null>(null);
  const { toast } = useToast();

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
  });

  const handleEdit = (unit: any) => {
    setEditingUnit(unit);
    form.reset({
      name: unit.name,
      street: unit.street,
      number: unit.number,
      city: unit.city,
      state: unit.state,
      postalCode: unit.postal_code,
      phone: unit.phone || "",
      email: unit.email || "",
    });
    setShowEditDialog(true);
  };

  const handleDelete = (unit: any) => {
    setUnitToDelete(unit);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;

    try {
      const { error } = await supabase
        .from("units")
        .update({ active: false })
        .eq("id", unitToDelete.id);

      if (error) throw error;

      toast({
        title: "Unidade inativada com sucesso!",
        description: "A unidade foi inativada do sistema.",
      });

      // Reload the page to refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error deactivating unit:", error);
      toast({
        variant: "destructive",
        title: "Erro ao inativar unidade",
        description: "Ocorreu um erro ao inativar a unidade. Tente novamente.",
      });
    } finally {
      setShowDeleteDialog(false);
      setUnitToDelete(null);
    }
  };

  const handleSubmit = async (values: UnitFormData) => {
    setPendingValues(values);
    setShowConfirmDialog(true);
  };

  const confirmUpdate = async () => {
    if (!pendingValues || !editingUnit) return;

    try {
      const { error } = await supabase
        .from("units")
        .update({
          name: pendingValues.name,
          street: pendingValues.street,
          number: pendingValues.number,
          city: pendingValues.city,
          state: pendingValues.state,
          postal_code: pendingValues.postalCode,
          phone: pendingValues.phone,
          email: pendingValues.email,
        })
        .eq("id", editingUnit.id);

      if (error) throw error;

      toast({
        title: "Unidade atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });

      // Reload the page to refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error updating unit:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar unidade",
        description: "Ocorreu um erro ao atualizar a unidade. Tente novamente.",
      });
    } finally {
      setShowConfirmDialog(false);
      setPendingValues(null);
      setShowEditDialog(false);
      setEditingUnit(null);
    }
  };

  if (isLoading) {
    return <div>Carregando unidades...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>{unit.name}</TableCell>
                <TableCell>{unit.city}</TableCell>
                <TableCell>{unit.state}</TableCell>
                <TableCell>{unit.phone}</TableCell>
                <TableCell>{unit.email}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(unit)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(unit)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Unidade</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <UnitFormFields form={form} />
              <div className="flex justify-end gap-4">
                <Button type="submit">
                  Salvar Alterações
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar atualização</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja mesmo atualizar a unidade {pendingValues?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpdate}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar inativação</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja mesmo inativar a unidade {unitToDelete?.name}? Esta ação não poderá ser desfeita diretamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Inativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
