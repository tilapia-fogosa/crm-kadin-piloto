
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RegionsTable } from "@/components/regions/regions-table";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [regionName, setRegionName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedRegion) {
        // Atualizar região existente
        const { error } = await supabase
          .from('regions')
          .update({ name: regionName })
          .eq('id', selectedRegion.id);

        if (error) throw error;
        
        toast({
          title: "Região atualizada",
          description: "A região foi atualizada com sucesso.",
        });
      } else {
        // Criar nova região
        const { error } = await supabase
          .from('regions')
          .insert([{ name: regionName }]);

        if (error) throw error;
        
        toast({
          title: "Região criada",
          description: "A nova região foi criada com sucesso.",
        });
      }

      // Limpar estado e fechar diálogo
      setRegionName("");
      setSelectedRegion(null);
      setIsDialogOpen(false);
      
      // Atualizar dados da tabela
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar a região.",
      });
      console.error('Erro ao salvar região:', error);
    }
  };

  const handleEdit = (region: any) => {
    setSelectedRegion(region);
    setRegionName(region.name);
    setIsDialogOpen(true);
  };

  const handleDelete = async (regionId: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .update({ active: false })
        .eq('id', regionId);

      if (error) throw error;

      toast({
        title: "Região excluída",
        description: "A região foi excluída com sucesso.",
      });

      // Atualizar dados da tabela
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao excluir a região.",
      });
      console.error('Erro ao excluir região:', error);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Regiões</h2>
        <Button onClick={() => {
          setSelectedRegion(null);
          setRegionName("");
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Nova Região
        </Button>
      </div>
      
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <RegionsTable onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRegion ? "Editar Região" : "Nova Região"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Região</Label>
              <Input
                id="name"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder="Digite o nome da região"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {selectedRegion ? "Salvar Alterações" : "Criar Região"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
