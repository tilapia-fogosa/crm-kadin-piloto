
import { useLossReasons } from "./hooks/useLossReasons"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LossReasonSelectProps {
  selectedReasons: string[]
  onSelectReason: (reasonId: string) => void
}

export function LossReasonSelect({ selectedReasons, onSelectReason }: LossReasonSelectProps) {
  const [open, setOpen] = useState(false)
  const { data: categories, isLoading } = useLossReasons()

  if (isLoading) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedReasons.length > 0
            ? `${selectedReasons.length} motivo(s) selecionado(s)`
            : "Selecionar motivos"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Buscar motivo..." />
          <CommandEmpty>Nenhum motivo encontrado.</CommandEmpty>
          <ScrollArea className="h-[300px]">
            {categories?.map((category) => (
              <CommandGroup key={category.id} heading={category.name}>
                {category.reasons.map((reason) => (
                  <CommandItem
                    key={reason.id}
                    value={reason.name}
                    onSelect={() => {
                      onSelectReason(reason.id)
                      setOpen(true) // Mantém aberto para seleção múltipla
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedReasons.includes(reason.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {reason.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
