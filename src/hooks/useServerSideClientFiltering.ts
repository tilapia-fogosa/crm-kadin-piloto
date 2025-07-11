import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { format, isValid, parseISO, endOfDay, startOfDay } from 'date-fns'

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

type ClientFilters = {
  dateRange: DateRange | null
  status: string | null
  leadSource: string | null
  originalAd: string | null
  registrationName: string | null
}

const initialFilters: ClientFilters = {
  dateRange: null,
  status: null,
  leadSource: null,
  originalAd: null,
  registrationName: null
}

export function useServerSideClientFiltering(unitId: string | null) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ClientFilters>(initialFilters)
  const [isFilterActive, setIsFilterActive] = useState(false)
  const itemsPerPage = 100

  console.log('🔍 [useServerSideClientFiltering] Estado atual:', {
    unitId,
    searchTerm,
    currentPage,
    hasFilters: Object.values(filters).some(f => f !== null)
  });

  // Query para buscar clientes paginados
  const { 
    data, 
    isLoading, 
    error,
    refetch,
    isError 
  } = useQuery({
    queryKey: ['clients-paginated', unitId, currentPage, searchTerm, filters],
    queryFn: async () => {
      console.log('🚀 [useServerSideClientFiltering] Executando query paginada');
      
      if (!unitId) {
        console.error('❌ [useServerSideClientFiltering] unitId é null/undefined');
        throw new Error('Unidade não selecionada');
      }

      let query = supabase
        .from('clients')
        .select(`
          id,
          name,
          phone_number,
          email,
          lead_source,
          observations,
          status,
          created_at,
          original_ad,
          original_adset,
          registration_name,
          active,
          unit_id
        `, { count: 'exact' })
        .eq('active', true)
        .eq('unit_id', unitId)
        .order('created_at', { ascending: false })

      // Aplicar filtro de busca por texto
      if (searchTerm && searchTerm.trim()) {
        const normalizedSearch = searchTerm.toLowerCase().trim()
        query = query.or(`name.ilike.%${normalizedSearch}%,phone_number.ilike.%${normalizedSearch}%`)
      }

      // Aplicar filtros específicos
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.leadSource) {
        query = query.eq('lead_source', filters.leadSource)
      }

      if (filters.originalAd) {
        query = query.eq('original_ad', filters.originalAd)
      }

      if (filters.registrationName) {
        query = query.eq('registration_name', filters.registrationName)
      }

      // Aplicar filtro de data
      if (filters.dateRange?.from) {
        const fromDate = startOfDay(filters.dateRange.from).toISOString()
        query = query.gte('created_at', fromDate)
      }

      if (filters.dateRange?.to) {
        const toDate = endOfDay(filters.dateRange.to).toISOString()
        query = query.lte('created_at', toDate)
      }

      // Aplicar paginação
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      
      query = query.range(from, to)

      console.log('📊 [useServerSideClientFiltering] Parâmetros da query:', {
        unitId,
        currentPage,
        from,
        to,
        searchTerm,
        filters
      });

      const { data, error, count } = await query

      if (error) {
        console.error('❌ [useServerSideClientFiltering] Erro do Supabase:', error);
        throw new Error(`Erro na consulta: ${error.message}`);
      }

      console.log('✅ [useServerSideClientFiltering] Dados recebidos:', {
        dataLength: data?.length || 0,
        totalCount: count,
        unitId
      });

      return {
        clients: data || [],
        totalCount: count || 0
      }
    },
    enabled: !!unitId,
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Query separada para buscar opções de filtro (apenas quando necessário)
  const { data: filterOptions } = useQuery({
    queryKey: ['client-filter-options', unitId],
    queryFn: async () => {
      console.log('🎛️ [useServerSideClientFiltering] Buscando opções de filtro');
      
      if (!unitId) {
        return {
          statuses: [],
          leadSources: [],
          originalAds: [],
          registrationNames: []
        };
      }

      const { data, error } = await supabase
        .from('clients')
        .select('status, lead_source, original_ad, registration_name')
        .eq('active', true)
        .eq('unit_id', unitId)

      if (error) {
        console.error('❌ [useServerSideClientFiltering] Erro ao buscar opções:', error);
        return {
          statuses: [],
          leadSources: [],
          originalAds: [],
          registrationNames: []
        };
      }

      const statusSet = new Set<string>()
      const leadSourceSet = new Set<string>()
      const originalAdSet = new Set<string>()
      const registrationNameSet = new Set<string>()

      data?.forEach(client => {
        if (client.status) statusSet.add(client.status)
        if (client.lead_source) leadSourceSet.add(client.lead_source)
        if (client.original_ad) originalAdSet.add(client.original_ad)
        if (client.registration_name) registrationNameSet.add(client.registration_name)
      })

      const options = {
        statuses: Array.from(statusSet).sort(),
        leadSources: Array.from(leadSourceSet).sort(),
        originalAds: Array.from(originalAdSet).sort(),
        registrationNames: Array.from(registrationNameSet).sort()
      };

      console.log('📊 [useServerSideClientFiltering] Opções de filtro carregadas:', {
        statuses: options.statuses.length,
        leadSources: options.leadSources.length,
        originalAds: options.originalAds.length,
        registrationNames: options.registrationNames.length
      });

      return options;
    },
    enabled: !!unitId,
    staleTime: 5 * 60 * 1000, // 5 minutos - opções mudam pouco
  });

  // Calcular total de páginas
  const totalPages = data?.totalCount ? Math.ceil(data.totalCount / itemsPerPage) : 0;

  // Atualizar estado de filtro ativo
  useEffect(() => {
    const hasActiveFilters = filters.dateRange?.from !== undefined || 
      filters.status !== null || 
      filters.leadSource !== null || 
      filters.originalAd !== null || 
      filters.registrationName !== null;
    
    setIsFilterActive(hasActiveFilters);
  }, [filters])

  const applyFilters = useCallback((newFilters: ClientFilters) => {
    console.log('🎛️ [useServerSideClientFiltering] Aplicando novos filtros:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset para primeira página
  }, [])

  const resetFilters = useCallback(() => {
    console.log('🔄 [useServerSideClientFiltering] Resetando todos os filtros');
    setFilters(initialFilters);
    setSearchTerm('');
    setCurrentPage(1);
  }, [])

  const handleForceRefresh = useCallback(async () => {
    console.log('🔄 [useServerSideClientFiltering] Forçando atualização...');
    await refetch();
  }, [refetch]);

  return {
    // Dados
    clients: data?.clients || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    isError,
    error,
    
    // Paginação
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Busca
    searchTerm,
    setSearchTerm,
    
    // Filtros
    filters,
    applyFilters,
    resetFilters,
    isFilterActive,
    filterOptions: filterOptions || {
      statuses: [],
      leadSources: [],
      originalAds: [],
      registrationNames: []
    },
    
    // Ações
    refetch: handleForceRefresh
  }
}