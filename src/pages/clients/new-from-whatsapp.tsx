/**
 * Página de cadastro de cliente via WhatsApp
 * 
 * Log: Tela específica para cadastrar contatos que enviaram mensagens pelo WhatsApp
 * mas ainda não estão registrados no sistema
 * 
 * Etapas:
 * 1. Lê o parâmetro 'phone' da URL
 * 2. Pré-preenche o campo de telefone (desabilitado)
 * 3. Define "WhatsApp" como origem padrão
 * 4. Ao submeter:
 *    a) Cria novo cliente na tabela 'clients'
 *    b) Vincula todas as mensagens existentes (UPDATE historico_comercial)
 *    c) Navega de volta para /whatsapp
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LeadFormFields } from "@/components/leads/lead-form-fields";
import { LeadFormData, leadFormSchema } from "@/types/lead-form";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { UnitFormField } from "@/components/leads/UnitFormField";
import { Phone, ArrowLeft } from "lucide-react";

// ID do perfil Sistema-Kadin para registros automáticos
const SISTEMA_KADIN_ID = 'eaf94b92-7646-485f-bd96-016bf1add2b2';

export default function NewClientFromWhatsApp() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '';

  console.log('NewClientFromWhatsApp: Montando tela com telefone:', phoneNumber);
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: phoneNumber,
      leadSource: "WhatsApp",
      observations: "",
      ageRange: "",
      metaId: "",
      originalAd: "",
      email: "",
      unitId: "",
    },
  });

  useEffect(() => {
    console.log("NewClientFromWhatsApp: Configurando formulário com telefone:", phoneNumber);
    
    // Preencher telefone e focar no campo nome
    if (phoneNumber) {
      form.setValue('phoneNumber', phoneNumber);
      form.setValue('leadSource', 'WhatsApp');
      
      // Focar no campo nome após um pequeno delay
      setTimeout(() => {
        const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
        if (nameInput) {
          nameInput.focus();
          console.log('NewClientFromWhatsApp: Foco definido no campo nome');
        }
      }, 100);
    }
  }, [phoneNumber, form]);

  const onSubmit = async (values: LeadFormData) => {
    try {
      console.log("NewClientFromWhatsApp: Iniciando cadastro com valores:", values);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Não autenticado');
      }

      console.log('NewClientFromWhatsApp: Etapa 1 - Criando novo cliente na tabela clients');
      
      // Etapa 1: Criar novo cliente
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: values.name,
          phone_number: values.phoneNumber,
          lead_source: values.leadSource,
          observations: values.observations,
          age_range: values.ageRange,
          meta_id: values.metaId,
          original_ad: values.originalAd,
          email: values.email,
          created_by: session.session.user.id,
          status: 'novo-cadastro',
          unit_id: values.unitId,
          tipo_atendimento: 'humano'
        })
        .select()
        .single();

      if (clientError) {
        console.error('NewClientFromWhatsApp: Erro ao criar cliente:', clientError);
        throw clientError;
      }

      console.log('NewClientFromWhatsApp: Cliente criado com sucesso:', {
        id: newClient.id,
        name: newClient.name,
        phone: newClient.phone_number
      });

      // Etapa 2: Vincular mensagens existentes ao novo cliente
      console.log('NewClientFromWhatsApp: Etapa 2 - Vinculando mensagens existentes ao cliente');
      
      const { data: updatedMessages, error: updateError } = await supabase
        .from('historico_comercial')
        .update({ client_id: newClient.id })
        .eq('telefone', values.phoneNumber)
        .is('client_id', null)
        .select('id');

      if (updateError) {
        console.error('NewClientFromWhatsApp: Erro ao vincular mensagens:', updateError);
        // Não bloqueia o fluxo, apenas loga o erro
      } else {
        const messageCount = updatedMessages?.length || 0;
        console.log(`NewClientFromWhatsApp: ${messageCount} mensagens vinculadas ao cliente ${newClient.id}`);
      }

      // Etapa 3: Registrar automaticamente no histórico comercial
      try {
        console.log('NewClientFromWhatsApp: Etapa 3 - Inserindo registro automático no histórico');
        const { error: historyError } = await supabase
          .from('historico_comercial')
          .insert({
            client_id: newClient.id,
            mensagem: ' ',
            from_me: true,
            created_by: SISTEMA_KADIN_ID,
            lida: false,
            tipo_mensagem: 'sistema'
          });
        
        if (historyError) {
          console.error('NewClientFromWhatsApp: Erro ao inserir histórico:', historyError);
        } else {
          console.log('NewClientFromWhatsApp: Histórico comercial registrado com sucesso');
        }
      } catch (historyErr) {
        console.error('NewClientFromWhatsApp: Exceção ao inserir histórico:', historyErr);
      }
      
      toast({
        title: "Contato cadastrado com sucesso!",
        description: `${values.name} foi vinculado às mensagens do WhatsApp.`,
      });
      
      console.log('NewClientFromWhatsApp: Cadastro concluído, navegando para /whatsapp');
      form.reset();
      navigate("/whatsapp");
      
    } catch (error) {
      console.error("NewClientFromWhatsApp: Erro ao cadastrar contato:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar contato",
        description: "Ocorreu um erro ao tentar cadastrar o contato. Tente novamente.",
      });
    }
  };

  const handleCancel = () => {
    console.log('NewClientFromWhatsApp: Cancelando cadastro, voltando para /whatsapp');
    navigate("/whatsapp");
  };

  return (
    <div className="container mx-auto py-10">
      {/* Header com informação contextual */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para WhatsApp
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold">Cadastrar Contato do WhatsApp</h1>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Este contato enviou mensagens pelo WhatsApp mas ainda não está cadastrado no sistema.
          Preencha os dados abaixo para vincular as mensagens existentes.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <UnitFormField form={form} />
          
          {/* Campos do formulário com telefone desabilitado */}
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-medium mb-2">Telefone</p>
              <p className="text-lg font-mono">{phoneNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Este telefone será vinculado automaticamente às mensagens existentes
              </p>
            </div>
            
            <LeadFormFields form={form} />
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
            >
              Cadastrar Contato
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
