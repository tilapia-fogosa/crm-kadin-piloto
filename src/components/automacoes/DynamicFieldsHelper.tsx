import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Calendar, Tag } from "lucide-react";

interface DynamicField {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

const DYNAMIC_FIELDS: DynamicField[] = [
  {
    key: "{nome}",
    label: "Nome Completo",
    description: "Nome completo do cliente",
    icon: User,
  },
  {
    key: "{primeiro_nome}",
    label: "Primeiro Nome",
    description: "Apenas o primeiro nome do cliente",
    icon: User,
  },
  {
    key: "{lead_source}",
    label: "Origem do Lead",
    description: "De onde veio o lead (ex: Facebook, Google)",
    icon: Tag,
  },
  {
    key: "{scheduled_date}",
    label: "Data Agendamento",
    description: "Data e hora do agendamento",
    icon: Calendar,
  },
];

interface DynamicFieldsHelperProps {
  onInsertField: (field: string) => void;
}

// Log: Helper para inserção de campos dinâmicos
export function DynamicFieldsHelper({ onInsertField }: DynamicFieldsHelperProps) {
  console.log('DynamicFieldsHelper: Renderizando helper de campos dinâmicos');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Campos Dinâmicos Disponíveis
        </CardTitle>
        <CardDescription className="text-xs">
          Clique nos botões abaixo para inserir campos que serão substituídos pelos dados reais do cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {DYNAMIC_FIELDS.map((field) => {
            const IconComponent = field.icon;
            return (
              <Button
                key={field.key}
                type="button"
                variant="outline"
                size="sm"
                className="justify-start h-auto py-2 px-3"
                onClick={() => {
                  console.log('DynamicFieldsHelper: Inserindo campo', field.key);
                  onInsertField(field.key);
                }}
              >
                <div className="flex items-start gap-2 text-left">
                  <IconComponent className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="text-xs font-medium">{field.label}</div>
                    <div className="text-xs text-muted-foreground">{field.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="text-xs font-medium mb-1">Exemplo de uso:</div>
          <div className="text-xs text-muted-foreground">
            "Olá {'{primeiro_nome}'}, sua consulta está marcada para {'{scheduled_date}'}. Origem: {'{lead_source}'}"
          </div>
        </div>
      </CardContent>
    </Card>
  );
}