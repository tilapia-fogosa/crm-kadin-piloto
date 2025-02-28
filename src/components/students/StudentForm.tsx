
import { useState } from "react"
import { useForm } from "react-hook-form"
import { StudentFormData } from "./types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useStudent } from "./hooks/useStudent"
import { useToast } from "@/components/ui/use-toast"

interface StudentFormProps {
  clientId: string
  onSubmit: (studentId: string) => void
}

export function StudentForm({ clientId, onSubmit }: StudentFormProps) {
  const { createStudent, validateCPF, fetchAddressByCEP, isLoading } = useStudent()
  const { toast } = useToast()
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)

  const form = useForm<StudentFormData>({
    defaultValues: {
      full_name: "",
      cpf: "",
      rg: "",
      birth_date: new Date(),
      address_postal_code: "",
      address_street: "",
      address_number: "",
      address_complement: "",
      address_neighborhood: "",
      address_city: "",
      address_state: ""
    }
  })

  const handleSubmit = async (data: StudentFormData) => {
    console.log('Submetendo formulário:', data)
    try {
      // Validar CPF
      if (!validateCPF(data.cpf)) {
        toast({
          title: "CPF inválido",
          description: "Por favor, insira um CPF válido",
          variant: "destructive"
        })
        return
      }

      const student = await createStudent(clientId, data)
      onSubmit(student.id)
    } catch (error) {
      console.error('Erro ao submeter formulário:', error)
    }
  }

  const handleCEPBlur = async (cep: string) => {
    console.log('CEP alterado:', cep)
    if (!cep || cep.length !== 8) return

    setIsLoadingCEP(true)
    try {
      const address = await fetchAddressByCEP(cep)
      
      form.setValue('address_street', address.logradouro)
      form.setValue('address_neighborhood', address.bairro)
      form.setValue('address_city', address.localidade)
      form.setValue('address_state', address.uf)
      form.setValue('address_complement', address.complemento)
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast({
        title: "Erro ao buscar CEP",
        description: "Verifique o CEP informado",
        variant: "destructive"
      })
    } finally {
      setIsLoadingCEP(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome Completo</Label>
        <Input
          id="full_name"
          {...form.register("full_name")}
          placeholder="Nome completo do aluno"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            {...form.register("cpf")}
            placeholder="Apenas números"
            maxLength={11}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input
            id="rg"
            {...form.register("rg")}
            placeholder="RG (opcional)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birth_date">Data de Nascimento</Label>
        <Input
          id="birth_date"
          type="date"
          {...form.register("birth_date")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_postal_code">CEP</Label>
        <Input
          id="address_postal_code"
          {...form.register("address_postal_code")}
          placeholder="CEP"
          maxLength={8}
          onBlur={(e) => handleCEPBlur(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address_street">Rua</Label>
          <Input
            id="address_street"
            {...form.register("address_street")}
            placeholder="Rua"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_number">Número</Label>
          <Input
            id="address_number"
            {...form.register("address_number")}
            placeholder="Número"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_complement">Complemento</Label>
        <Input
          id="address_complement"
          {...form.register("address_complement")}
          placeholder="Complemento (opcional)"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address_neighborhood">Bairro</Label>
          <Input
            id="address_neighborhood"
            {...form.register("address_neighborhood")}
            placeholder="Bairro"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_city">Cidade</Label>
          <Input
            id="address_city"
            {...form.register("address_city")}
            placeholder="Cidade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_state">Estado</Label>
          <Input
            id="address_state"
            {...form.register("address_state")}
            placeholder="Estado"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading || isLoadingCEP}
      >
        {isLoading ? "Cadastrando..." : "Cadastrar Aluno"}
      </Button>
    </form>
  )
}
