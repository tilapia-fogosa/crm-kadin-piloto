import { AdminRoute } from "@/components/auth/AdminRoute";
import { LossReasonsReport } from "@/components/relatorios/LossReasonsReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RelatoriosAvancadosPage() {
  return (
    <AdminRoute>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Relatórios Avançados</h1>
        <p className="text-muted-foreground mb-8">
          Esta área permite gerar e visualizar relatórios avançados com análises detalhadas 
          de desempenho, conversões e métricas estratégicas do CRM.
        </p>
        
        <Tabs defaultValue="loss-reasons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="loss-reasons">Motivos de Perda</TabsTrigger>
            <TabsTrigger value="conversion" disabled>Conversão</TabsTrigger>
            <TabsTrigger value="performance" disabled>Performance</TabsTrigger>
            <TabsTrigger value="custom" disabled>Personalizado</TabsTrigger>
          </TabsList>

          <TabsContent value="loss-reasons">
            <LossReasonsReport />
          </TabsContent>

          <TabsContent value="conversion">
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Relatórios de Conversão</h3>
              <p className="text-muted-foreground">
                Em desenvolvimento...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Relatórios de Performance</h3>
              <p className="text-muted-foreground">
                Em desenvolvimento...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Relatórios Personalizados</h3>
              <p className="text-muted-foreground">
                Em desenvolvimento...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminRoute>
  );
}