import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    user_roles: {
      role: 'admin' | 'consultor' | 'franqueado';
    }[];
  };
}

interface FormData {
  full_name: string;
  email: string;
  role: 'admin' | 'consultor' | 'franqueado';
  units: string[];
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: user ? {
      full_name: user.full_name || '',
      email: user.email,
      role: user.user_roles[0]?.role || 'consultor',
      units: []
    } : {
      full_name: '',
      email: '',
      role: 'consultor',
      units: []
    }
  });

  // Buscar unidades disponíveis
  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.functions.invoke('manage-user', {
        body: {
          method: user ? 'UPDATE' : 'CREATE',
          userData: {
            ...data,
            id: user?.id
          }
        }
      });

      if (error) throw error;

      toast({
        title: user ? "Usuário atualizado" : "Usuário criado",
        description: "As alterações foram salvas com sucesso.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar as alterações.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              {...register("full_name", { required: true })}
            />
            {errors.full_name && (
              <span className="text-sm text-red-500">Nome é obrigatório</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: true })}
              disabled={!!user} // Email só pode ser definido na criação
            />
            {errors.email && (
              <span className="text-sm text-red-500">Email é obrigatório</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Perfil de Acesso</Label>
            <Select
              defaultValue={user?.user_roles[0]?.role || 'consultor'}
              onValueChange={(value) => {
                register("role").onChange({
                  target: { value, name: "role" },
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="consultor">Consultor</SelectItem>
                <SelectItem value="franqueado">Franqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unidades</Label>
            <div className="grid grid-cols-2 gap-2">
              {units?.map((unit) => (
                <label key={unit.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={unit.id}
                    {...register("units", { required: true })}
                  />
                  <span>{unit.name}</span>
                </label>
              ))}
            </div>
            {errors.units && (
              <span className="text-sm text-red-500">
                Selecione pelo menos uma unidade
              </span>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
