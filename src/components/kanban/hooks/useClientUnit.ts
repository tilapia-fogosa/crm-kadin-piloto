
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useClientUnit = (clientId: string) => {
  const [unitId, setUnitId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUnitId = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('unit_id')
          .eq('id', clientId)
          .single()

        if (error) throw error

        setUnitId(data.unit_id)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching unit_id:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setIsLoading(false)
      }
    }

    if (clientId) {
      fetchUnitId()
    }
  }, [clientId])

  return { unitId, isLoading, error }
}
