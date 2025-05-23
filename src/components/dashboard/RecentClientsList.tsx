
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUnit } from "@/contexts/UnitContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RecentClientsList() {
  console.log("Rendering RecentClientsList component");
  const { selectedUnitId } = useUnit();
  
  const { data: recentClients, isLoading } = useQuery({
    queryKey: ['recent-clients', selectedUnitId],
    queryFn: async () => {
      console.log('Fetching recent clients for unit:', selectedUnitId);
      
      if (!selectedUnitId) {
        console.log('No unit selected, returning empty array');
        return [];
      }

      const { data: clients, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          created_at,
          status,
          client_activities (
            created_at
          )
        `)
        .eq('active', true)
        .eq('unit_id', selectedUnitId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent clients:', error);
        throw error;
      }

      console.log('Recent clients fetched:', clients?.length);

      return clients.map(client => ({
        ...client,
        lastContactTime: client.client_activities?.length > 0
          ? Math.max(...client.client_activities.map(a => new Date(a.created_at).getTime()))
          : new Date(client.created_at).getTime()
      }));
    },
    enabled: !!selectedUnitId
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-6">
        <h3 className="text-md font-semibold">Últimos 10 Clientes</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Nome do Cliente</TableHead>
            <TableHead className="text-xs">Data do Cadastro</TableHead>
            <TableHead className="text-xs">Status Atual</TableHead>
            <TableHead className="text-xs">Último Contato</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentClients?.map((client) => (
            <TableRow key={client.id} className="text-xs">
              <TableCell>{client.name}</TableCell>
              <TableCell>
                {new Date(client.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{client.status}</TableCell>
              <TableCell>
                {formatDistanceToNow(client.lastContactTime, {
                  addSuffix: true,
                  locale: ptBR
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
