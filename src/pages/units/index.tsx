
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UnitsTable } from "@/components/units/units-table";

export default function UnitsPage() {
  const { toast } = useToast();

  const { data: units, isLoading, error } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*, created_by(full_name)")
        .order("name");

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar unidades",
          description: "Ocorreu um erro ao carregar as unidades. Tente novamente.",
        });
        throw error;
      }

      return data;
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Unidades</h1>
        <Link to="/units/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Unidade
          </Button>
        </Link>
      </div>

      <UnitsTable units={units || []} isLoading={isLoading} />
    </div>
  );
}
