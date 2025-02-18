
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
  
  console.log('Componente UnitForm renderizado');
  console.log('Dados iniciais recebidos no formulário:', initialData);

  // Converter os valores numéricos para number ao inicializar o formulário
  const formattedInitialData = initialData ? {
    ...initialData,
    enrollment_fee: Number(initialData.enrollment_fee) || 0,
    material_fee: Number(initialData.material_fee) || 0,
    monthly_fee: Number(initialData.monthly_fee) || 0,
    complement: initialData.complement || ""
  } : undefined;

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: formattedInitialData || {
      name: "",
      company_name: "",
      cnpj: "",
      trading_name: "",
      region_id: "",
      enrollment_fee: 0,
      material_fee: 0,
      monthly_fee: 0,
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

  const onSubmit = async (data: UnitFormData) => {
    console.log('Iniciando submissão do formulário');
    console.log('Dados do formulário para envio:', data);
    console.log('isEditing:', isEditing);
    console.log('initialData?.id:', initialData?.id);
    
    try {
      const formData = {
        name: data.name,
        company_name: data.company_name,
        cnpj: data.cnpj,
        trading_name: data.trading_name || null,
        region_id: data.region_id,
        enrollment_fee: data.enrollment_fee,
        material_fee: data.material_fee,
        monthly_fee: data.monthly_fee,
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
      };

      console.log('Dados formatados para envio:', formData);

      if (isEditing && initialData?.id) {
        console.log('Atualizando unidade:', initialData.id);
        
        const { error } = await supabase
          .from('units')
          .update(formData)
          .eq('id', initialData.id);

        if (error) {
          console.error('Erro ao atualizar:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('units')
          .insert(formData);

        if (error) {
          console.error('Erro ao inserir:', error);
          throw error;
        }
      }

      console.log('Operação realizada com sucesso, invalidando queries...');
      await queryClient.invalidateQueries({ queryKey: ['units'] });
      
      console.log('Chamando callback de sucesso...');
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
  };

  // Adicionar log no evento de submit do formulário
  const handleFormSubmit = form.handleSubmit((data) => {
    console.log('Form handleSubmit chamado');
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <BasicInfoSection form={form} />
        <FeesSection form={form} />
        <ContactSection form={form} />
        <AddressSection form={form} />

        <div className="flex justify-end space-x-4">
          <Button 
            type="submit"
            onClick={() => console.log('Botão clicado')}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
