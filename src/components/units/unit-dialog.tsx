import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const unitSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  postal_code: z.string().min(1, "CEP é obrigatório"),
})

type UnitFormData = z.infer<typeof unitSchema>

interface UnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit?: any
}

export function UnitDialog({ open, onOpenChange, unit }: UnitDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: unit ? {
      name: unit.name,
      street: unit.street,
      number: unit.number,
      complement: unit.complement,
      neighborhood: unit.neighborhood,
      city: unit.city,
      state: unit.state,
      postal_code: unit.postal_code,
    } : {
      name: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      postal_code: "",
    }
  })

  const onSubmit = async (data: UnitFormData) => {
    try {
      if (unit) {
        const { error } = await supabase
          .from('units')
          .update({
            name: data.name,
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            postal_code: data.postal_code
          })
          .eq('id', unit.id)

        if (error) throw error

        toast({
          title: "Unidade atualizada com sucesso",
        })
      } else {
        const { data: user } = await supabase.auth.getUser()
        const { error } = await supabase
          .from('units')
          .insert({
            name: data.name,
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            postal_code: data.postal_code,
            created_by: user.user?.id
          })

        if (error) throw error

        toast({
          title: "Unidade criada com sucesso",
        })
      }

      queryClient.invalidateQueries({ queryKey: ['units'] })
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar unidade",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{unit ? "Editar" : "Nova"} Unidade</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Unidade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                Cancelar
              </Button>
              <Button type="submit">
                {unit ? "Salvar" : "Criar"} Unidade
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
