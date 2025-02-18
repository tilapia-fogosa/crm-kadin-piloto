
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { UnitUsersTable } from "@/components/units/users/unit-users-table";
import { UnitUserDialog } from "@/components/units/users/unit-user-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function UnitUsersPage() {
  const { unitId } = useParams();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: unit } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('id', unitId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários da Unidade</h1>
        <Button onClick={() => {
          setEditingUser(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {unitId && <UnitUsersTable 
        unitId={unitId} 
        onEdit={(user) => {
          setEditingUser(user);
          setIsDialogOpen(true);
        }}
      />}

      {unit && <UnitUserDialog
        unit={unit}
        user={editingUser}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingUser(null);
        }}
      />}
    </div>
  );
}
