
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RefreshCw, LineChart } from "lucide-react"
import { ActivityDashboard } from "./ActivityDashboard"

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
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-semibold tracking-tight">Painel do Consultor</h1>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="pending-mode"
            checked={showPendingOnly}
            onCheckedChange={setShowPendingOnly}
          />
          <Label htmlFor="pending-mode">Mostrar apenas pendentes</Label>
        </div>

        <div className="flex items-center space-x-2">
          <ActivityDashboard />
          
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
