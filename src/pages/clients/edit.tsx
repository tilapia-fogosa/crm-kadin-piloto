
import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LeadFormData, leadFormSchema } from "@/types/lead-form"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { useUnit } from "@/contexts/UnitContext"
import { LeadFormFields } from "@/components/leads/lead-form-fields"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function EditClientPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const { selectedUnitId } = useUnit()
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  })

  // Buscar dados do cliente
  useEffect(() => {
    console.log('Fetching client data for ID:', id)
    const fetchClient = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        console.log('Client data loaded:', data)
        
        // Preencher o formulário com os dados existentes
        form.reset({
          name: data.name,
          phoneNumber: data.phone_number,
          leadSource: data.lead_source,
          observations: data.observations || "",
          unitId: data.unit_id,
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching client:', error)
        toast({
          variant: "destructive",
          title: "Erro ao carregar",
          description: "Não foi possível carregar os dados do cliente.",
        })
        navigate('/clients')
      }
    }

    if (id) fetchClient()
  }, [id, form, navigate])

  const onSubmit = async (values: LeadFormData) => {
    console.log('Submitting form with values:', values)
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: values.name,
          phone_number: values.phoneNumber,
          lead_source: values.leadSource,
          observations: values.observations,
          unit_id: selectedUnitId,
        })
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso.",
      })
      
      navigate('/clients')
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao tentar atualizar o cliente.",
      })
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/clients')}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
      </div>

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <LeadFormFields 
              form={form} 
              isEditing={true}
            />
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/clients')}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
