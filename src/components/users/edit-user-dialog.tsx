import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useUserOperations } from "@/hooks/useUserOperations";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MultipleUnitSelect } from "../auth/MultipleUnitSelect";

interface Unit {
  id: string;
  name: string;
  city: string;
}

interface UnitUser {
  unit_id: string;
  role: 'consultor' | 'franqueado' | 'admin';
  active: boolean;
}

const formSchema = z.object({
  full_name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  unitIds: z.array(z.string()).min(1, "Selecione pelo menos uma unidade"),
  role: z.enum(['consultor', 'franqueado', 'admin']),
});

type FormValues = z.infer<typeof formSchema>;

interface User {
  id: string;
  full_name: string;
  email: string;
  access_blocked: boolean;
  email_confirmed: boolean;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { toast } = useToast();
  const [units, setUnits] = useState<Unit[]>([]);
  const [currentUnitUser, setCurrentUnitUser] = useState<UnitUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const { updateUser } = useUserOperations();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email || '',
      unitIds: [],
      role: 'consultor',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      console.log('Iniciando busca de dados do usuário');
      try {
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('id, name, city')
          .eq('active', true)
          .order('name');

        if (unitsError) {
          console.error('Erro ao buscar unidades:', unitsError);
          throw unitsError;
        }
        console.log('Unidades recuperadas:', unitsData?.length);
        setUnits(unitsData || []);

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
          form.setValue('unitIds', unitUsersData.map(uu => uu.unit_id));
          form.setValue('role', firstUnitUser.role);
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
  }, [open, user.id, form, toast]);

  const handleSubmit = async (values: FormValues) => {
    console.log('Iniciando submissão do formulário:', values);
    if (values.role === 'admin' && currentUnitUser?.role !== 'admin') {
      setShowAdminConfirmation(true);
      return;
    }

    await submitForm(values);
  };

  const submitForm = async (values: FormValues) => {
    console.log('Submetendo formulário com valores:', values);
    const success = await updateUser(user.id, values);
    if (success) {
      onOpenChange(false);
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidades</FormLabel>
                    <FormControl>
                      <MultipleUnitSelect
                        selectedUnits={field.value}
                        onUnitsChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="consultor">Consultor</SelectItem>
                        <SelectItem value="franqueado">Franqueado</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showAdminConfirmation} onOpenChange={setShowAdminConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Permissão de Administrador</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a dar permissões de administrador para este usuário. 
              Esta ação permite que ele tenha acesso completo ao sistema. Tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowAdminConfirmation(false);
                submitForm(form.getValues());
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
