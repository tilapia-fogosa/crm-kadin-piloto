import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TipoFuncionalidade, FuncionalidadeUnidade } from "@/hooks/useFuncionalidadesUnidade";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Definir funcionalidades disponíveis
const FUNCIONALIDADES_DISPONIVEIS: { tipo: TipoFuncionalidade; nome: string; descricao: string }[] = [
  {
    tipo: 'assistente_whatsapp',
    nome: 'Assistente WhatsApp',
    descricao: 'Bot de atendimento automático no WhatsApp'
  },
  {
    tipo: 'google_agenda',
    nome: 'Google Agenda',
    descricao: 'Integração com Google Calendar'
  },
  {
    tipo: 'relatorios_avancados',
    nome: 'Relatórios Avançados',
    descricao: 'Acesso a relatórios detalhados e dashboards'
  },
  {
    tipo: 'integracao_telefonia_net2phone',
    nome: 'Integração Net2Phone',
    descricao: 'Sistema de telefonia integrado'
  },
  {
    tipo: 'automacao_whatsapp',
    nome: 'Automações de WhatsApp',
    descricao: 'Fluxos automáticos de conversação no WhatsApp'
  },
  {
    tipo: 'pos_venda_comercial',
    nome: 'Pós-venda Comercial',
    descricao: 'Ferramentas para gestão e acompanhamento pós-venda'
  }
];

interface Unit {
  id: string;
  name: string;
  unit_number: number;
}

export default function FuncionalidadesUnidadePage() {
  console.log('FuncionalidadesUnidadePage: Inicializando página');
  
  const queryClient = useQueryClient();

  // Buscar unidades
  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ['units-admin'],
    queryFn: async () => {
      console.log('Buscando todas as unidades para admin');
      
      const { data, error } = await supabase
        .from('units')
        .select('id, name, unit_number')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar unidades:', error);
        throw error;
      }

      console.log('Unidades encontradas:', data);
      return data as Unit[];
    },
  });

  // Buscar funcionalidades de todas as unidades
  const { data: funcionalidades, isLoading: funcionalidadesLoading } = useQuery({
    queryKey: ['funcionalidades-todas-unidades'],
    queryFn: async () => {
      console.log('Buscando todas as funcionalidades');
      
      const { data, error } = await supabase
        .from('funcionalidades_unidade')
        .select('*');

      if (error) {
        console.error('Erro ao buscar funcionalidades:', error);
        throw error;
      }

      console.log('Funcionalidades encontradas:', data);
      return data as FuncionalidadeUnidade[];
    },
  });

  // Mutação para habilitar/desabilitar funcionalidade (usando UPSERT)
  const toggleFuncionalidadeMutation = useMutation({
    mutationFn: async ({ 
      unitId, 
      tipoFuncionalidade, 
      ativa 
    }: { 
      unitId: string; 
      tipoFuncionalidade: TipoFuncionalidade; 
      ativa: boolean;
    }) => {
      console.log(`Alterando funcionalidade ${tipoFuncionalidade} para unidade ${unitId}: ${ativa ? 'ativar' : 'desativar'}`);
      
      const user = await supabase.auth.getUser();
      
      // Usar UPSERT para evitar conflitos de constraint duplicada
      const { error } = await supabase
        .from('funcionalidades_unidade')
        .upsert({
          unit_id: unitId,
          tipo_funcionalidade: tipoFuncionalidade,
          ativa: ativa,
          usuario_habilitou: user.data.user?.id,
          configuracao: {},
          data_habilitacao: ativa ? new Date().toISOString() : null
        }, {
          onConflict: 'unit_id,tipo_funcionalidade'
        });

      if (error) {
        console.error('Erro no upsert:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['funcionalidades-todas-unidades'] });
      toast({
        title: "Funcionalidade atualizada",
        description: `${variables.tipoFuncionalidade} foi ${variables.ativa ? 'habilitada' : 'desabilitada'} com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Erro ao alterar funcionalidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a funcionalidade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Verificar se uma funcionalidade está ativa para uma unidade
  const isFuncionalidadeAtiva = (unitId: string, tipoFuncionalidade: TipoFuncionalidade): boolean => {
    return funcionalidades?.some(
      func => func.unit_id === unitId && 
               func.tipo_funcionalidade === tipoFuncionalidade && 
               func.ativa
    ) || false;
  };

  const isLoading = unitsLoading || funcionalidadesLoading;

  return (
    <AdminRoute>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Funcionalidades por Unidade</h1>
            <p className="text-muted-foreground mt-2">
              Configure quais funcionalidades estão disponíveis para cada unidade
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Legenda das funcionalidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Funcionalidades Disponíveis
                </CardTitle>
                <CardDescription>
                  Use a tabela abaixo para habilitar/desabilitar funcionalidades por unidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {FUNCIONALIDADES_DISPONIVEIS.map((func) => (
                    <div key={func.tipo} className="flex items-center p-3 border rounded-lg bg-muted/20">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{func.nome}</div>
                        <div className="text-xs text-muted-foreground">{func.descricao}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">{func.tipo}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabela de funcionalidades por unidade */}
            <Card>
              <CardHeader>
                <CardTitle>Configuração por Unidade</CardTitle>
                <CardDescription>
                  Matriz de funcionalidades - passe o mouse sobre as colunas para destacar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20 font-medium">Nº</TableHead>
                        <TableHead className="min-w-[200px] font-medium">Unidade</TableHead>
                        {FUNCIONALIDADES_DISPONIVEIS.map((func, index) => (
                          <TableHead 
                            key={func.tipo} 
                            className={`w-32 text-center font-medium transition-colors hover:bg-muted/50 cursor-pointer
                              ${index % 2 === 0 ? 'bg-muted/20' : 'bg-background'}
                            `}
                            title={func.descricao}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-medium">{func.nome}</span>
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {func.tipo}
                              </Badge>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {units?.map((unit) => (
                        <TableRow key={unit.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-muted-foreground">
                            #{unit.unit_number}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <div className="text-sm">{unit.name}</div>
                              <div className="text-xs text-muted-foreground">Unidade #{unit.unit_number}</div>
                            </div>
                          </TableCell>
                          {FUNCIONALIDADES_DISPONIVEIS.map((func, index) => {
                            const isAtiva = isFuncionalidadeAtiva(unit.id, func.tipo);
                            return (
                              <TableCell 
                                key={func.tipo} 
                                className={`text-center transition-colors hover:bg-muted/50
                                  ${index % 2 === 0 ? 'bg-muted/20' : 'bg-background'}
                                `}
                              >
                                <div className="flex justify-center">
                                  <Switch
                                    checked={isAtiva}
                                    onCheckedChange={(checked) => {
                                      toggleFuncionalidadeMutation.mutate({
                                        unitId: unit.id,
                                        tipoFuncionalidade: func.tipo,
                                        ativa: checked
                                      });
                                    }}
                                    disabled={toggleFuncionalidadeMutation.isPending}
                                  />
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas resumidas */}
            {funcionalidades && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Ativação</CardTitle>
                  <CardDescription>Quantidade de unidades com cada funcionalidade habilitada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {FUNCIONALIDADES_DISPONIVEIS.map((func) => {
                      const count = funcionalidades.filter(
                        f => f.tipo_funcionalidade === func.tipo && f.ativa
                      ).length;
                      const total = units?.length || 0;
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      
                      return (
                        <div key={func.tipo} className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-primary">{count}</div>
                          <div className="text-xs text-muted-foreground mb-1">de {total} unidades</div>
                          <div className="text-sm font-medium">{func.nome}</div>
                          <div className="text-xs text-muted-foreground">({percentage}%)</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminRoute>
  );
}