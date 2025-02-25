
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
import { useEffect } from "react";

interface UnitFormProps {
  onSuccess: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function UnitForm({ onSuccess, initialData, isEditing = false }: UnitFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
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

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        enrollment_fee: Number(initialData.enrollment_fee) || 0,
        material_fee: Number(initialData.material_fee) || 0,
        monthly_fee: Number(initialData.monthly_fee) || 0,
        complement: initialData.complement || "",
        trading_name: initialData.trading_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        legal_representative: initialData.legal_representative || "",
      };
      form.reset(formattedData);
    }
  }, [initialData, form]);

  const onSubmit = async (data: UnitFormData) => {
    try {
      // Removendo campos do formData que serão gerados automaticamente
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
        active: true
      };

      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('units')
          .update(formData)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('units')
          .insert(formData);

        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['units'] });
      onSuccess();
      
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar salvar a unidade.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoSection form={form} />
        <FeesSection form={form} />
        <ContactSection form={form} />
        <AddressSection form={form} />

        <div className="flex justify-end space-x-4">
          <Button type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
