
import { useState, useMemo } from 'react'

type Client = {
  id: string
  name: string
  phone_number: string
  [key: string]: any
}

export function useClientFiltering(clients: Client[] = []) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 100

  console.log('Filtering clients with search term:', searchTerm)
  console.log('Current page:', currentPage)

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients

    const normalizedSearch = searchTerm.toLowerCase().trim()
    return clients.filter(client => 
      client.name?.toLowerCase().includes(normalizedSearch) ||
      client.phone_number?.toLowerCase().includes(normalizedSearch)
    )
  }, [clients, searchTerm])

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredClients.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredClients, currentPage])

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    paginatedClients,
    totalPages,
    totalResults: filteredClients.length
  }
}
