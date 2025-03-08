
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useUnitsFilter } from "./hooks/useUnitsFilter"

export interface UnitTableData {
  name: string
  state: string
  city: string
  unit_number: number
}

export function UnitsTableSection() {
  console.log('Initializing UnitsTableSection')
  
  const { data: units = [], isLoading, error } = useQuery({
    queryKey: ['api-docs-units'],
    queryFn: async () => {
      console.log('Fetching units data for API docs')
      
      const { data, error } = await supabase
        .from('units')
        .select('name, state, city, unit_number')
        .eq('active', true)
        .order('unit_number', { ascending: true })
      
      if (error) {
        console.error('Error fetching units:', error)
        throw error
      }
      
      console.log('Units data fetched:', data)
      return data as UnitTableData[]
    }
  })

  const { searchTerm, setSearchTerm, filteredUnits } = useUnitsFilter(units)

  if (isLoading) {
    return <div>Carregando unidades...</div>
  }

  if (error) {
    return <div>Erro ao carregar unidades. Por favor, tente novamente.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Input
          type="search"
          placeholder="Buscar por unidade, estado ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Unidade</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Nº Integração</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUnits.map((unit) => (
            <TableRow key={unit.unit_number}>
              <TableCell>{unit.name}</TableCell>
              <TableCell>{unit.state}</TableCell>
              <TableCell>{unit.city}</TableCell>
              <TableCell>{unit.unit_number}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
