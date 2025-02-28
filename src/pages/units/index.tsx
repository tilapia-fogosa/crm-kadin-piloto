
import { UnitsTable } from "@/components/units/units-table"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Unit } from "@/types/unit"

export default function UnitsPage() {
  console.log('Renderizando página de unidades')
  const { toast } = useToast()
  
  const { data: units, isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      console.log('Buscando unidades...')
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          region:regions(name)
        `)
        .eq('active', true)
        .order('name')
      
      if (error) {
        console.error('Erro ao buscar unidades:', error)
        throw error
      }
      
      console.log('Unidades obtidas:', data)
      return data
    }
  })

  const handleEdit = (unit: Unit) => {
    console.log('Edição temporariamente desabilitada:', unit)
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de unidades está temporariamente desabilitada.",
    })
  }

  const handleDelete = async (unit: Unit) => {
    try {
      console.log('Tentando remover unidade:', unit)
      const { error } = await supabase
        .from('units')
        .update({ active: false })
        .eq('id', unit.id)

      if (error) throw error

      toast({
        title: "Unidade removida",
        description: "A unidade foi removida com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao remover unidade:', error)
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar remover a unidade.",
      })
    }
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Unidades</h1>
      <UnitsTable 
        units={units || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
