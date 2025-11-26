/**
 * Modal para inserir variáveis dinâmicas nas mensagens automáticas
 * 
 * Log: Modal que exibe lista de variáveis disponíveis da tabela clients
 * Etapas:
 * 1. Exibir lista de campos dinâmicos com descrição
 * 2. Ao clicar em uma variável, chama callback para inserir no texto
 * 3. Visual organizado em grid com ícones
 * 
 * Utiliza cores do sistema: card, button, muted-foreground
 */

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, CalendarDays, Clock, Tag, Building } from "lucide-react";

interface DynamicField {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// Variáveis disponíveis da tabela clients
const DYNAMIC_FIELDS: DynamicField[] = [
  {
    key: "{{nome}}",
    label: "Nome Completo",
    description: "Nome completo do cliente",
    icon: <User className="h-4 w-4" />,
  },
  {
    key: "{{primeiro_nome}}",
    label: "Primeiro Nome",
    description: "Apenas o primeiro nome",
    icon: <User className="h-4 w-4" />,
  },
  {
    key: "{{telefone}}",
    label: "Telefone",
    description: "Número de telefone do cliente",
    icon: <Phone className="h-4 w-4" />,
  },
  {
    key: "{{email}}",
    label: "E-mail",
    description: "Endereço de e-mail",
    icon: <Mail className="h-4 w-4" />,
  },
  {
    key: "{{origem}}",
    label: "Origem do Lead",
    description: "De onde o cliente veio",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    key: "{{dia_agendamento}}",
    label: "Dia do Agendamento",
    description: "Data do agendamento (dia/mês/ano)",
    icon: <CalendarDays className="h-4 w-4" />,
  },
  {
    key: "{{horario_agendamento}}",
    label: "Horário do Agendamento",
    description: "Horário do agendamento (hora:minuto)",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    key: "{{unidade}}",
    label: "Unidade",
    description: "Nome da unidade",
    icon: <Building className="h-4 w-4" />,
  },
  {
    key: "{{endereco}}",
    label: "Endereço da Unidade",
    description: "Endereço completo da unidade",
    icon: <Building className="h-4 w-4" />,
  },
];

interface DynamicFieldsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertField: (field: string) => void;
}

export function DynamicFieldsModal({ open, onOpenChange, onInsertField }: DynamicFieldsModalProps) {
  console.log('DynamicFieldsModal: Renderizando modal de variáveis dinâmicas');

  const handleInsert = (field: string) => {
    console.log('DynamicFieldsModal: Inserindo variável:', field);
    onInsertField(field);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Variáveis Dinâmicas</DialogTitle>
          <DialogDescription>
            Clique em uma variável para inseri-la na mensagem. Ela será substituída automaticamente pelos dados do cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {DYNAMIC_FIELDS.map((field) => (
            <Button
              key={field.key}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent"
              onClick={() => handleInsert(field.key)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="text-primary">{field.icon}</div>
                <span className="font-semibold text-sm">{field.label}</span>
              </div>
              <div className="text-xs text-muted-foreground text-left">
                {field.description}
              </div>
              <code className="text-xs bg-muted px-2 py-1 rounded mt-1">
                {field.key}
              </code>
            </Button>
          ))}
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-2">Exemplo de uso:</p>
          <code className="text-xs block bg-background p-3 rounded">
            Olá {`{{primeiro_nome}}`}, tudo bem?<br />
            Sua consulta está marcada para o dia {`{{dia_agendamento}}`} às {`{{horario_agendamento}}`}.<br />
            Estamos na unidade {`{{unidade}}`}.
          </code>
        </div>
      </DialogContent>
    </Dialog>
  );
}
