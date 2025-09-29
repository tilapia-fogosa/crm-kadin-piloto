import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"

export interface ScheduleOccupation {
  id: string
  unit_id: string
  title: string
  description?: string
  start_datetime: string
  duration_minutes: number
  created_by: string
  created_at: string
  updated_at: string
  active: boolean
  created_by_name?: string
}

export interface CreateOccupationData {
  title: string
  description?: string
  start_datetime: string
  duration_minutes: number
  unit_id: string
}

export function useScheduleOccupations(unitId?: string) {
  const [occupations, setOccupations] = useState<ScheduleOccupation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Log: Buscar ocupações da agenda
  console.log('useScheduleOccupations - Unidade:', unitId);

  const fetchOccupations = async () => {
    if (!unitId) {
      console.log('useScheduleOccupations - Nenhuma unidade selecionada');
      setOccupations([])
      return
    }

    setIsLoading(true)
    console.log('useScheduleOccupations - Buscando ocupações para unidade:', unitId);

    try {
      const { data, error } = await supabase
        .from('schedule_occupations')
        .select('*')
        .eq('unit_id', unitId)
        .eq('active', true)
        .order('start_datetime', { ascending: true })

      if (error) {
        console.error('Erro ao buscar ocupações:', error);
        throw error
      }

      // Buscar nomes dos criadores separadamente
      const userIds = [...new Set(data.map(o => o.created_by))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      // Formatar dados com nome do criador
      const formattedOccupations = data.map(occupation => ({
        ...occupation,
        created_by_name: profiles?.find(p => p.id === occupation.created_by)?.full_name || 'Usuário não identificado'
      }))

      console.log('useScheduleOccupations - Ocupações encontradas:', formattedOccupations.length);
      setOccupations(formattedOccupations)
    } catch (error) {
      console.error('Erro ao carregar ocupações:', error);
      toast({
        title: "Erro ao carregar ocupações",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      })
      setOccupations([])
    } finally {
      setIsLoading(false)
    }
  }

  const createOccupation = async (data: CreateOccupationData) => {
    console.log('useScheduleOccupations - Criando ocupação:', data);

    try {
      const { error } = await supabase
        .from('schedule_occupations')
        .insert([{
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        }])

      if (error) {
        console.error('Erro ao criar ocupação:', error);
        throw error
      }

      console.log('useScheduleOccupations - Ocupação criada com sucesso');
      toast({
        title: "Ocupação criada",
        description: "A ocupação foi criada com sucesso",
      })

      // Recarregar ocupações
      await fetchOccupations()
    } catch (error) {
      console.error('Erro ao criar ocupação:', error);
      toast({
        title: "Erro ao criar ocupação",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateOccupation = async (id: string, data: Partial<CreateOccupationData>) => {
    console.log('useScheduleOccupations - Atualizando ocupação:', id, data);

    try {
      const { error } = await supabase
        .from('schedule_occupations')
        .update(data)
        .eq('id', id)

      if (error) {
        console.error('Erro ao atualizar ocupação:', error);
        throw error
      }

      console.log('useScheduleOccupations - Ocupação atualizada com sucesso');
      toast({
        title: "Ocupação atualizada",
        description: "A ocupação foi atualizada com sucesso",
      })

      // Recarregar ocupações
      await fetchOccupations()
    } catch (error) {
      console.error('Erro ao atualizar ocupação:', error);
      toast({
        title: "Erro ao atualizar ocupação",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteOccupation = async (id: string) => {
    console.log('useScheduleOccupations - Deletando ocupação:', id);

    try {
      const { error } = await supabase
        .from('schedule_occupations')
        .update({ active: false })
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar ocupação:', error);
        throw error
      }

      console.log('useScheduleOccupations - Ocupação deletada com sucesso');
      toast({
        title: "Ocupação removida",
        description: "A ocupação foi removida com sucesso",
      })

      // Recarregar ocupações
      await fetchOccupations()
    } catch (error) {
      console.error('Erro ao deletar ocupação:', error);
      toast({
        title: "Erro ao remover ocupação",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      })
      throw error
    }
  }

  useEffect(() => {
    fetchOccupations()
  }, [unitId])

  return {
    occupations,
    isLoading,
    createOccupation,
    updateOccupation,
    deleteOccupation,
    refreshOccupations: fetchOccupations
  }
}