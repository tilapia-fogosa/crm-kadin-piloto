
import { UnitForm } from "@/components/units/unit-form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function NewUnitPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Cadastrar Nova Unidade</h1>
      
      <UnitForm
        onSuccess={() => {
          toast({
            title: "Unidade criada",
            description: "A unidade foi criada com sucesso.",
          });
          navigate("/regions/units");
        }}
      />
    </div>
  );
}
