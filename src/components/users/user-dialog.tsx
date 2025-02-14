
import { useState } from "react";
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
}

export function UserDialog({ open, onOpenChange }: UserDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const { data: units } = useUnits();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnits(prev => {
      if (prev.includes(unitId)) {
        return prev.filter(id => id !== unitId);
      }
      return [...prev, unitId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUnits.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione pelo menos uma unidade.",
      });
      return;
    }

    try {
      // 1. Create user in auth
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

      // 2. Create unit-user relationships
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

      toast({
        title: "Sucesso",
        description: "Usuário criado e vinculado às unidades com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ['unit-users'] });
      setEmail("");
      setName("");
      setPassword("");
      setSelectedUnits([]);
      onOpenChange(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar usuário",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
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
          <div className="space-y-2">
            <Label>Unidades (selecione uma ou mais)</Label>
            <div className="grid grid-cols-2 gap-2">
              {units?.map((unit) => (
                <Button
                  key={unit.id}
                  type="button"
                  variant={selectedUnits.includes(unit.id) ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleUnitSelect(unit.id)}
                >
                  {unit.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Criar Usuário</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
