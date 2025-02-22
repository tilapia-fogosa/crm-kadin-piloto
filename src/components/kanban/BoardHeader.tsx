
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { ActivityDashboard } from "./ActivityDashboard"
import { CalendarDashboard } from "./CalendarDashboard"

interface BoardHeaderProps {
  showPendingOnly: boolean
  setShowPendingOnly: (value: boolean) => void
  onRefresh: () => void
}

export function BoardHeader({
  showPendingOnly,
  setShowPendingOnly,
  onRefresh,
}: BoardHeaderProps) {
  return (
    <div className="grid grid-cols-4 items-center mb-4 bg-secondary rounded-lg p-4">
      <div className="col-span-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Painel do Consultor</h1>
      </div>
      
      <div className="col-span-2 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="pending-mode"
            checked={showPendingOnly}
            onCheckedChange={setShowPendingOnly}
          />
          <Label htmlFor="pending-mode" className="text-white">Mostrar apenas pendentes</Label>
        </div>

        <div className="flex items-center space-x-2">
          <ActivityDashboard />
          <CalendarDashboard />
          
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="col-span-1">
        {/* Espaço reservado para futuros elementos */}
      </div>
    </div>
  )
}
