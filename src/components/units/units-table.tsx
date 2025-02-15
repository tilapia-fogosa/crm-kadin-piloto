
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UnitFormData, unitFormSchema } from "@/types/unit-form";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UnitActions } from "./unit-actions";
import { EditUnitDialog } from "./edit-unit-dialog";
import { ConfirmationDialogs } from "./confirmation-dialogs";

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
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
  });

  const handleEdit = (unit: any) => {
    setEditingUnit(unit);
    form.reset({
      name: unit.name,
      street: unit.street,
      number: unit.number,
      neighborhood: unit.neighborhood,
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
    if (!unitToDelete || !session?.user) return;

    try {
      const { error } = await supabase
        .from("units")
        .update({ active: false })
        .eq("id", unitToDelete.id);

      if (error) throw error;

      // Invalidar o cache para forçar uma nova busca
      await queryClient.invalidateQueries({ queryKey: ["units"] });

      toast({
        title: "Unidade inativada com sucesso!",
        description: "A unidade foi inativada do sistema.",
      });
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
          neighborhood: pendingValues.neighborhood,
          city: pendingValues.city,
          state: pendingValues.state,
          postal_code: pendingValues.postalCode,
          phone: pendingValues.phone,
          email: pendingValues.email,
        })
        .eq("id", editingUnit.id);

      if (error) throw error;

      // Invalidar o cache para forçar uma nova busca
      await queryClient.invalidateQueries({ queryKey: ["units"] });

      toast({
        title: "Unidade atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
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
                  <UnitActions
                    unit={unit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditUnitDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        form={form}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialogs
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        pendingValues={pendingValues}
        unitToDelete={unitToDelete}
        onConfirmUpdate={confirmUpdate}
        onConfirmDelete={confirmDelete}
      />
    </>
  );
}
