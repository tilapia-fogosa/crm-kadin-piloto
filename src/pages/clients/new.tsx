/**
 * Página de cadastro de novo lead/cliente
 * Inclui verificação de duplicidade por telefone antes de criar
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LeadFormFields } from "@/components/leads/lead-form-fields";
import { LeadFormData, leadFormSchema } from "@/types/lead-form";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { UnitFormField } from "@/components/leads/UnitFormField";
import { formatPhoneForStorage } from "@/utils/phone-utils";
import { useCheckDuplicateClient, ExistingClient } from "@/hooks/useCheckDuplicateClient";
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

// ID do perfil Sistema-Kadin para registros automáticos
const SISTEMA_KADIN_ID = 'eaf94b92-7646-485f-bd96-016bf1add2b2';

export default function NewClient() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkDuplicate, isChecking } = useCheckDuplicateClient();
  
  // Estados para controle do diálogo de duplicidade
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [existingClient, setExistingClient] = useState<ExistingClient | null>(null);
  const [pendingFormData, setPendingFormData] = useState<LeadFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      email: "",
      unitId: "",
    },
  });

  useEffect(() => {
    console.log("NewClient: Form mounted, resetting form...")
    form.reset();
  }, [form]);

  /**
   * Cria um novo cliente no banco de dados
   * @param values - Dados do formulário com telefone já formatado
   */
  const createClient = async (values: LeadFormData) => {
    try {
      console.log("NewClient: Criando novo cliente com valores:", values);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      // Etapa 1: Inserir cliente com telefone formatado
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: values.name,
          phone_number: values.phoneNumber, // Já formatado
          lead_source: values.leadSource,
          observations: values.observations,
          age_range: values.ageRange,
          meta_id: values.metaId,
          original_ad: values.originalAd,
          email: values.email,
          created_by: session.session.user.id,
          status: 'novo-cadastro',
          unit_id: values.unitId
        })
        .select()
        .single();

      if (error) throw error;

      console.log("NewClient: Cliente criado com sucesso:", data);

      // Etapa 2: Registrar automaticamente no histórico comercial
      try {
        console.log('NewClient: Inserindo registro automático no histórico comercial');
        const { error: historyError } = await supabase
          .from('historico_comercial')
          .insert({
            client_id: data.id,
            mensagem: ' ',
            from_me: true,
            created_by: SISTEMA_KADIN_ID,
            lida: false,
            tipo_mensagem: 'sistema'
          });
        
        if (historyError) {
          console.error('NewClient: Erro ao inserir histórico comercial:', historyError);
        } else {
          console.log('NewClient: Histórico comercial registrado com sucesso');
        }
      } catch (historyErr) {
        console.error('NewClient: Exceção ao inserir histórico comercial:', historyErr);
      }
      
      toast({
        title: "Lead cadastrado com sucesso!",
        description: "O lead foi adicionado ao painel do consultor.",
      });
      
      form.reset();
      navigate("/kanban");
    } catch (error) {
      console.error("NewClient: Erro ao criar cliente:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar lead",
        description: "Ocorreu um erro ao tentar cadastrar o lead. Tente novamente.",
      });
    }
  };

  /**
   * Atualiza um cliente existente com os novos dados
   */
  const updateExistingClient = async () => {
    if (!existingClient || !pendingFormData) {
      console.error('NewClient: Dados pendentes não encontrados para atualização');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('NewClient: Atualizando cliente existente:', existingClient.id);
      
      const { error } = await supabase
        .from('clients')
        .update({
          name: pendingFormData.name,
          email: pendingFormData.email || null,
          lead_source: pendingFormData.leadSource,
          observations: pendingFormData.observations || null,
          age_range: pendingFormData.ageRange || null,
          meta_id: pendingFormData.metaId || null,
          original_ad: pendingFormData.originalAd || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingClient.id);
      
      if (error) {
        console.error('NewClient: Erro ao atualizar cliente:', error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar cadastro",
          description: "Ocorreu um erro ao tentar atualizar o cadastro. Tente novamente.",
        });
        return;
      }
      
      console.log('NewClient: Cliente atualizado com sucesso');
      
      toast({
        title: "Cadastro atualizado com sucesso!",
        description: `Os dados de ${existingClient.name} foram atualizados.`,
      });
      
      // Limpar estados e redirecionar
      setShowDuplicateDialog(false);
      setExistingClient(null);
      setPendingFormData(null);
      form.reset();
      navigate("/kanban");
    } catch (error) {
      console.error('NewClient: Exceção ao atualizar cliente:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler do submit do formulário
   * Verifica duplicidade antes de criar
   */
  const onSubmit = async (values: LeadFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log("NewClient: Iniciando submit com valores:", values);
      
      // Etapa 1: Formatar telefone para o padrão de armazenamento
      const formattedPhone = formatPhoneForStorage(values.phoneNumber);
      console.log('NewClient: Telefone formatado:', formattedPhone);
      
      // Etapa 2: Verificar se já existe cliente com este telefone na unidade
      const duplicate = await checkDuplicate(formattedPhone, values.unitId);
      
      if (duplicate) {
        // Etapa 3a: Encontrou duplicado - mostrar diálogo
        console.log('NewClient: Duplicado encontrado, exibindo diálogo');
        setExistingClient(duplicate);
        setPendingFormData({ ...values, phoneNumber: formattedPhone });
        setShowDuplicateDialog(true);
        setIsSubmitting(false);
        return;
      }
      
      // Etapa 3b: Não encontrou duplicado - criar novo cliente
      console.log('NewClient: Nenhum duplicado, criando novo cliente');
      await createClient({ ...values, phoneNumber: formattedPhone });
    } catch (error) {
      console.error("NewClient: Erro no submit:", error);
      toast({
        variant: "destructive",
        title: "Erro ao processar cadastro",
        description: "Ocorreu um erro ao verificar duplicidade. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handler para cancelar o diálogo de duplicidade
   */
  const handleCancelDuplicate = () => {
    console.log('NewClient: Usuário cancelou diálogo de duplicidade');
    setShowDuplicateDialog(false);
    setExistingClient(null);
    setPendingFormData(null);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Cadastrar Novo Lead</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <UnitFormField form={form} />
          <LeadFormFields form={form} />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || isChecking}
          >
            {isChecking ? "Verificando..." : isSubmitting ? "Cadastrando..." : "Cadastrar Lead"}
          </Button>
        </form>
      </Form>

      {/* Diálogo de cliente duplicado */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cliente já cadastrado</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Já existe um cliente com este telefone nesta unidade:</p>
                <div className="p-3 bg-muted rounded-md text-sm">
                  <p><strong>Nome:</strong> {existingClient?.name}</p>
                  <p><strong>Telefone:</strong> {existingClient?.phone_number}</p>
                  <p><strong>Status:</strong> {existingClient?.status}</p>
                  {existingClient?.email && (
                    <p><strong>Email:</strong> {existingClient?.email}</p>
                  )}
                </div>
                <p>Deseja atualizar o cadastro existente com os novos dados?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDuplicate}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={updateExistingClient}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Atualizando..." : "Atualizar Cadastro"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
