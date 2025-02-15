
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

  // Primeiro, vamos buscar as unidades do usuário atual para usar como filtro
  const { data: userUnits, isLoading: isLoadingUnits } = useQuery({
    queryKey: ["user-units"],
    queryFn: async () => {
      const { data: userUnits, error } = await supabase
        .from("system_user_units")
        .select("unit_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .eq("active", true);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar unidades",
          description: "Ocorreu um erro ao carregar suas unidades. Tente novamente.",
        });
        throw error;
      }

      return userUnits;
    },
  });

  // Agora vamos buscar os usuários apenas das unidades que o usuário atual tem acesso
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["system-users", searchTerm, userUnits],
    enabled: !!userUnits, // Só executa a query quando tivermos as unidades do usuário
    queryFn: async () => {
      if (!userUnits?.length) {
        return [];
      }

      const unitIds = userUnits.map(u => u.unit_id);

      // Primeiro, vamos buscar os IDs dos usuários que têm acesso às unidades
      const { data: userIds, error: userIdsError } = await supabase
        .from("system_user_units")
        .select('user_id')
        .in('unit_id', unitIds);

      if (userIdsError) throw userIdsError;

      // Agora vamos buscar os usuários usando os IDs obtidos
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
        .in('id', userIds.map(u => u.user_id))
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
      // Primeiro insere o usuário
      const { data: newUser, error: userError } = await supabase
        .from("system_users")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Depois insere as unidades vinculadas
      const { error: unitsError } = await supabase
        .from("system_user_units")
        .insert(
          data.units.map(unit => ({
            user_id: newUser.id,
            unit_id: unit.unit_id,
            role: unit.role,
          }))
        );

      if (unitsError) throw unitsError;

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

  const isLoading = isLoadingUnits || isLoadingUsers;

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
