/**
 * Drawer de cadastro de cliente via WhatsApp
 * 
 * Log: Componente drawer que abre da esquerda para direita para cadastrar contatos
 * que enviaram mensagens pelo WhatsApp mas ainda não estão registrados no sistema
 * 
 * Etapas:
 * 1. Recebe o telefone como prop
 * 2. Pré-preenche o campo de telefone (apenas leitura)
 * 3. Define "WhatsApp" como origem padrão
 * 4. Ao submeter:
 *    a) Verifica se já existe cliente com mesmo telefone na unidade
 *    b) Se existir, mostra modal informativo e vincula mensagens ao fechar
 *    c) Se não existir, cria novo cliente na tabela 'clients'
 *    d) Vincula todas as mensagens existentes (UPDATE historico_comercial)
 *    e) Fecha o drawer e atualiza a lista
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LeadFormFields } from "@/components/leads/lead-form-fields";
import { LeadFormData, leadFormSchema } from "@/types/lead-form";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { UnitFormField } from "@/components/leads/UnitFormField";
import { Phone, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCheckDuplicateClient, ExistingClient } from "@/hooks/useCheckDuplicateClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ID do perfil Sistema-Kadin para registros automáticos
const SISTEMA_KADIN_ID = 'eaf94b92-7646-485f-bd96-016bf1add2b2';

interface NewClientDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  onSuccess?: () => void;
}

export function NewClientDrawer({ open, onOpenChange, phoneNumber, onSuccess }: NewClientDrawerProps) {
  const { toast } = useToast();
  const { checkDuplicate, isChecking } = useCheckDuplicateClient();
  
  // Estado para controlar o modal de duplicados
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [existingClient, setExistingClient] = useState<ExistingClient | null>(null);
  const [pendingFormData, setPendingFormData] = useState<LeadFormData | null>(null);

  console.log('NewClientDrawer: Montando drawer com telefone:', phoneNumber);
  
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
    if (open && phoneNumber) {
      console.log("NewClientDrawer: Configurando formulário com telefone:", phoneNumber);
      
      // Preencher telefone e leadSource
      form.setValue('phoneNumber', phoneNumber);
      form.setValue('leadSource', 'WhatsApp');
      
      // Focar no campo nome após um pequeno delay
      setTimeout(() => {
        const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
        if (nameInput) {
          nameInput.focus();
          console.log('NewClientDrawer: Foco definido no campo nome');
        }
      }, 100);
    }
  }, [open, phoneNumber, form]);

  /**
   * Handler principal do formulário
   * Etapa 1: Verifica duplicados antes de criar
   */
  const onSubmit = async (values: LeadFormData) => {
    console.log("NewClientDrawer: Iniciando verificação de duplicados");
    
    // Etapa 1: Verificar se já existe cliente com mesmo telefone na unidade
    const duplicate = await checkDuplicate(values.phoneNumber, values.unitId);
    
    if (duplicate) {
      console.log("NewClientDrawer: Cliente duplicado encontrado, exibindo modal informativo");
      setExistingClient(duplicate);
      setPendingFormData(values);
      setShowDuplicateModal(true);
      return;
    }
    
    // Se não há duplicado, prosseguir com cadastro
    console.log("NewClientDrawer: Nenhum duplicado, prosseguindo com cadastro");
    await createClient(values);
  };

  /**
   * Cria o cliente no banco de dados
   * Etapa 2: Inserção efetiva após validações
   */
  const createClient = async (values: LeadFormData) => {
    try {
      console.log("NewClientDrawer: Iniciando cadastro com valores:", values);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Não autenticado');
      }

      console.log('NewClientDrawer: Etapa 1 - Criando novo cliente na tabela clients');
      
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
        console.error('NewClientDrawer: Erro ao criar cliente:', clientError);
        throw clientError;
      }

      console.log('NewClientDrawer: Cliente criado com sucesso:', {
        id: newClient.id,
        name: newClient.name,
        phone: newClient.phone_number
      });

      // Etapa 2: Vincular mensagens existentes ao novo cliente
      console.log('NewClientDrawer: Etapa 2 - Vinculando mensagens existentes ao cliente');
      
      const { data: updatedMessages, error: updateError } = await supabase
        .from('historico_comercial')
        .update({ client_id: newClient.id })
        .eq('telefone', values.phoneNumber)
        .is('client_id', null)
        .select('id');

      if (updateError) {
        console.error('NewClientDrawer: Erro ao vincular mensagens:', updateError);
        // Não bloqueia o fluxo, apenas loga o erro
      } else {
        const messageCount = updatedMessages?.length || 0;
        console.log(`NewClientDrawer: ${messageCount} mensagens vinculadas ao cliente ${newClient.id}`);
      }

      // Etapa 3: Registrar automaticamente no histórico comercial
      try {
        console.log('NewClientDrawer: Etapa 3 - Inserindo registro automático no histórico');
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
          console.error('NewClientDrawer: Erro ao inserir histórico:', historyError);
        } else {
          console.log('NewClientDrawer: Histórico comercial registrado com sucesso');
        }
      } catch (historyErr) {
        console.error('NewClientDrawer: Exceção ao inserir histórico:', historyErr);
      }
      
      toast({
        title: "Contato cadastrado com sucesso!",
        description: `${values.name} foi vinculado às mensagens do WhatsApp.`,
      });
      
      console.log('NewClientDrawer: Cadastro concluído, fechando drawer');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
      
    } catch (error) {
      console.error("NewClientDrawer: Erro ao cadastrar contato:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar contato",
        description: "Ocorreu um erro ao tentar cadastrar o contato. Tente novamente.",
      });
    }
  };

  /**
   * Handler para fechar modal e vincular mensagens ao cliente existente
   * Ao detectar duplicado, simplesmente vincula as mensagens ao cliente já cadastrado
   */
  const handleCloseAndLink = async () => {
    console.log("NewClientDrawer: Fechando modal e vinculando mensagens ao cliente existente");
    setShowDuplicateModal(false);
    
    if (existingClient && pendingFormData) {
      try {
        // Etapa 1: Vincular mensagens existentes ao cliente existente
        console.log('NewClientDrawer: Vinculando mensagens ao cliente existente:', existingClient.id);
        const { data: updatedMessages, error: updateError } = await supabase
          .from('historico_comercial')
          .update({ client_id: existingClient.id })
          .eq('telefone', pendingFormData.phoneNumber)
          .is('client_id', null)
          .select('id');
        
        if (updateError) {
          console.error('NewClientDrawer: Erro ao vincular mensagens:', updateError);
        } else {
          const messageCount = updatedMessages?.length || 0;
          console.log(`NewClientDrawer: ${messageCount} mensagens vinculadas ao cliente ${existingClient.id}`);
        }
        
        toast({
          title: "Mensagens vinculadas!",
          description: `Conversa vinculada ao cliente existente: ${existingClient.name}`,
        });
        
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        console.error('NewClientDrawer: Erro ao vincular mensagens:', error);
        toast({
          variant: "destructive",
          title: "Erro ao vincular",
          description: "Ocorreu um erro ao vincular as mensagens.",
        });
      }
    }
    
    setPendingFormData(null);
    setExistingClient(null);
  };

  const handleCancel = () => {
    console.log('NewClientDrawer: Cancelando cadastro, fechando drawer');
    form.reset();
    onOpenChange(false);
  };

  /**
   * Formata data para exibição
   */
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <SheetTitle>Cadastrar Contato do WhatsApp</SheetTitle>
              </div>
            </div>
            
            <SheetDescription>
              Este contato enviou mensagens pelo WhatsApp mas ainda não está cadastrado no sistema.
              Preencha os dados abaixo para vincular as mensagens existentes.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <UnitFormField form={form} />
                
                {/* Campo telefone apenas leitura */}
                <div className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm font-medium mb-2">Telefone</p>
                    <p className="text-lg font-mono">{phoneNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este telefone será vinculado automaticamente às mensagens existentes
                    </p>
                  </div>
                  
                  <LeadFormFields form={form} hidePhoneNumber={true} />
                </div>
                
                <div className="flex gap-4 pt-4">
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
                    disabled={isChecking}
                  >
                    {isChecking ? "Verificando..." : "Cadastrar Contato"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal informativo de cliente já cadastrado */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <DialogTitle>Cliente já cadastrado</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              Este telefone já está vinculado a um cliente cadastrado. 
              Ao fechar, as mensagens serão automaticamente vinculadas a este cliente.
            </DialogDescription>
          </DialogHeader>
          
          {existingClient && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nome:</span>
                <span className="text-sm font-medium">{existingClient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Telefone:</span>
                <span className="text-sm font-mono">{existingClient.phone_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Origem:</span>
                <span className="text-sm">{existingClient.lead_source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm">{existingClient.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cadastrado em:</span>
                <span className="text-sm">{formatDate(existingClient.created_at)}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleCloseAndLink}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
