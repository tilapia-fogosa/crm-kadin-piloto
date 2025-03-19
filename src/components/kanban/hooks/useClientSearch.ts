
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para pesquisa de clientes por nome ou telefone
 * 
 * @param searchTerm Termo de pesquisa informado pelo usuário
 * @param clients Lista completa de clientes para filtrar
 * @returns Lista filtrada de clientes que correspondem ao termo de pesquisa
 */
export function useClientSearch(searchTerm: string, clients: any[] | null) {
  const [filteredClients, setFilteredClients] = useState<any[] | null>(clients);
  
  // Função de filtragem que será executada quando o termo de pesquisa ou a lista de clientes mudar
  const filterClients = useCallback(() => {
    // Se não houver termo de pesquisa, retorna todos os clientes
    if (!searchTerm.trim() || !clients) {
      console.log('Hook useClientSearch: Retornando todos os clientes (sem filtro)');
      setFilteredClients(clients);
      return;
    }
    
    // Normaliza o termo de pesquisa para minúsculas e sem espaços extras
    const normalizedSearch = searchTerm.toLowerCase().trim();
    console.log(`Hook useClientSearch: Filtrando por "${normalizedSearch}"`);
    
    // Filtra os clientes que contêm o termo de pesquisa no nome ou telefone
    const results = clients.filter(client => {
      const nameMatch = client.name?.toLowerCase().includes(normalizedSearch);
      const phoneMatch = client.phone_number?.toLowerCase().includes(normalizedSearch);
      
      // Log para debugging de correspondências
      if (nameMatch || phoneMatch) {
        console.log(`Hook useClientSearch: Cliente "${client.name}" corresponde ao filtro`);
      }
      
      return nameMatch || phoneMatch;
    });
    
    console.log(`Hook useClientSearch: Encontrado ${results.length} clientes correspondentes`);
    setFilteredClients(results);
  }, [searchTerm, clients]);
  
  // Executa a filtragem quando o termo de pesquisa ou a lista de clientes mudar
  useEffect(() => {
    filterClients();
  }, [searchTerm, clients, filterClients]);
  
  return filteredClients;
}
