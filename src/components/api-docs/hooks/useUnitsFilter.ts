
import { useState, useMemo } from 'react'
import type { UnitTableData } from '../units-table-section'

export function useUnitsFilter(units: UnitTableData[]) {
  const [searchTerm, setSearchTerm] = useState('')
  
  console.log('Filtering units with search term:', searchTerm)
  
  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units
    
    const normalizedSearch = searchTerm.toLowerCase().trim()
    return units.filter(unit => 
      unit.name.toLowerCase().includes(normalizedSearch) ||
      unit.state.toLowerCase().includes(normalizedSearch) ||
      unit.city.toLowerCase().includes(normalizedSearch)
    )
  }, [units, searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    filteredUnits
  }
}
