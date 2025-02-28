
import { UnitsTable } from "@/components/units/units-table"

export default function UnitsPage() {
  console.log('Renderizando página de unidades')
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Unidades</h1>
      <UnitsTable />
    </div>
  )
}
