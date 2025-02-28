
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useUserOperations } from "@/hooks/useUserOperations";
import { UserForm } from "./components/UserForm";
import { AdminConfirmationDialog } from "./components/AdminConfirmationDialog";
import { User, UnitUser, UserFormValues } from "./types/user-dialog.types";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { toast } = useToast();
  const [currentUnitUser, setCurrentUnitUser] = useState<UnitUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<UserFormValues | null>(null);
  const { updateUser } = useUserOperations();

  useEffect(() => {
    const fetchData = async () => {
      console.log('Iniciando busca de dados do usuário');
      try {
        const { data: unitUsersData, error: unitUsersError } = await supabase
          .from('unit_users')
          .select('unit_id, role')
          .eq('user_id', user.id)
          .eq('active', true);

        if (unitUsersError) {
          console.error('Erro ao buscar associações de unidade:', unitUsersError);
          throw unitUsersError;
        }
        
        if (unitUsersData?.length > 0) {
          console.log('Dados de unidade do usuário encontrados:', unitUsersData);
          const firstUnitUser = unitUsersData[0];
          setCurrentUnitUser({
            unit_id: firstUnitUser.unit_id,
            role: firstUnitUser.role,
            active: true
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, user.id, toast]);

  const handleSubmit = async (values: UserFormValues) => {
    console.log('Iniciando submissão do formulário:', values);
    
    // Garantir que todos os campos obrigatórios estejam preenchidos
    if (!values.full_name || !values.email || !values.role || !values.unitIds.length) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Todos os campos são obrigatórios",
      });
      return;
    }

    if (values.role === 'admin' && currentUnitUser?.role !== 'admin') {
      setPendingSubmission(values);
      setShowAdminConfirmation(true);
      return;
    }

    await submitForm(values);
  };

  const submitForm = async (values: UserFormValues) => {
    console.log('Submetendo formulário com valores:', values);
    const success = await updateUser(user.id, {
      full_name: values.full_name,
      email: values.email,
      role: values.role,
      unitIds: values.unitIds,
    });
    if (success) {
      onOpenChange(false);
    }
  };

  const handleAdminConfirm = () => {
    setShowAdminConfirmation(false);
    if (pendingSubmission) {
      submitForm(pendingSubmission);
      setPendingSubmission(null);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Carregando Dados do Usuário</DialogTitle>
            <DialogDescription>
              Aguarde enquanto carregamos as informações do usuário...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário: {user.full_name}</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias nos dados do usuário. Todas as alterações serão salvas automaticamente.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            defaultValues={{
              full_name: user.full_name || '',
              email: user.email || '',
              unitIds: currentUnitUser ? [currentUnitUser.unit_id] : [],
              role: currentUnitUser?.role || 'consultor',
            }}
            onSubmit={handleSubmit}
            isSubmitting={false}
            onCancel={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>

      <AdminConfirmationDialog
        open={showAdminConfirmation}
        onOpenChange={setShowAdminConfirmation}
        onConfirm={handleAdminConfirm}
      />
    </>
  );
}
