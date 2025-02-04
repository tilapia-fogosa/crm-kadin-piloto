import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type LeadSource = {
  id: string;
  name: string;
  is_system: boolean;
};

interface LeadSourceFormProps {
  onClose: () => void;
  initialData?: LeadSource | null;
}

export function LeadSourceForm({ onClose, initialData }: LeadSourceFormProps) {
  const [name, setName] = React.useState(initialData?.name || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const id = initialData?.id || name.toLowerCase().replace(/\s+/g, '-');
      
      if (initialData) {
        const { error } = await supabase
          .from('lead_sources')
          .update({ 
            name,
            created_by: session.session.user.id 
          })
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lead_sources')
          .insert([{ 
            id, 
            name,
            created_by: session.session.user.id 
          }]);

        if (error) throw error;
      }
      
      toast({
        title: `Origem ${initialData ? 'atualizada' : 'adicionada'} com sucesso!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['leadSources'] });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar origem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar origem",
        description: "Ocorreu um erro ao tentar salvar a origem do lead.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nome da Origem
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
}