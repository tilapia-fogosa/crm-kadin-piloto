
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UnitsList } from "@/components/units/units-list"
import { UnitDialog } from "@/components/units/unit-dialog"
import { useState } from "react"

export default function UnitsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<any>(null)

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Unidades</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Unidade
        </Button>
      </div>

      <UnitsList onEdit={setEditingUnit} />

      <UnitDialog 
        open={isDialogOpen || !!editingUnit} 
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingUnit(null)
        }}
        unit={editingUnit}
      />
    </div>
  )
}
