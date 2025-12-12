/**
 * Configuração de Cores e Siglas para os Status dos Leads
 * 
 * Mapeia o status do banco de dados para uma representação visual
 * compacta (Sigla + Cor) para a lista de conversas.
 */

export interface StatusVisualConfig {
    sigla: string;
    label: string;
    cor: string; // Classe Tailwind
}

export const getStatusConfig = (status: string): StatusVisualConfig => {
    // Normaliza o status para comparação
    const normalizedStatus = status?.toLowerCase() || '';

    // Mapeamento direto
    if (normalizedStatus === 'novo_cadastro' || normalizedStatus === 'new') {
        return { sigla: 'NC', label: 'Novo Cadastro', cor: 'bg-blue-500' };
    }

    if (normalizedStatus.includes('tentativa') || normalizedStatus.startsWith('tc')) {
        return { sigla: 'TC', label: 'Tentativa de Contato', cor: 'bg-yellow-500' };
    }

    if (normalizedStatus === 'contato_efetivo' || normalizedStatus === 'efetivo' || normalizedStatus === 'ce') {
        return { sigla: 'CE', label: 'Contato Efetivo', cor: 'bg-green-500' };
    }

    if (normalizedStatus.includes('agendamento') || normalizedStatus === 'ag') {
        return { sigla: 'AG', label: 'Agendamento', cor: 'bg-purple-500' };
    }

    if (normalizedStatus.includes('negociacao') || normalizedStatus === 'ng') {
        return { sigla: 'NG', label: 'Negociação', cor: 'bg-orange-500' };
    }

    if (normalizedStatus === 'matriculado' || normalizedStatus === 'venda' || normalizedStatus === 'mt') {
        return { sigla: 'MT', label: 'Matriculado', cor: 'bg-emerald-600' };
    }

    if (normalizedStatus === 'lost' || normalizedStatus === 'perdido') {
        return { sigla: 'P', label: 'Perdido', cor: 'bg-red-500' };
    }

    // Fallback para status desconhecido
    return {
        sigla: normalizedStatus.substring(0, 2).toUpperCase(),
        label: status,
        cor: 'bg-gray-400'
    };
};
