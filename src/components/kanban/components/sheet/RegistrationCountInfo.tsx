/**
 * Componente que exibe informações sobre múltiplos cadastros do cliente
 * 
 * Log: Exibe quantidade de cadastros e histórico de datas
 * Etapas:
 * 1. Só renderiza quando há 2 ou mais cadastros
 * 2. Exibe quantidade total em destaque (cor de alerta)
 * 3. Formata e exibe histórico de datas dos cadastros
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Calendar } from "lucide-react"
import { KanbanCard } from "../../types"

interface RegistrationCountInfoProps {
  card: KanbanCard
}

/**
 * Formata o histórico de cadastros para exibição
 * Entrada esperada: "2º cadastro - 15/11/2024\n3º cadastro - 03/12/2024"
 */
function parseHistoricoCadastros(historico: string): string[] {
  if (!historico) return []
  
  // Split por quebra de linha e filtra linhas vazias
  return historico
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

export function RegistrationCountInfo({ card }: RegistrationCountInfoProps) {
  // Log: Verificando se deve exibir o componente
  console.log('RegistrationCountInfo - quantidadeCadastros:', card.quantidadeCadastros)
  
  // Só exibe quando há 2 ou mais cadastros
  if (!card.quantidadeCadastros || card.quantidadeCadastros < 2) {
    return null
  }

  const historicoItems = parseHistoricoCadastros(card.historicoCadastros || '')

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          Número de Cadastros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quantidade em destaque */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Quantidade:</span>
          <span className="text-2xl font-bold text-primary">
            {card.quantidadeCadastros}
          </span>
        </div>

        {/* Histórico de cadastros */}
        {historicoItems.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Histórico:
            </span>
            <ul className="space-y-1 pl-2">
              {historicoItems.map((item, index) => (
                <li 
                  key={index} 
                  className="text-sm text-foreground flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
