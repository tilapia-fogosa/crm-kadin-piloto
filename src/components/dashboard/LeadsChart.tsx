import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";
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
  const { selectedUnitId } = useUnit();
  
  const { data, isLoading } = useQuery({
    queryKey: ['leads-by-month-and-source', selectedUnitId],
    queryFn: async () => {
      console.log('Buscando leads do gráfico para unidade:', selectedUnitId);
      
      if (!selectedUnitId) {
        console.log('Nenhuma unidade selecionada para o gráfico');
        return { data: [], sources: [] };
      }

      const now = new Date();
      const sixMonthsAgo = subMonths(now, 6);

      const { data: leads, error } = await supabase
        .from('clients')
        .select('created_at, lead_source')
        .eq('active', true)
        .eq('unit_id', selectedUnitId)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar leads para o gráfico:', error);
        throw error;
      }

      console.log('Leads encontrados para o gráfico:', leads?.length);

      const leadsByMonth = leads?.reduce((acc: any, lead) => {
        const date = new Date(lead.created_at);
        const monthKey = format(date, 'MMM/yy', { locale: ptBR });
        
        if (!acc[monthKey]) {
          acc[monthKey] = {};
        }
        
        const source = lead.lead_source || 'outros';
        acc[monthKey][source] = (acc[monthKey][source] || 0) + 1;
        acc[monthKey].month = monthKey;
        
        return acc;
      }, {});

      const chartData = Object.values(leadsByMonth || {});
      
      const allSources = Array.from(
        new Set(
          leads?.map(lead => lead.lead_source || 'outros') || []
        )
      );

      return {
        data: chartData,
        sources: allSources
      };
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!selectedUnitId
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
