
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SystemUserWithUnits } from "@/types/system-user";
import { SystemUsersTable } from "@/components/system-users/system-users-table";
import { SystemUserForm } from "@/components/system-users/system-user-form";

export default function SystemUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["system-users", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("system_users")
        .select(`
          *,
          units:system_user_units(
            *,
            unit:units(
              name
            )
          )
        `)
        .eq('active', true)
        .order('name');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar usuários",
          description: "Ocorreu um erro ao carregar os usuários. Tente novamente.",
        });
        throw error;
      }

      return data as SystemUserWithUnits[];
    },
  });

  const handleCreateUser = async (data: SystemUserWithUnits) => {
    try {
      const { error: userError } = await supabase
        .from("system_users")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
        });

      if (userError) throw userError;

      // Invalidar o cache para forçar uma nova busca
      await queryClient.invalidateQueries({ queryKey: ["system-users"] });

      toast({
        title: "Usuário criado com sucesso!",
        description: "O novo usuário foi cadastrado.",
      });

      setShowNewDialog(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Usuários do Sistema</h1>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <SystemUsersTable users={users || []} isLoading={isLoading} />

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <SystemUserForm onSubmit={handleCreateUser} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
