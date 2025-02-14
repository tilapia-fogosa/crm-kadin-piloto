
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface UnitsListProps {
  onEdit: (unit: any) => void
}

export function UnitsList({ onEdit }: UnitsListProps) {
  const { toast } = useToast()
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null)

  const { data: units, isLoading, refetch } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          id,
          name,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          postal_code,
          created_at,
          api_key
        `)
        .order('name')

      if (error) throw error
      return data
    }
  })

  const handleDelete = async () => {
    if (!deletingUnitId) return

    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', deletingUnitId)

    if (error) {
      toast({
        title: "Erro ao excluir unidade",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Unidade excluída com sucesso",
    })
    refetch()
    setDeletingUnitId(null)
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Unidade</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>API Key</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units?.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell>{unit.name}</TableCell>
              <TableCell>{unit.city}</TableCell>
              <TableCell>{unit.state}</TableCell>
              <TableCell className="font-mono text-sm">{unit.api_key}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(unit)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingUnitId(unit.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir unidade</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingUnitId(null)}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
