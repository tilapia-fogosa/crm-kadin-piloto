import React from "react"
import { UnitSelector } from "@/components/UnitSelector"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ClientsHeaderProps {
  onForceRefresh: () => void
}

export const ClientsHeader = React.memo(({ onForceRefresh }: ClientsHeaderProps) => {
  console.log('📋 [ClientsHeader] Renderizando header')
  
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Todos os Clientes</h1>
      <div className="flex items-center gap-2">
        <UnitSelector />
        <Button onClick={onForceRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
    </div>
  )
})

ClientsHeader.displayName = "ClientsHeader"