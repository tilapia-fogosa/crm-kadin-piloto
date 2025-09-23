import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";

export function Comissoes() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-amber-500" />
            Sistema de Comissões
            <Badge variant="outline" className="ml-2">Em Desenvolvimento</Badge>
          </CardTitle>
          <CardDescription>
            Sistema de cálculo e acompanhamento de comissões por vendedor.
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Funcionalidade em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                O sistema de comissões permitirá:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Cálculo automático de comissões por vendedor</li>
                <li>• Acompanhamento de metas e resultados</li>
                <li>• Relatórios detalhados de performance</li>
                <li>• Configuração de regras personalizadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}