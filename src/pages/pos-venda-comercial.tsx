import { RotaProtegidaPorFuncionalidade } from "@/components/features/RotaProtegidaPorFuncionalidade";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Smile
} from "lucide-react";

/**
 * Página de Pós-venda Comercial
 * Log: Landing page da funcionalidade de pós-venda comercial com seções informativas
 */
export default function PosVendaComercialPage() {
  console.log('PosVendaComercialPage: Renderizando página de pós-venda comercial');

  return (
    <RotaProtegidaPorFuncionalidade 
      funcionalidade="pos_venda_comercial"
      mostrarAcessoNegado={true}
    >
      <div className="container py-8 space-y-8">
        {/* Header Principal */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-foreground">Pós-venda Comercial</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transforme seus clientes em embaixadores da marca através de estratégias 
            inteligentes de acompanhamento e fidelização pós-venda.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Funcionalidade em Desenvolvimento
          </Badge>
        </div>

        {/* Cards de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Acompanhamento de Clientes */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 text-primary mr-2" />
                Acompanhamento de Clientes
              </CardTitle>
              <CardDescription>
                Sistema inteligente de follow-up pós-matrícula
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Timeline de acompanhamento automático
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Histórico completo de interações
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Alertas de contato programados
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Segmentação por perfil do cliente
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Métricas de Satisfação */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smile className="h-6 w-6 text-primary mr-2" />
                Métricas de Satisfação
              </CardTitle>
              <CardDescription>
                Acompanhe o nível de satisfação dos seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                  Pesquisas de satisfação automatizadas
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                  NPS (Net Promoter Score) em tempo real
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                  Dashboards de performance
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                  Relatórios de tendências
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Gestão de Renovações */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-6 w-6 text-primary mr-2" />
                Gestão de Renovações
              </CardTitle>
              <CardDescription>
                Antecipe e gerencie renovações de contratos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                  Alertas de vencimento antecipados
                </li>
                <li className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                  Campanhas de renovação automáticas
                </li>
                <li className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                  Análise de risco de cancelamento
                </li>
                <li className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                  Propostas personalizadas
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Campanhas de Retenção */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 text-primary mr-2" />
                Campanhas de Retenção
              </CardTitle>
              <CardDescription>
                Estratégias proativas para retenção de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Target className="h-4 w-4 text-purple-500 mr-2" />
                  Campanhas segmentadas por perfil
                </li>
                <li className="flex items-center">
                  <Target className="h-4 w-4 text-purple-500 mr-2" />
                  Ofertas especiais personalizadas
                </li>
                <li className="flex items-center">
                  <Target className="h-4 w-4 text-purple-500 mr-2" />
                  Programas de fidelidade
                </li>
                <li className="flex items-center">
                  <Target className="h-4 w-4 text-purple-500 mr-2" />
                  Análise de efetividade
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Analytics Avançados */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-6 w-6 text-primary mr-2" />
                Analytics Avançados
              </CardTitle>
              <CardDescription>
                Insights profundos sobre o comportamento pós-venda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-green-600 mr-2" />
                  Lifetime Value (LTV) dos clientes
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-green-600 mr-2" />
                  Taxa de retenção por segmento
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-green-600 mr-2" />
                  Análise de churn prediction
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-green-600 mr-2" />
                  ROI das campanhas de retenção
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Centro de Relacionamento */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 text-primary mr-2" />
                Centro de Relacionamento
              </CardTitle>
              <CardDescription>
                Hub centralizado para gestão do relacionamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  Portal do cliente personalizado
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  Sistema de tickets e suporte
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  Base de conhecimento interativa
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  Comunicação multicanal integrada
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Benefícios */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Benefícios do Pós-venda Comercial
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Resultados comprovados para o seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">+35%</div>
                <div className="text-sm text-muted-foreground">Taxa de Retenção</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">+50%</div>
                <div className="text-sm text-muted-foreground">Lifetime Value</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">-25%</div>
                <div className="text-sm text-muted-foreground">Taxa de Churn</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">+40%</div>
                <div className="text-sm text-muted-foreground">Satisfação do Cliente</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="text-center bg-muted/30">
          <CardHeader>
            <CardTitle className="text-xl">Em Breve!</CardTitle>
            <CardDescription>
              Esta funcionalidade está sendo desenvolvida especialmente para otimizar 
              seu processo de pós-venda e maximizar a retenção de clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fique atento às próximas atualizações do sistema para ter acesso 
              a todas essas funcionalidades revolucionárias.
            </p>
          </CardContent>
        </Card>
      </div>
    </RotaProtegidaPorFuncionalidade>
  );
}