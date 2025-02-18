
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UnitForm } from "./unit-form";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UnitEditDialogProps {
  unit: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitEditDialog({ unit, open, onOpenChange }: UnitEditDialogProps) {
  const { toast } = useToast();

  const { data: unitWithAddress, isLoading, error } = useQuery({
    queryKey: ['units', unit?.id],
    queryFn: async () => {
      if (!unit) return null;
      
      console.log('Buscando dados da unidade:', unit.id);
      
      // Primeiro, verifica se o usuário tem permissão para ver a unidade
      const { data: userPermission, error: permissionError } = await supabase
        .from('unit_users')
        .select('role')
        .eq('unit_id', unit.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (permissionError && !permissionError.message.includes('No rows found')) {
        console.error('Erro ao verificar permissões:', permissionError);
        throw permissionError;
      }

      // Se não tem permissão direta, verifica se é admin
      if (!userPermission) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (profileError) {
          console.error('Erro ao verificar perfil:', profileError);
          throw profileError;
        }

        if (!profile?.is_admin) {
          throw new Error('Sem permissão para acessar esta unidade');
        }
      }
      
      // Busca os dados da unidade
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          address:unit_addresses(*)
        `)
        .eq('id', unit.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar unidade:', error);
        throw error;
      }

      console.log('Dados recuperados:', data);
      return data;
    },
    enabled: !!unit,
  });

  if (!unit) return null;

  if (error) {
    console.error('Erro na query:', error);
    toast({
      variant: "destructive",
      title: "Erro ao carregar dados",
      description: error.message === 'Sem permissão para acessar esta unidade' 
        ? "Você não tem permissão para acessar esta unidade."
        : "Houve um erro ao carregar os dados da unidade.",
    });
    onOpenChange(false);
    return null;
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Prepara os dados iniciais combinando unidade e endereço
  const initialData = unitWithAddress ? {
    ...unitWithAddress,
    ...unitWithAddress.address[0],
  } : null;

  console.log('Dados iniciais do formulário:', initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Unidade</DialogTitle>
        </DialogHeader>

        {initialData && (
          <div className="mt-6">
            <UnitForm
              initialData={initialData}
              isEditing
              onSuccess={() => {
                toast({
                  title: "Unidade atualizada",
                  description: "A unidade foi atualizada com sucesso.",
                });
                onOpenChange(false);
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
