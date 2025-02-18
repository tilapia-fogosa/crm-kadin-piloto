
import { UnitForm } from "@/components/units/unit-form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function EditUnitPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: unit, isLoading } = useQuery({
    queryKey: ['units', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          address:unit_addresses(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!unit) {
    return <div>Unidade não encontrada</div>;
  }

  // Prepara os dados iniciais combinando unidade e endereço
  const initialData = {
    ...unit,
    ...unit.address[0],
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Editar Unidade</h1>
      
      <UnitForm
        initialData={initialData}
        isEditing
        onSuccess={() => {
          toast({
            title: "Unidade atualizada",
            description: "A unidade foi atualizada com sucesso.",
          });
          navigate("/regions/units");
        }}
      />
    </div>
  );
}
