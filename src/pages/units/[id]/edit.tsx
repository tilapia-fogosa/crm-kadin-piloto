
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { UnitFormFields } from "@/components/units/unit-form-fields";
import { UnitFormData, unitFormSchema } from "@/types/unit-form";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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

export default function EditUnit() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<UnitFormData | null>(null);
  
  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: "",
      street: "",
      number: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      email: "",
    },
  });

  const { isLoading } = useQuery({
    queryKey: ["unit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar unidade",
          description: "Não foi possível carregar os dados da unidade.",
        });
        throw error;
      }

      if (data) {
        // Update form with unit data
        form.reset({
          name: data.name,
          street: data.street,
          number: data.number,
          city: data.city,
          state: data.state,
          postalCode: data.postal_code,
          phone: data.phone || "",
          email: data.email || "",
        });
      }

      return data;
    },
  });

  const handleSubmit = async (values: UnitFormData) => {
    setPendingValues(values);
    setShowConfirmDialog(true);
  };

  const confirmUpdate = async () => {
    if (!pendingValues) return;
    
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
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Unidade atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });

      navigate("/units");
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
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-8">Editar Unidade</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-2xl">
            <UnitFormFields form={form} />
            
            <div className="flex gap-4">
              <Button type="submit">
                Salvar Alterações
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/units")}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </div>

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
    </>
  );
}
