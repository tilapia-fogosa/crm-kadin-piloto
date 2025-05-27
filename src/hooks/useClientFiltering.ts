
import { useState, useMemo } from 'react'
import { format, isValid, parseISO, endOfDay, startOfDay } from 'date-fns'

type Client = {
  id: string
  name: string
  phone_number: string
  status: string
  lead_source: string
  original_ad: string | null
  registration_name: string | null
  created_at: string
  [key: string]: any
}

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

export function useClientFiltering(clients: Client[] = []) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ClientFilters>(initialFilters)
  const [isFilterActive, setIsFilterActive] = useState(false)
  const itemsPerPage = 100

  console.log('🔍 [useClientFiltering] Processando:', {
    totalClients: clients.length,
    searchTerm,
    currentPage,
    hasFilters: Object.values(filters).some(f => f !== null)
  });

  // Calcular opções de filtro baseadas nos clientes disponíveis
  const filterOptions = useMemo(() => {
    console.log('📋 [useClientFiltering] Calculando opções de filtro para', clients.length, 'clientes');
    
    if (!clients || clients.length === 0) {
      console.log('⚠️ [useClientFiltering] Sem clientes para gerar opções de filtro');
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

    clients.forEach(client => {
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

    console.log('📊 [useClientFiltering] Opções geradas:', {
      statuses: options.statuses.length,
      leadSources: options.leadSources.length,
      originalAds: options.originalAds.length,
      registrationNames: options.registrationNames.length
    });

    return options;
  }, [clients])

  // Aplicar filtros aos clientes
  const filteredClients = useMemo(() => {
    if (!clients || clients.length === 0) {
      console.log('⚠️ [useClientFiltering] Sem clientes para filtrar');
      return [];
    }
    
    console.log('🎯 [useClientFiltering] Iniciando filtragem...');
    
    let result = [...clients]; // Clone para evitar mutação

    // Filtro de texto (nome ou telefone)
    if (searchTerm && searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      console.log('🔤 [useClientFiltering] Aplicando filtro de texto:', normalizedSearch);
      
      const beforeFilter = result.length;
      result = result.filter(client => 
        client.name?.toLowerCase().includes(normalizedSearch) ||
        client.phone_number?.toLowerCase().includes(normalizedSearch)
      );
      
      console.log(`📝 [useClientFiltering] Filtro de texto: ${beforeFilter} → ${result.length} clientes`);
    }

    // Filtro de data
    if (filters.dateRange?.from) {
      console.log('📅 [useClientFiltering] Aplicando filtro de data:', filters.dateRange);
      
      const beforeFilter = result.length;
      result = result.filter(client => {
        const clientDate = parseISO(client.created_at);
        if (!isValid(clientDate)) {
          console.log('⚠️ [useClientFiltering] Data inválida:', client.created_at);
          return false;
        }
        
        const fromDate = filters.dateRange?.from 
          ? startOfDay(filters.dateRange.from)
          : undefined;
        
        const toDate = filters.dateRange?.to 
          ? endOfDay(filters.dateRange.to) 
          : undefined;
        
        const isAfterFrom = fromDate ? clientDate >= fromDate : true;
        const isBeforeTo = toDate ? clientDate <= toDate : true;
        
        return isAfterFrom && isBeforeTo;
      });
      
      console.log(`📅 [useClientFiltering] Filtro de data: ${beforeFilter} → ${result.length} clientes`);
    }

    // Filtros específicos
    if (filters.status) {
      const beforeFilter = result.length;
      result = result.filter(client => client.status === filters.status);
      console.log(`📊 [useClientFiltering] Filtro status: ${beforeFilter} → ${result.length} clientes`);
    }

    if (filters.leadSource) {
      const beforeFilter = result.length;
      result = result.filter(client => client.lead_source === filters.leadSource);
      console.log(`📈 [useClientFiltering] Filtro origem: ${beforeFilter} → ${result.length} clientes`);
    }

    if (filters.originalAd) {
      const beforeFilter = result.length;
      result = result.filter(client => client.original_ad === filters.originalAd);
      console.log(`📺 [useClientFiltering] Filtro anúncio: ${beforeFilter} → ${result.length} clientes`);
    }

    if (filters.registrationName) {
      const beforeFilter = result.length;
      result = result.filter(client => client.registration_name === filters.registrationName);
      console.log(`👤 [useClientFiltering] Filtro responsável: ${beforeFilter} → ${result.length} clientes`);
    }

    console.log(`✅ [useClientFiltering] Filtragem concluída: ${result.length} clientes finais`);
    return result;
  }, [clients, searchTerm, filters])

  // Paginação
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filteredClients.slice(startIndex, startIndex + itemsPerPage);
    
    console.log('📄 [useClientFiltering] Paginação:', {
      page: currentPage,
      startIndex,
      paginatedCount: paginated.length,
      totalFiltered: filteredClients.length
    });
    
    return paginated;
  }, [filteredClients, currentPage])

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Atualizar estado de filtro ativo
  useMemo(() => {
    const hasActiveFilters = filters.dateRange?.from !== undefined || 
      filters.status !== null || 
      filters.leadSource !== null || 
      filters.originalAd !== null || 
      filters.registrationName !== null;
    
    setIsFilterActive(hasActiveFilters);
  }, [filters])

  const applyFilters = (newFilters: ClientFilters) => {
    console.log('🎛️ [useClientFiltering] Aplicando novos filtros:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset para primeira página
  }

  const resetFilters = () => {
    console.log('🔄 [useClientFiltering] Resetando todos os filtros');
    setFilters(initialFilters);
    setSearchTerm('');
    setCurrentPage(1);
  }

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    paginatedClients,
    totalPages,
    totalResults: filteredClients.length,
    filters,
    applyFilters,
    resetFilters,
    isFilterActive,
    filterOptions
  }
}
