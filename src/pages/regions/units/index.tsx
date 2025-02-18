
import { UnitsTable } from "@/components/units/units-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function UnitsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: units, isLoading, error } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      console.log('Iniciando busca de unidades');
      
      const { data: userProfile } = await supabase.auth.getUser();
      console.log('Usuário atual:', userProfile.user?.email);
      
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          region:regions(name)
        `)
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar unidades:', error);
        throw error;
      }

      console.log('Unidades recuperadas:', data?.length);
      return data;
    },
  });

  if (error) {
    console.error('Erro na query:', error);
    toast({
      variant: "destructive",
      title: "Erro ao carregar unidades",
      description: "Houve um erro ao carregar a lista de unidades. Por favor, tente novamente.",
    });
  }

  if (isLoading) {
    return <div className="container mx-auto py-10">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todas Unidades</h1>
        <Button onClick={() => navigate("/regions/units/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Unidade
        </Button>
      </div>

      <UnitsTable units={units || []} />
    </div>
  );
}
