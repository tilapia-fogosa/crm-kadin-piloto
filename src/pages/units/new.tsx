
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UnitFormFields } from "@/components/units/unit-form-fields";
import { UnitFormData, unitFormSchema } from "@/types/unit-form";
import { supabase } from "@/integrations/supabase/client";

export default function NewUnit() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = async (values: UnitFormData) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      // Extrair o número do endereço usando regex
      const numberMatch = values.address.match(/\d+/);
      const number = numberMatch ? numberMatch[0] : '0';

      const { data, error } = await supabase
        .from('units')
        .insert({
          name: values.name,
          description: values.description,
          street: values.address,
          city: values.city,
          state: values.state,
          postal_code: values.postalCode,
          phone: values.phone,
          email: values.email,
          created_by: session.session.user.id,
          number: number,
          neighborhood: 'Centro', // Valor padrão para o bairro
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Unidade criada com sucesso!",
        description: "A nova unidade foi adicionada ao sistema.",
      });
      
      navigate("/units");
    } catch (error) {
      console.error("Error creating unit:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar unidade",
        description: "Ocorreu um erro ao tentar criar a unidade. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Nova Unidade</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <UnitFormFields form={form} />
          
          <div className="flex gap-4">
            <Button type="submit">
              Criar Unidade
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/units")}>
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
