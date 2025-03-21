
import { SheetTitle } from "@/components/ui/sheet"
import { Phone, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WhatsAppIcon } from "../icons/WhatsAppIcon"
import { useToast } from "@/components/ui/use-toast"

interface SheetHeaderProps {
  clientName: string
  phoneNumber: string
  onWhatsAppClick: (e: React.MouseEvent) => void
}

export function SheetHeaderContent({ clientName, phoneNumber, onWhatsAppClick }: SheetHeaderProps) {
  const { toast } = useToast()
  
  // Função para copiar o número de telefone
  const handleCopyPhone = () => {
    console.log('SheetHeader - Copiando telefone:', phoneNumber)
    navigator.clipboard.writeText(phoneNumber)
      .then(() => {
        toast({
          title: "Número copiado",
          description: "Número de telefone copiado para a área de transferência",
        })
      })
      .catch(err => {
        console.error('Erro ao copiar telefone:', err)
        toast({
          title: "Erro",
          description: "Não foi possível copiar o número de telefone",
          variant: "destructive",
        })
      })
  }

  return (
    <div className="flex flex-col items-center justify-center mb-2">
      <SheetTitle className="text-center">Atividades - {clientName}</SheetTitle>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-lg">{phoneNumber}</span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleCopyPhone} size="icon" variant="ghost" className="h-8 w-8">
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copiar número</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={(e) => onWhatsAppClick(e)} 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-green-500 hover:text-green-600"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir WhatsApp</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
