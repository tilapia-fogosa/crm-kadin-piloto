import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUnit } from "@/contexts/UnitContext";

const sourceColors: Record<string, string> = {
  facebook: "#3b5998",
  instagram: "#e1306c",
  indicacao: "#F97316",
};

const getColorForSource = (source: string, index: number) => {
  if (source.toLowerCase() in sourceColors) {
    return sourceColors[source.toLowerCase()];
  }
  return `hsl(${index * 50}, 70%, 50%)`;
};

export function LeadsChart() {
  const { selectedUnitIds } = useUnit();
  
  const { data, isLoading } = useQuery({
    queryKey: ['leads-by-month-and-source', selectedUnitIds],
    queryFn: async () => {
      console.log('Buscando leads do gráfico para unidades (via RPC):', selectedUnitIds);
      
      if (!selectedUnitIds || selectedUnitIds.length === 0) {
        console.log('Nenhuma unidade selecionada para o gráfico');
        return { data: [], sources: [] };
      }

      // Log: Usando função RPC para obter dados agregados do banco
      const { data: rawData, error } = await supabase
        .rpc('get_leads_by_month_and_source', { 
          p_unit_ids: selectedUnitIds,
          p_months_back: 6
        });

      if (error) {
        console.error('Erro ao buscar leads via RPC:', error);
        throw error;
      }

      console.log('Dados agregados recebidos da RPC:', rawData?.length);

      // Log: Processando dados para formato do gráfico
      const leadsByMonth: Record<string, any> = {};
      const allSources = new Set<string>();

      rawData?.forEach(row => {
        const [year, month] = row.month_year.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthKey = format(date, 'MMM/yy', { locale: ptBR });
        
        if (!leadsByMonth[monthKey]) {
          leadsByMonth[monthKey] = { month: monthKey };
        }
        
        leadsByMonth[monthKey][row.lead_source] = Number(row.lead_count);
        allSources.add(row.lead_source);
      });

      // Log: Garantindo ordem cronológica dos dados
      const sortedData = Object.values(leadsByMonth).sort((a, b) => {
        const dateA = new Date(a.month.split('/').reverse().join('-'));
        const dateB = new Date(b.month.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });

      return {
        data: sortedData,
        sources: Array.from(allSources)
      };
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!selectedUnitIds && selectedUnitIds.length > 0
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Novos Leads por Mês</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novos Leads por Mês</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data?.data}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip />
            <Legend />
            {data?.sources.map((source, index) => (
              <Bar
                key={source}
                dataKey={source}
                name={source.charAt(0).toUpperCase() + source.slice(1)}
                stackId="a"
                fill={getColorForSource(source, index)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
