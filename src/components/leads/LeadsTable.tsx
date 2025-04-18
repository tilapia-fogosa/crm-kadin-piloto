import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUnit } from "@/contexts/UnitContext";

interface Lead {
  id: string;
  name: string;
  status: string;
  created_at: string;
  client_activities: {
    created_at: string;
  }[];
  last_activity: string;
}

export default function LeadsTable() {
  const { selectedUnitId } = useUnit();
  
  const { data: leads, isLoading } = useQuery({
    queryKey: ['recent-leads', selectedUnitId],
    queryFn: async () => {
      console.log('Buscando leads recentes para unidade:', selectedUnitId);
      
      if (!selectedUnitId) {
        console.log('Nenhuma unidade selecionada para leads recentes');
        return [];
      }

      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          status,
          created_at,
          client_activities (
            created_at
          )
        `)
        .eq('active', true)
        .eq('unit_id', selectedUnitId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (clientsError) throw clientsError;

      console.log('Leads recentes encontrados:', clients?.length);

      return clients.map(client => ({
        ...client,
        last_activity: client.client_activities?.[0]?.created_at || client.created_at
      }));
    },
    enabled: !!selectedUnitId,
    refetchInterval: 5000
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'novo-cadastro': 'Novo Cadastro',
      'tentativa-contato': 'Tentativa de Contato',
      'contato-efetivo': 'Contato Efetivo',
      'atendimento-agendado': 'Atendimento Agendado',
      'atendimento-realizado': 'Atendimento Realizado'
    };
    return statusMap[status] || status;
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último Contato</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads?.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{formatStatus(lead.status)}</TableCell>
              <TableCell>{formatTimeAgo(lead.last_activity)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
