import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TipoFuncionalidade, FuncionalidadeUnidade } from "@/hooks/useFuncionalidadesUnidade";

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

  // Mutação para habilitar/desabilitar funcionalidade
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
      
      if (ativa) {
        // Inserir nova funcionalidade
        const { error } = await supabase
          .from('funcionalidades_unidade')
          .insert({
            unit_id: unitId,
            tipo_funcionalidade: tipoFuncionalidade,
            ativa: true,
            usuario_habilitou: (await supabase.auth.getUser()).data.user?.id,
            configuracao: {}
          });

        if (error) throw error;
      } else {
        // Desativar funcionalidade existente
        const { error } = await supabase
          .from('funcionalidades_unidade')
          .update({ ativa: false })
          .eq('unit_id', unitId)
          .eq('tipo_funcionalidade', tipoFuncionalidade);

        if (error) throw error;
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
                  Lista de todas as funcionalidades que podem ser habilitadas por unidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FUNCIONALIDADES_DISPONIVEIS.map((func) => (
                    <div key={func.tipo} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{func.nome}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{func.descricao}</p>
                        </div>
                        <Badge variant="outline">{func.tipo}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Matriz de funcionalidades por unidade */}
            <Card>
              <CardHeader>
                <CardTitle>Configuração por Unidade</CardTitle>
                <CardDescription>
                  Habilite ou desabilite funcionalidades específicas para cada unidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {units?.map((unit) => (
                    <div key={unit.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">{unit.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Unidade #{unit.unit_number}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {FUNCIONALIDADES_DISPONIVEIS.map((func) => {
                          const isAtiva = isFuncionalidadeAtiva(unit.id, func.tipo);
                          return (
                            <div key={func.tipo} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{func.nome}</p>
                                <p className="text-xs text-muted-foreground">{func.tipo}</p>
                              </div>
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
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            {funcionalidades && (
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {FUNCIONALIDADES_DISPONIVEIS.map((func) => {
                      const count = funcionalidades.filter(
                        f => f.tipo_funcionalidade === func.tipo && f.ativa
                      ).length;
                      return (
                        <div key={func.tipo} className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground">{func.nome}</div>
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