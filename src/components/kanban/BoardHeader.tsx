
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RefreshCw, Search } from "lucide-react"
import { ActivityDashboard } from "./ActivityDashboard"
import { CalendarDashboard } from "./CalendarDashboard"
import { Input } from "@/components/ui/input"

interface BoardHeaderProps {
  showPendingOnly: boolean
  setShowPendingOnly: (value: boolean) => void
  onRefresh: () => void
  searchTerm: string
  setSearchTerm: (value: string) => void
}

export function BoardHeader({
  showPendingOnly,
  setShowPendingOnly,
  onRefresh,
  searchTerm,
  setSearchTerm,
}: BoardHeaderProps) {
  // Log para rastrear mudanças no termo de pesquisa
  console.log('Termo de pesquisa atual:', searchTerm);
  
  return (
    <div className="flex flex-col bg-[#311D64] p-4 gap-4">
      <div className="grid grid-cols-4 items-center">
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
      
      {/* Campo de pesquisa abaixo do cabeçalho */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Pesquise o contato por nome ou telefone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/10 text-white placeholder:text-gray-400 border-gray-700 focus-visible:ring-primary/50"
        />
      </div>
    </div>
  )
}
