
import { KanbanCard } from "../../types"

interface ClientInformationProps {
  card: KanbanCard
}

export function ClientInformation({ card }: ClientInformationProps) {
  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium text-sm mb-4">Informações do Cliente</h3>
      <div className="space-y-3">
        {/* Unidade em destaque com cor laranja */}
        <div className="flex justify-between items-start">
          <span className="text-sm text-muted-foreground">Unidade:</span>
          <span className="text-sm font-medium text-right text-orange-500 font-bold">{card.unitName || "-"}</span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-sm text-muted-foreground">Origem:</span>
          <span className="text-sm font-medium text-right">{card.leadSource || "-"}</span>
        </div>
        
        {card.registrationName && (
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Registro:</span>
            <span className="text-sm font-medium text-right">{card.registrationName}</span>
          </div>
        )}
        
        <div className="flex justify-between items-start">
          <span className="text-sm text-muted-foreground">Anúncio:</span>
          <span className="text-sm font-medium text-right">{card.original_ad || "-"}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-sm text-muted-foreground">Segmentação:</span>
          <span className="text-sm font-medium text-right">{card.original_adset || "-"}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-sm text-muted-foreground">Observações:</span>
          <span className="text-sm font-medium text-right max-w-[60%] whitespace-pre-wrap">{card.observations || "-"}</span>
        </div>
      </div>
    </div>
  )
}
