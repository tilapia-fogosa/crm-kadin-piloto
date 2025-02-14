
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnits } from "@/hooks/useUnits";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser?: {
    id: string;
    user_id: string;
    profiles: {
      full_name: string | null;
    };
    user_roles: {
      role: 'admin' | 'consultor' | 'franqueado';
    }[];
    units: {
      id: string;
      name: string;
    }[];
  } | null;
}

export function UserDialog({ open, onOpenChange, editingUser }: UserDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [role, setRole] = useState<'admin' | 'consultor' | 'franqueado' | ''>('');
  const { data: units } = useUnits();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.profiles?.full_name || '');
      setRole(editingUser.user_roles?.[0]?.role || '');
      setSelectedUnits(editingUser.units?.map(unit => unit.id) || []);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      setSelectedUnits([]);
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um perfil de acesso.",
      });
      return;
    }

    try {
      if (editingUser) {
        // Verificar se a role já existe para o usuário
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', editingUser.user_id)
          .eq('role', role)
          .single();

        if (!existingRole) {
          // Se a role atual é diferente, primeiro deletamos a antiga
          const { error: deleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', editingUser.user_id);

          if (deleteError) throw deleteError;

          // Depois inserimos a nova
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: editingUser.user_id,
              role: role
            });

          if (roleError) throw roleError;
        }

        // Update user units
        // Primeiro, removemos todas as unidades existentes
        const { error: deleteError } = await supabase
          .from('unit_users')
          .delete()
          .eq('user_id', editingUser.user_id);

        if (deleteError) throw deleteError;

        // Depois, adicionamos as novas unidades selecionadas
        if (selectedUnits.length > 0) {
          const unitUserPromises = selectedUnits.map(unitId => 
            supabase
              .from('unit_users')
              .insert({
                user_id: editingUser.user_id,
                unit_id: unitId,
              })
          );

          const results = await Promise.all(unitUserPromises);
          const hasErrors = results.some(result => result.error);

          if (hasErrors) {
            throw new Error('Erro ao vincular usuário às unidades');
          }
        }

      } else {
        // Create new user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        });

        if (signUpError || !authData.user) {
          throw signUpError || new Error('Erro ao criar usuário');
        }

        // Create user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: role
          });

        if (roleError) throw roleError;

        // Create unit-user relationships
        const unitUserPromises = selectedUnits.map(unitId => 
          supabase
            .from('unit_users')
            .insert({
              user_id: authData.user.id,
              unit_id: unitId,
            })
        );

        const results = await Promise.all(unitUserPromises);
        const hasErrors = results.some(result => result.error);

        if (hasErrors) {
          throw new Error('Erro ao vincular usuário às unidades');
        }
      }

      toast({
        title: "Sucesso",
        description: editingUser 
          ? "Usuário atualizado com sucesso."
          : "Usuário criado e vinculado às unidades com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ['unit-users'] });
      setEmail("");
      setName("");
      setPassword("");
      setSelectedUnits([]);
      setRole('');
      onOpenChange(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar usuário",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          {!editingUser && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Perfil de Acesso</Label>
            <Select 
              value={role} 
              onValueChange={(value: 'admin' | 'consultor' | 'franqueado') => setRole(value)}
              required
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
            <Label>Unidades (selecione uma ou mais)</Label>
            <div className="grid grid-cols-2 gap-2">
              {units?.map((unit) => (
                <Button
                  key={unit.id}
                  type="button"
                  variant={selectedUnits.includes(unit.id) ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    setSelectedUnits(prev => {
                      if (prev.includes(unit.id)) {
                        return prev.filter(id => id !== unit.id);
                      }
                      return [...prev, unit.id];
                    });
                  }}
                >
                  {unit.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
