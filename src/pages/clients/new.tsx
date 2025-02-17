
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LeadFormFields } from "@/components/leads/lead-form-fields";
import { LeadFormData, leadFormSchema } from "@/types/lead-form";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const DEFAULT_UNIT_ID = "0df79a04-444e-46ee-b218-59e4b1835f4a";

export default function NewClient() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      leadSource: "",
      observations: "",
      ageRange: "",
      metaId: "",
      originalAd: "",
    },
  });

  useEffect(() => {
    console.log("New Client form mounted, resetting form...")
    form.reset();
  }, [form]);

  const onSubmit = async (values: LeadFormData) => {
    try {
      console.log("Submitting form with values:", values);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: values.name,
          phone_number: values.phoneNumber,
          lead_source: values.leadSource,
          observations: values.observations,
          age_range: values.ageRange,
          meta_id: values.metaId,
          original_ad: values.originalAd,
          created_by: session.session.user.id,
          status: 'novo-cadastro',
          unit_id: DEFAULT_UNIT_ID
        })
        .select()
        .single();

      if (error) throw error;

      console.log("New client created:", data);
      
      toast({
        title: "Lead cadastrado com sucesso!",
        description: "O lead foi adicionado ao painel do consultor.",
      });
      
      form.reset();
      navigate("/kanban");
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar lead",
        description: "Ocorreu um erro ao tentar cadastrar o lead. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Cadastrar Novo Lead</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <LeadFormFields form={form} />
          
          <Button type="submit" className="w-full">
            Cadastrar Lead
          </Button>
        </form>
      </Form>
    </div>
  );
}
