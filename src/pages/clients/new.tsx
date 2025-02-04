import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const phoneRegex = /^\d{10,11}$/

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phoneNumber: z.string()
    .regex(phoneRegex, "Telefone deve conter apenas números (DDD + número)")
    .min(10, "Telefone inválido")
    .max(11, "Telefone inválido"),
  leadSource: z.string().min(1, "Origem do lead é obrigatória"),
  observations: z.string().optional(),
  ageRange: z.string().optional(),
  metaId: z.string().optional(),
  originalAd: z.string().optional(),
})

// Mock data - replace with actual data from your backend
const leadSources: { id: string; name: string }[] = [
  { id: "1", name: "Facebook" },
  { id: "2", name: "Instagram" },
  { id: "3", name: "Indicação" },
]

export default function NewClient() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      leadSource: "",
      observations: "",
      ageRange: "",
      metaId: "",
      originalAd: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Submitting form with values:", values)
      
      // TODO: Replace with actual API call
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          status: "novo_cadastro", // Initial status for new leads
          createdAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao cadastrar lead")
      }

      toast({
        title: "Lead cadastrado com sucesso!",
        description: "O lead foi adicionado ao painel do consultor.",
      })
      
      // Reset form and redirect to kanban board
      form.reset()
      navigate("/kanban")
    } catch (error) {
      console.error("Error submitting lead:", error)
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar lead",
        description: "Ocorreu um erro ao tentar cadastrar o lead. Tente novamente.",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Cadastrar Novo Lead</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="DDD + número (apenas números)" 
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      field.onChange(value)
                    }}
                    maxLength={11}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leadSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origem do Lead *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem do lead" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leadSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Digite as observações sobre o cliente"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ageRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faixa Etária</FormLabel>
                <FormControl>
                  <Input placeholder="Digite a faixa etária" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Meta</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o ID da Meta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originalAd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anúncio de Origem</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o anúncio de origem" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Cadastrar Lead
          </Button>
        </form>
      </Form>
    </div>
  )
}