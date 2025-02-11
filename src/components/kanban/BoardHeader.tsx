
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface BoardHeaderProps {
  showPendingOnly: boolean
  setShowPendingOnly: (show: boolean) => void
}

export function BoardHeader({
  showPendingOnly,
  setShowPendingOnly
}: BoardHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel do Consultor</h1>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="pending-filter"
          checked={showPendingOnly}
          onCheckedChange={setShowPendingOnly}
        />
        <Label htmlFor="pending-filter">
          Apenas contatos pendentes/atrasados
        </Label>
      </div>
    </div>
  )
}
