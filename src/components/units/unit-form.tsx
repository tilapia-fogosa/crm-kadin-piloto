
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BasicInfoSection } from "./form-sections/basic-info-section";
import { FeesSection } from "./form-sections/fees-section";
import { ContactSection } from "./form-sections/contact-section";
import { AddressSection } from "./form-sections/address-section";
import { unitFormSchema, type UnitFormData } from "./form-validation";
import { useToast } from "@/hooks/use-toast";

interface UnitFormProps {
  onSuccess: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function UnitForm({ onSuccess, initialData, isEditing = false }: UnitFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  console.log('Dados iniciais recebidos no formulário:', initialData);

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: initialData || {
      name: "",
      company_name: "",
      cnpj: "",
      trading_name: "",
      region_id: "",
      enrollment_fee: "",
      material_fee: "",
      monthly_fee: "",
      email: "",
      phone: "",
      legal_representative: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      postal_code: "",
    },
  });

  async function onSubmit(data: UnitFormData) {
    console.log('Dados do formulário para envio:', data);
    
    try {
      if (isEditing) {
        console.log('Atualizando unidade:', initialData.id);
        
        const { error } = await supabase
          .from('units')
          .update({
            name: data.name,
            company_name: data.company_name,
            cnpj: data.cnpj,
            trading_name: data.trading_name || null,
            region_id: data.region_id,
            enrollment_fee: data.enrollment_fee ? parseFloat(data.enrollment_fee) : null,
            material_fee: data.material_fee ? parseFloat(data.material_fee) : null,
            monthly_fee: data.monthly_fee ? parseFloat(data.monthly_fee) : null,
            email: data.email || null,
            phone: data.phone || null,
            legal_representative: data.legal_representative || null,
            street: data.street,
            number: data.number,
            complement: data.complement || null,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            postal_code: data.postal_code,
          })
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('units')
          .insert({
            name: data.name,
            company_name: data.company_name,
            cnpj: data.cnpj,
            trading_name: data.trading_name || null,
            region_id: data.region_id,
            enrollment_fee: data.enrollment_fee ? parseFloat(data.enrollment_fee) : null,
            material_fee: data.material_fee ? parseFloat(data.material_fee) : null,
            monthly_fee: data.monthly_fee ? parseFloat(data.monthly_fee) : null,
            email: data.email || null,
            phone: data.phone || null,
            legal_representative: data.legal_representative || null,
            street: data.street,
            number: data.number,
            complement: data.complement || null,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            postal_code: data.postal_code,
          });

        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['units'] });
      onSuccess();
      
      toast({
        title: isEditing ? "Unidade atualizada" : "Unidade criada",
        description: isEditing 
          ? "A unidade foi atualizada com sucesso."
          : "A unidade foi criada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar salvar a unidade.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoSection form={form} />
        <FeesSection form={form} />
        <ContactSection form={form} />
        <AddressSection form={form} />

        <div className="flex justify-end space-x-4">
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
