
import { useState, useMemo } from 'react'
import { format, isValid, parseISO } from 'date-fns'

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

// Tipo de data simplificado compatível com componentes NextContactDate/NextContactDateTime
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

  console.log('Filtering clients with search term:', searchTerm)
  console.log('Current page:', currentPage)
  console.log('Active filters:', filters)

  const filterOptions = useMemo(() => {
    console.log('Calculando opções de filtro a partir de', clients.length, 'clientes');
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

    return {
      statuses: Array.from(statusSet).sort(),
      leadSources: Array.from(leadSourceSet).sort(),
      originalAds: Array.from(originalAdSet).sort(),
      registrationNames: Array.from(registrationNameSet).sort()
    }
  }, [clients])

  const filteredClients = useMemo(() => {
    if (!clients.length) return []
    
    console.log('Iniciando filtragem de clientes...')
    
    let result = clients

    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLowerCase().trim()
      console.log('Aplicando filtro de texto:', normalizedSearch)
      
      result = result.filter(client => 
        client.name?.toLowerCase().includes(normalizedSearch) ||
        client.phone_number?.toLowerCase().includes(normalizedSearch)
      )
    }

    if (filters.dateRange?.from) {
      console.log('Aplicando filtro de data:', filters.dateRange)
      
      result = result.filter(client => {
        const clientDate = parseISO(client.created_at)
        if (!isValid(clientDate)) return false
        
        const isAfterFrom = filters.dateRange?.from 
          ? clientDate >= filters.dateRange.from 
          : true
          
        const isBeforeTo = filters.dateRange?.to 
          ? clientDate <= filters.dateRange.to 
          : true
          
        return isAfterFrom && isBeforeTo
      })
    }

    if (filters.status) {
      console.log('Aplicando filtro de status:', filters.status)
      result = result.filter(client => client.status === filters.status)
    }

    if (filters.leadSource) {
      console.log('Aplicando filtro de origem:', filters.leadSource)
      result = result.filter(client => client.lead_source === filters.leadSource)
    }

    if (filters.originalAd) {
      console.log('Aplicando filtro de anúncio:', filters.originalAd)
      result = result.filter(client => client.original_ad === filters.originalAd)
    }

    if (filters.registrationName) {
      console.log('Aplicando filtro de responsável:', filters.registrationName)
      result = result.filter(client => client.registration_name === filters.registrationName)
    }

    console.log(`Filtragem concluída: ${result.length} clientes encontrados`)
    return result
  }, [clients, searchTerm, filters])

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredClients.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredClients, currentPage])

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)

  useMemo(() => {
    const hasActiveFilters = filters.dateRange?.from !== undefined || 
      filters.status !== null || 
      filters.leadSource !== null || 
      filters.originalAd !== null || 
      filters.registrationName !== null
    
    setIsFilterActive(hasActiveFilters)
  }, [filters])

  const applyFilters = (newFilters: ClientFilters) => {
    console.log('Aplicando novos filtros:', newFilters)
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    console.log('Resetando todos os filtros')
    setFilters(initialFilters)
    setCurrentPage(1)
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
