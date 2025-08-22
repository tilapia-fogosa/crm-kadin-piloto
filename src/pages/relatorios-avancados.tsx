import { AdminRoute } from "@/components/auth/AdminRoute";

export default function RelatoriosAvancadosPage() {
  return (
    <AdminRoute>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Relatórios Avançados</h1>
        <p className="text-muted-foreground mb-8">
          Esta área permite gerar e visualizar relatórios avançados com análises detalhadas 
          de desempenho, conversões e métricas estratégicas do CRM.
        </p>
        
        <div className="bg-card rounded-lg border p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Relatórios em Desenvolvimento</h3>
          <p className="text-muted-foreground">
            Os componentes de relatórios avançados serão implementados em breve.
          </p>
        </div>
      </div>
    </AdminRoute>
  );
}