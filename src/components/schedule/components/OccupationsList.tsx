/**
 * LOG: Lista de ocupações organizadas em accordion temporal
 * DESCRIÇÃO: Próximos 7 dias (aberto), Futuras (fechado), Passadas (fechado)
 * OTIMIZAÇÃO: Usa RPC function para categorização no banco de dados
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { OccupationModal } from "./OccupationModal"
import { OccupationCard } from "./OccupationCard"
import { useCategorizedOccupations, CategorizedOccupation } from "../hooks/useCategorizedOccupations"

interface OccupationsListProps {
  unitId: string
}

/**
 * LOG: Lista de ocupações com categorização automática
 * Usa hook otimizado que busca dados já categorizados do banco
 */

export function OccupationsList({
  unitId
}: OccupationsListProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOccupation, setSelectedOccupation] = useState<CategorizedOccupation | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  // LOG: Buscar ocupações categorizadas via hook otimizado
  const {
    categorizedOccupations,
    isLoading,
    createOccupation,
    updateOccupation,
    deleteOccupation
  } = useCategorizedOccupations(unitId)

  console.log('📋 [OccupationsList] Renderizando com categorias:', {
    next7Days: categorizedOccupations.next7Days.length,
    future: categorizedOccupations.future.length,
    past: categorizedOccupations.past.length
  });

  // LOG: Handlers para ações
  const handleCreateClick = () => {
    console.log('➕ [OccupationsList] Abrindo modal para criar ocupação')
    setSelectedOccupation(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEditClick = (occupation: CategorizedOccupation) => {
    console.log('✏️ [OccupationsList] Editando ocupação:', occupation.id)
    setSelectedOccupation(occupation)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDeleteClick = async (occupation: CategorizedOccupation) => {
    if (window.confirm(`Tem certeza que deseja remover a ocupação "${occupation.title}"?`)) {
      console.log('🗑️ [OccupationsList] Deletando ocupação:', occupation.id)
      await deleteOccupation(occupation.id)
    }
  }

  const handleModalSubmit = async (data: any) => {
    if (modalMode === 'create') {
      console.log('➕ [OccupationsList] Criando nova ocupação')
      await createOccupation(data)
    } else if (selectedOccupation) {
      console.log('✏️ [OccupationsList] Atualizando ocupação:', selectedOccupation.id)
      await updateOccupation(selectedOccupation.id, data)
    }
    setModalOpen(false)
  }

  // LOG: Calcular total de ocupações
  const totalOccupations = 
    categorizedOccupations.next7Days.length +
    categorizedOccupations.future.length +
    categorizedOccupations.past.length

  // LOG: Renderizar estados vazios
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando ocupações...
      </div>
    )
  }

  if (totalOccupations === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">
            Ocupações na Agenda
          </h2>
          <Button onClick={handleCreateClick} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Ocupação
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma ocupação cadastrada</p>
          <p className="text-sm">Clique em "Nova Ocupação" para começar</p>
        </div>
      </div>
    )
  }

  // LOG: Renderizar accordion com categorias
  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">
          Ocupações na Agenda
        </h2>
        <Button onClick={handleCreateClick} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nova Ocupação
        </Button>
      </div>

      {/* LOG: Accordion com 3 categorias */}
      <Accordion 
        type="multiple" 
        defaultValue={["next7days"]} 
        className="w-full"
      >
        {/* CATEGORIA 1: Próximos 7 dias (sempre aberto) */}
        <AccordionItem value="next7days">
          <AccordionTrigger className="text-base font-medium">
            ⏭️ Ocupações Próximos 7 dias
            <span className="ml-2 text-sm text-muted-foreground">
              ({categorizedOccupations.next7Days.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {categorizedOccupations.next7Days.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Nenhuma ocupação nos próximos 7 dias
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {categorizedOccupations.next7Days.map(occupation => (
                  <OccupationCard
                    key={occupation.id}
                    occupation={occupation}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* CATEGORIA 2: Futuras (fechado por padrão) */}
        <AccordionItem value="future">
          <AccordionTrigger className="text-base font-medium">
            ⏩ Ocupações Futuras (+7 dias)
            <span className="ml-2 text-sm text-muted-foreground">
              ({categorizedOccupations.future.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {categorizedOccupations.future.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Nenhuma ocupação futura agendada
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {categorizedOccupations.future.map(occupation => (
                  <OccupationCard
                    key={occupation.id}
                    occupation={occupation}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* CATEGORIA 3: Passadas (fechado por padrão) */}
        <AccordionItem value="past">
          <AccordionTrigger className="text-base font-medium">
            ⏮️ Ocupações Passadas
            <span className="ml-2 text-sm text-muted-foreground">
              ({categorizedOccupations.past.length})
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {categorizedOccupations.past.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Nenhuma ocupação passada registrada
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {categorizedOccupations.past.map(occupation => (
                  <OccupationCard
                    key={occupation.id}
                    occupation={occupation}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Modal de criação/edição */}
      <OccupationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleModalSubmit}
        unitId={unitId}
        occupation={selectedOccupation}
        mode={modalMode}
      />
    </div>
  )
}