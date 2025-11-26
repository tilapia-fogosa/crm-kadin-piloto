/**
 * Formulário para criar mensagens automáticas
 * 
 * Log: Componente para criar novas mensagens automáticas do WhatsApp
 * Etapas:
 * 1. Formulário com campos: nome, mensagem
 * 2. Validação básica dos campos
 * 3. Por enquanto apenas cria a mensagem (sem integração com banco)
 * 4. Exibe toast de confirmação ao salvar
 * 
 * Utiliza cores do sistema: card, input, button
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AutoMessageForm() {
  console.log('AutoMessageForm: Renderizando formulário de mensagem automática');

  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('AutoMessageForm: Criando mensagem automática:', { nome, mensagem });

    // Validação básica
    if (!nome.trim() || !mensagem.trim()) {
      console.error('AutoMessageForm: Campos obrigatórios não preenchidos');
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Por enquanto apenas exibe toast (futura integração com banco)
    toast.success('Mensagem automática criada com sucesso!');
    
    // Limpar formulário
    setNome("");
    setMensagem("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Mensagem Automática</CardTitle>
        <CardDescription>
          Crie mensagens automáticas para envio via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da mensagem */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Mensagem *</Label>
            <Input
              id="nome"
              placeholder="Ex: Boas-vindas"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          {/* Conteúdo da mensagem */}
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem *</Label>
            <Textarea
              id="mensagem"
              placeholder="Digite a mensagem que será enviada automaticamente..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Dica: Use variáveis como {"{{nome}}"} para personalizar a mensagem
            </p>
          </div>

          {/* Botão de salvar */}
          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Criar Mensagem Automática
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
