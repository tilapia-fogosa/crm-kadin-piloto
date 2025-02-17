
import { SalesTable } from "@/components/sales/sales-table"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Sale } from "@/components/kanban/types"

export default function SalesPage() {
  const { data: sales, isLoading, refetch } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          client:clients(name),
          consultor:profiles(full_name)
        `)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('sales')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting sale:', error)
      return
    }

    refetch()
  }

  const handleEdit = async (sale: Sale) => {
    const { error } = await supabase
      .from('sales')
      .update(sale)
      .eq('id', sale.id)

    if (error) {
      console.error('Error updating sale:', error)
      return
    }

    refetch()
  }

  if (isLoading) {
    return <div>Carregando vendas...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Vendas</h1>
      <SalesTable 
        sales={sales} 
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  )
}
