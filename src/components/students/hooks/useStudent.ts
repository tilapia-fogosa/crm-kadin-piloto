import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Student, StudentFormData } from "../types"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { useUnit } from "@/contexts/UnitContext"

export function useStudent() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { selectedUnitId } = useUnit()

  const createStudent = async (clientId: string, data: StudentFormData) => {
    console.log('Iniciando criação do estudante:', { clientId, data })
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      if (!selectedUnitId) throw new Error('Nenhuma unidade selecionada')

      const studentData = {
        ...data,
        birth_date: format(data.birth_date, 'yyyy-MM-dd'),
        client_id: clientId,
        unit_id: selectedUnitId,
        created_by: user.id,
        active: true,
        cpf: data.cpf.replace(/\D/g, '')
      }

      const { data: existingStudent } = await supabase
        .from('students')
        .select('id, client_id')
        .eq('cpf', studentData.cpf)
        .single()

      if (existingStudent) {
        console.log('CPF já cadastrado:', existingStudent)
        throw new Error('CPF já cadastrado para outro aluno')
      }

      const { data: newStudent, error } = await supabase
        .from('students')
        .insert(studentData)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar estudante:', error)
        throw error
      }

      const student: Student = {
        ...newStudent,
        birth_date: new Date(newStudent.birth_date),
        created_at: newStudent.created_at,
        updated_at: newStudent.updated_at
      }

      console.log('Estudante criado com sucesso:', student)
      toast({
        title: "Estudante cadastrado com sucesso!",
        duration: 3000
      })

      return student
    } catch (error: any) {
      console.error('Erro ao processar cadastro do estudante:', error)
      toast({
        title: "Erro ao cadastrar estudante",
        description: error.message || "Ocorreu um erro ao cadastrar o estudante",
        variant: "destructive",
        duration: 3000
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '')
    if (cleanCPF.length !== 11) return false

    let sum = 0
    let rest
    if (cleanCPF === "00000000000") return false

    for (let i = 1; i <= 9; i++) {
      sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
    }
    rest = (sum * 10) % 11

    if ((rest === 10) || (rest === 11)) rest = 0
    if (rest !== parseInt(cleanCPF.substring(9, 10))) return false

    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
    }
    rest = (sum * 10) % 11

    if ((rest === 10) || (rest === 11)) rest = 0
    if (rest !== parseInt(cleanCPF.substring(10, 11))) return false

    return true
  }

  const fetchAddressByCEP = async (cep: string) => {
    console.log('Buscando endereço pelo CEP:', cep)
    try {
      const cleanCEP = cep.replace(/\D/g, '')
      if (cleanCEP.length !== 8) throw new Error('CEP inválido')

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (data.erro) {
        throw new Error('CEP não encontrado')
      }

      console.log('Endereço encontrado:', data)
      return data
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      throw error
    }
  }

  return {
    createStudent,
    validateCPF,
    fetchAddressByCEP,
    isLoading
  }
}
