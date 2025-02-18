
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { RegionForm } from "./region-form";
import { useToast } from "@/hooks/use-toast";

type Region = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
};

export function RegionsTable() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const { data: regions, refetch } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Region[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("regions")
        .update({ active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Região removida com sucesso",
      });

      refetch();
    } catch (error) {
      console.error("Erro ao remover região:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover região",
        description: "Ocorreu um erro ao tentar remover a região.",
      });
    }
  };

  const handleEdit = (region: Region) => {
    setSelectedRegion(region);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setSelectedRegion(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedRegion(null);
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Regiões</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova Região
        </Button>
      </div>

      {showForm && (
        <RegionForm
          initialData={selectedRegion}
          onClose={handleFormClose}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regions?.map((region) => (
              <TableRow key={region.id}>
                <TableCell>{region.name}</TableCell>
                <TableCell>
                  {region.active ? (
                    <span className="text-green-600">Ativa</span>
                  ) : (
                    <span className="text-red-600">Inativa</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(region.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(region)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(region.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
