import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Calendar, Clock, Tag } from "lucide-react";

interface DynamicField {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

const DYNAMIC_FIELDS: DynamicField[] = [
  {
    key: "{{nome}}",
    label: "Nome Completo",
    description: "Nome completo do cliente",
    icon: User,
  },
  {
    key: "{{primeiro_nome}}",
    label: "Primeiro Nome",
    description: "Apenas o primeiro nome do cliente",
    icon: User,
  },
  {
    key: "{{telefone}}",
    label: "Telefone",
    description: "Número de telefone do cliente",
    icon: User,
  },
  {
    key: "{{email}}",
    label: "E-mail",
    description: "Endereço de e-mail do cliente",
    icon: User,
  },
  {
    key: "{{origem}}",
    label: "Origem do Lead",
    description: "De onde veio o lead (ex: Facebook, Google)",
    icon: Tag,
  },
  {
    key: "{{dia_agendamento}}",
    label: "Dia do Agendamento",
    description: "Data do agendamento (dia/mês/ano)",
    icon: Calendar,
  },
  {
    key: "{{horario_agendamento}}",
    label: "Horário do Agendamento",
    description: "Horário do agendamento (hora:minuto)",
    icon: Clock,
  },
  {
    key: "{{endereco}}",
    label: "Endereço da Unidade",
    description: "Endereço completo da unidade",
    icon: MapPin,
  },
  {
    key: "{{unidade}}",
    label: "Nome da Unidade",
    description: "Nome da unidade",
    icon: MapPin,
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
            "Olá {'{{primeiro_nome}}'}, sua consulta está marcada para {'{{dia_agendamento}}'} às {'{{horario_agendamento}}'}. Unidade: {'{{endereco}}'}"
          </div>
        </div>
      </CardContent>
    </Card>
  );
}