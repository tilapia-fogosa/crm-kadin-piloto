
export const logClientFiltering = (clients: any[] | null) => {
  console.log('transformClientsToColumnData received clients:', clients?.length)
}

export const logFilteredClients = (clients: any[] | null) => {
  console.log('Clients after status filtering:', clients?.length)
}

export const logColumnCounts = (columnTitle: string, cardCount: number) => {
  console.log(`Column ${columnTitle} has ${cardCount} cards`)
}

export const logClientMapping = (clientId: string, clientData: any) => {
  if (clientId === '782daee7-d994-41d9-becc-5f5ef236cef3') {
    console.log('Mapeamento do cliente Jerri para card:', {
      original_ad: clientData.original_ad,
      original_adset: clientData.original_adset
    })
    console.log('Card final do cliente Jerri:', clientData)
  }
}

