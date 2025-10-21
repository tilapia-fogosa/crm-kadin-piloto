export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ah_ignorar_coleta: {
        Row: {
          active: boolean
          created_at: string
          data_fim: string
          data_inicio: string
          dias: number
          id: string
          motivo: string
          pessoa_id: string
          pessoa_tipo: string
          responsavel: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          data_fim: string
          data_inicio?: string
          dias: number
          id?: string
          motivo: string
          pessoa_id: string
          pessoa_tipo: string
          responsavel: string
        }
        Update: {
          active?: boolean
          created_at?: string
          data_fim?: string
          data_inicio?: string
          dias?: number
          id?: string
          motivo?: string
          pessoa_id?: string
          pessoa_tipo?: string
          responsavel?: string
        }
        Relationships: []
      }
      ah_recolhidas: {
        Row: {
          apostila: string
          correcao_iniciada: boolean | null
          created_at: string
          data_entrega_real: string | null
          data_inicio_correcao: string | null
          data_recolhida: string
          id: number
          pessoa_id: string
          professor_id: string | null
          responsavel_correcao_id: string | null
          responsavel_correcao_nome: string | null
          responsavel_correcao_tipo: string | null
          responsavel_entrega_id: string | null
          responsavel_entrega_nome: string | null
          responsavel_id: string | null
        }
        Insert: {
          apostila: string
          correcao_iniciada?: boolean | null
          created_at?: string
          data_entrega_real?: string | null
          data_inicio_correcao?: string | null
          data_recolhida: string
          id?: number
          pessoa_id: string
          professor_id?: string | null
          responsavel_correcao_id?: string | null
          responsavel_correcao_nome?: string | null
          responsavel_correcao_tipo?: string | null
          responsavel_entrega_id?: string | null
          responsavel_entrega_nome?: string | null
          responsavel_id?: string | null
        }
        Update: {
          apostila?: string
          correcao_iniciada?: boolean | null
          created_at?: string
          data_entrega_real?: string | null
          data_inicio_correcao?: string | null
          data_recolhida?: string
          id?: number
          pessoa_id?: string
          professor_id?: string | null
          responsavel_correcao_id?: string | null
          responsavel_correcao_nome?: string | null
          responsavel_correcao_tipo?: string | null
          responsavel_entrega_id?: string | null
          responsavel_entrega_nome?: string | null
          responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ah_recolhidas_responsavel_entrega_id_fkey"
            columns: ["responsavel_entrega_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alerta_evasao: {
        Row: {
          aluno_id: string
          created_at: string
          data_alerta: string
          data_retencao: string | null
          descritivo: string | null
          id: string
          kanban_status: string
          origem_alerta: Database["public"]["Enums"]["origem_alerta"]
          responsavel: string | null
          status: Database["public"]["Enums"]["status_alerta"]
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_alerta?: string
          data_retencao?: string | null
          descritivo?: string | null
          id?: string
          kanban_status?: string
          origem_alerta: Database["public"]["Enums"]["origem_alerta"]
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_alerta"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_alerta?: string
          data_retencao?: string | null
          descritivo?: string | null
          id?: string
          kanban_status?: string
          origem_alerta?: Database["public"]["Enums"]["origem_alerta"]
          responsavel?: string | null
          status?: Database["public"]["Enums"]["status_alerta"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerta_evasao_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_falta: {
        Row: {
          aluno_id: string
          created_at: string
          data_alerta: string
          data_falta: string
          detalhes: Json | null
          id: string
          professor_id: string
          resolvido_em: string | null
          resolvido_por: string | null
          slack_mensagem_id: string | null
          status: string
          tipo_criterio: string
          turma_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_alerta?: string
          data_falta: string
          detalhes?: Json | null
          id?: string
          professor_id: string
          resolvido_em?: string | null
          resolvido_por?: string | null
          slack_mensagem_id?: string | null
          status?: string
          tipo_criterio: string
          turma_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_alerta?: string
          data_falta?: string
          detalhes?: Json | null
          id?: string
          professor_id?: string
          resolvido_em?: string | null
          resolvido_por?: string | null
          slack_mensagem_id?: string | null
          status?: string
          tipo_criterio?: string
          turma_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_falta_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_falta_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_falta_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "calendario_turmas_view"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "alertas_falta_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_falta_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_lancamento: {
        Row: {
          arquivado_em: string | null
          arquivado_por: string | null
          created_at: string
          data_aula: string
          id: string
          professor_id: string
          status: string
          turma_id: string
          webhook_enviado: boolean | null
        }
        Insert: {
          arquivado_em?: string | null
          arquivado_por?: string | null
          created_at?: string
          data_aula: string
          id?: string
          professor_id: string
          status?: string
          turma_id: string
          webhook_enviado?: boolean | null
        }
        Update: {
          arquivado_em?: string | null
          arquivado_por?: string | null
          created_at?: string
          data_aula?: string
          id?: string
          professor_id?: string
          status?: string
          turma_id?: string
          webhook_enviado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_lancamento_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_lancamento_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "calendario_turmas_view"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "alertas_lancamento_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos: {
        Row: {
          active: boolean
          avaliacao_abaco: string | null
          avaliacao_ah: string | null
          codigo: string | null
          coordenador_responsavel: string | null
          created_at: string
          curso: string | null
          data_onboarding: string | null
          dias_apostila: number | null
          dias_supera: number | null
          email: string | null
          faltas_consecutivas: number
          foto_devolutiva_url: string | null
          foto_url: string | null
          id: string
          idade: number | null
          indice: string | null
          is_funcionario: boolean | null
          kit_sugerido: string | null
          material_entregue: boolean | null
          matricula: string | null
          motivo_procura: string | null
          niveldesafio: string | null
          nome: string
          oculto_retencoes: boolean
          percepcao_coordenador: string | null
          pontos_atencao: string | null
          responsavel: string
          telefone: string | null
          texto_devolutiva: string | null
          turma_id: string | null
          ultima_correcao_ah: string | null
          ultima_falta: string | null
          ultima_pagina: number | null
          ultima_sincronizacao: string | null
          ultimo_nivel: string | null
          unit_id: string
          valor_mensalidade: number | null
          vencimento_contrato: string | null
          whatapp_contato: string | null
        }
        Insert: {
          active?: boolean
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          faltas_consecutivas?: number
          foto_devolutiva_url?: string | null
          foto_url?: string | null
          id?: string
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          kit_sugerido?: string | null
          material_entregue?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome: string
          oculto_retencoes?: boolean
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          responsavel?: string
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultima_sincronizacao?: string | null
          ultimo_nivel?: string | null
          unit_id: string
          valor_mensalidade?: number | null
          vencimento_contrato?: string | null
          whatapp_contato?: string | null
        }
        Update: {
          active?: boolean
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          faltas_consecutivas?: number
          foto_devolutiva_url?: string | null
          foto_url?: string | null
          id?: string
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          kit_sugerido?: string | null
          material_entregue?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome?: string
          oculto_retencoes?: boolean
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          responsavel?: string
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultima_sincronizacao?: string | null
          ultimo_nivel?: string | null
          unit_id?: string
          valor_mensalidade?: number | null
          vencimento_contrato?: string | null
          whatapp_contato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_alunos_turma_id"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "calendario_turmas_view"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "fk_alunos_turma_id"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alunos_unit_id"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos_backup: {
        Row: {
          active: boolean | null
          avaliacao_abaco: string | null
          avaliacao_ah: string | null
          codigo: string | null
          coordenador_responsavel: string | null
          created_at: string | null
          curso: string | null
          data_onboarding: string | null
          dias_apostila: number | null
          dias_supera: number | null
          email: string | null
          id: string | null
          idade: number | null
          indice: string | null
          is_funcionario: boolean | null
          matricula: string | null
          motivo_procura: string | null
          niveldesafio: string | null
          nome: string | null
          percepcao_coordenador: string | null
          pontos_atencao: string | null
          telefone: string | null
          texto_devolutiva: string | null
          turma_id: string | null
          ultima_correcao_ah: string | null
          ultima_falta: string | null
          ultima_pagina: number | null
          ultimo_nivel: string | null
          unit_id: string | null
          vencimento_contrato: string | null
        }
        Insert: {
          active?: boolean | null
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string | null
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          id?: string | null
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome?: string | null
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultimo_nivel?: string | null
          unit_id?: string | null
          vencimento_contrato?: string | null
        }
        Update: {
          active?: boolean | null
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string | null
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          id?: string | null
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome?: string | null
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultimo_nivel?: string | null
          unit_id?: string | null
          vencimento_contrato?: string | null
        }
        Relationships: []
      }
      alunos_backup1: {
        Row: {
          active: boolean
          avaliacao_abaco: string | null
          avaliacao_ah: string | null
          backup_created_at: string
          backup_created_by: string | null
          codigo: string | null
          coordenador_responsavel: string | null
          created_at: string
          curso: string | null
          data_onboarding: string | null
          dias_apostila: number | null
          dias_supera: number | null
          email: string | null
          faltas_consecutivas: number
          foto_url: string | null
          id: string
          idade: number | null
          indice: string | null
          is_funcionario: boolean | null
          kit_sugerido: string | null
          material_entregue: boolean | null
          matricula: string | null
          motivo_procura: string | null
          niveldesafio: string | null
          nome: string
          oculto_retencoes: boolean
          original_id: string
          percepcao_coordenador: string | null
          pontos_atencao: string | null
          responsavel: string
          status: string | null
          telefone: string | null
          texto_devolutiva: string | null
          turma_id: string | null
          ultima_correcao_ah: string | null
          ultima_falta: string | null
          ultima_pagina: number | null
          ultima_sincronizacao: string | null
          ultimo_nivel: string | null
          unit_id: string
          valor_mensalidade: number | null
          vencimento_contrato: string | null
          whatapp_contato: string | null
        }
        Insert: {
          active?: boolean
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          backup_created_at?: string
          backup_created_by?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          faltas_consecutivas?: number
          foto_url?: string | null
          id?: string
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          kit_sugerido?: string | null
          material_entregue?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome: string
          oculto_retencoes?: boolean
          original_id: string
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          responsavel?: string
          status?: string | null
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultima_sincronizacao?: string | null
          ultimo_nivel?: string | null
          unit_id: string
          valor_mensalidade?: number | null
          vencimento_contrato?: string | null
          whatapp_contato?: string | null
        }
        Update: {
          active?: boolean
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          backup_created_at?: string
          backup_created_by?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          faltas_consecutivas?: number
          foto_url?: string | null
          id?: string
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          kit_sugerido?: string | null
          material_entregue?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome?: string
          oculto_retencoes?: boolean
          original_id?: string
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          responsavel?: string
          status?: string | null
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultima_sincronizacao?: string | null
          ultimo_nivel?: string | null
          unit_id?: string
          valor_mensalidade?: number | null
          vencimento_contrato?: string | null
          whatapp_contato?: string | null
        }
        Relationships: []
      }
      alunos_backup2: {
        Row: {
          active: boolean
          avaliacao_abaco: string | null
          avaliacao_ah: string | null
          backup_created_at: string
          backup_created_by: string | null
          codigo: string | null
          coordenador_responsavel: string | null
          created_at: string
          curso: string | null
          data_onboarding: string | null
          dias_apostila: number | null
          dias_supera: number | null
          email: string | null
          faltas_consecutivas: number
          foto_url: string | null
          id: string
          idade: number | null
          indice: string | null
          is_funcionario: boolean | null
          kit_sugerido: string | null
          material_entregue: boolean | null
          matricula: string | null
          motivo_procura: string | null
          niveldesafio: string | null
          nome: string
          oculto_retencoes: boolean
          original_id: string
          percepcao_coordenador: string | null
          pontos_atencao: string | null
          responsavel: string
          status: string | null
          telefone: string | null
          texto_devolutiva: string | null
          turma_id: string | null
          ultima_correcao_ah: string | null
          ultima_falta: string | null
          ultima_pagina: number | null
          ultima_sincronizacao: string | null
          ultimo_nivel: string | null
          unit_id: string
          valor_mensalidade: number | null
          vencimento_contrato: string | null
          whatapp_contato: string | null
        }
        Insert: {
          active?: boolean
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          backup_created_at?: string
          backup_created_by?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          faltas_consecutivas?: number
          foto_url?: string | null
          id?: string
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          kit_sugerido?: string | null
          material_entregue?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome: string
          oculto_retencoes?: boolean
          original_id: string
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          responsavel?: string
          status?: string | null
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultima_sincronizacao?: string | null
          ultimo_nivel?: string | null
          unit_id: string
          valor_mensalidade?: number | null
          vencimento_contrato?: string | null
          whatapp_contato?: string | null
        }
        Update: {
          active?: boolean
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          backup_created_at?: string
          backup_created_by?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          faltas_consecutivas?: number
          foto_url?: string | null
          id?: string
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          kit_sugerido?: string | null
          material_entregue?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome?: string
          oculto_retencoes?: boolean
          original_id?: string
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          responsavel?: string
          status?: string | null
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultima_sincronizacao?: string | null
          ultimo_nivel?: string | null
          unit_id?: string
          valor_mensalidade?: number | null
          vencimento_contrato?: string | null
          whatapp_contato?: string | null
        }
        Relationships: []
      }
      apostilas: {
        Row: {
          created_at: string
          exercicios_por_pagina: number | null
          id: string
          nome: string
          total_paginas: number
        }
        Insert: {
          created_at?: string
          exercicios_por_pagina?: number | null
          id?: string
          nome: string
          total_paginas: number
        }
        Update: {
          created_at?: string
          exercicios_por_pagina?: number | null
          id?: string
          nome?: string
          total_paginas?: number
        }
        Relationships: []
      }
      atividade_pos_venda: {
        Row: {
          active: boolean
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_postal_code: string | null
          address_state: string | null
          address_street: string | null
          birth_date: string | null
          client_activity_id: string
          client_id: string
          client_name: string
          commercial_observations: string | null
          cpf: string | null
          created_at: string
          created_by: string
          data_aula_inaugural: string | null
          enrollment_amount: number | null
          enrollment_installments: number | null
          enrollment_payment_confirmed: boolean | null
          enrollment_payment_date: string | null
          enrollment_payment_method:
            | Database["public"]["Enums"]["payment_method"]
            | null
          first_monthly_fee_date: string | null
          full_name: string | null
          id: string
          informacoes_onboarding: string | null
          kit_type: Database["public"]["Enums"]["kit_type"] | null
          material_amount: number | null
          material_installments: number | null
          material_payment_confirmed: boolean | null
          material_payment_date: string | null
          material_payment_method:
            | Database["public"]["Enums"]["payment_method"]
            | null
          monthly_fee_amount: number | null
          monthly_fee_payment_method:
            | Database["public"]["Enums"]["payment_method"]
            | null
          photo_thumbnail_url: string | null
          photo_url: string | null
          rg: string | null
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street?: string | null
          birth_date?: string | null
          client_activity_id: string
          client_id: string
          client_name: string
          commercial_observations?: string | null
          cpf?: string | null
          created_at?: string
          created_by: string
          data_aula_inaugural?: string | null
          enrollment_amount?: number | null
          enrollment_installments?: number | null
          enrollment_payment_confirmed?: boolean | null
          enrollment_payment_date?: string | null
          enrollment_payment_method?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          first_monthly_fee_date?: string | null
          full_name?: string | null
          id?: string
          informacoes_onboarding?: string | null
          kit_type?: Database["public"]["Enums"]["kit_type"] | null
          material_amount?: number | null
          material_installments?: number | null
          material_payment_confirmed?: boolean | null
          material_payment_date?: string | null
          material_payment_method?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          monthly_fee_amount?: number | null
          monthly_fee_payment_method?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          rg?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street?: string | null
          birth_date?: string | null
          client_activity_id?: string
          client_id?: string
          client_name?: string
          commercial_observations?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string
          data_aula_inaugural?: string | null
          enrollment_amount?: number | null
          enrollment_installments?: number | null
          enrollment_payment_confirmed?: boolean | null
          enrollment_payment_date?: string | null
          enrollment_payment_method?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          first_monthly_fee_date?: string | null
          full_name?: string | null
          id?: string
          informacoes_onboarding?: string | null
          kit_type?: Database["public"]["Enums"]["kit_type"] | null
          material_amount?: number | null
          material_installments?: number | null
          material_payment_confirmed?: boolean | null
          material_payment_date?: string | null
          material_payment_method?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          monthly_fee_amount?: number | null
          monthly_fee_payment_method?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          rg?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividade_pos_venda_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "calendario_turmas_view"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "atividade_pos_venda_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_atividade_pos_venda_client_activity_id"
            columns: ["client_activity_id"]
            isOneToOne: true
            referencedRelation: "client_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_atividade_pos_venda_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_atividade_pos_venda_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "kanban_client_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_atividade_pos_venda_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas: {
        Row: {
          conteudo: string | null
          created_at: string
          data_aula: string
          descricao: string | null
          display_order: number | null
          duracao_minutos: number | null
          hls_url: string
          id: string
          mes: string | null
          published: boolean
          quantidade_contas_ditadas: number | null
          thumbnail_url: string | null
          titulo: string
          total_abaco_absoluto: number | null
          total_calculo_mental_absoluto: number | null
          updated_at: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          data_aula: string
          descricao?: string | null
          display_order?: number | null
          duracao_minutos?: number | null
          hls_url: string
          id?: string
          mes?: string | null
          published?: boolean
          quantidade_contas_ditadas?: number | null
          thumbnail_url?: string | null
          titulo: string
          total_abaco_absoluto?: number | null
          total_calculo_mental_absoluto?: number | null
          updated_at?: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          data_aula?: string
          descricao?: string | null
          display_order?: number | null
          duracao_minutos?: number | null
          hls_url?: string
          id?: string
          mes?: string | null
          published?: boolean
          quantidade_contas_ditadas?: number | null
          thumbnail_url?: string | null
          titulo?: string
          total_abaco_absoluto?: number | null
          total_calculo_mental_absoluto?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      aulas_experimentais: {
        Row: {
          active: boolean | null
          cliente_nome: string
          created_at: string
          created_by: string | null
          data_aula_experimental: string
          descricao_cliente: string | null
          id: string
          responsavel_id: string
          responsavel_nome: string | null
          responsavel_tipo: string
          turma_id: string
          unit_id: string
        }
        Insert: {
          active?: boolean | null
          cliente_nome: string
          created_at?: string
          created_by?: string | null
          data_aula_experimental: string
          descricao_cliente?: string | null
          id?: string
          responsavel_id: string
          responsavel_nome?: string | null
          responsavel_tipo: string
          turma_id: string
          unit_id: string
        }
        Update: {
          active?: boolean | null
          cliente_nome?: string
          created_at?: string
          created_by?: string | null
          data_aula_experimental?: string
          descricao_cliente?: string | null
          id?: string
          responsavel_id?: string
          responsavel_nome?: string | null
          responsavel_tipo?: string
          turma_id?: string
          unit_id?: string
        }
        Relationships: []
      }
      backup_metadata: {
        Row: {
          backup_name: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          slot_number: number
          total_alunos: number
          total_professores: number
          total_turmas: number
          unit_id: string
        }
        Insert: {
          backup_name: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          slot_number: number
          total_alunos?: number
          total_professores?: number
          total_turmas?: number
          unit_id: string
        }
        Update: {
          backup_name?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          slot_number?: number
          total_alunos?: number
          total_professores?: number
          total_turmas?: number
          unit_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          active: boolean
          activity_id: string | null
          calendar_background_color: string | null
          calendar_id: string | null
          calendar_name: string | null
          created_at: string | null
          description: string | null
          end_time: string
          google_event_id: string | null
          id: string
          is_recurring: boolean | null
          last_synced_at: string | null
          recurring_rule: string | null
          start_time: string
          sync_status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          activity_id?: string | null
          calendar_background_color?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          google_event_id?: string | null
          id?: string
          is_recurring?: boolean | null
          last_synced_at?: string | null
          recurring_rule?: string | null
          start_time: string
          sync_status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          activity_id?: string | null
          calendar_background_color?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          is_recurring?: boolean | null
          last_synced_at?: string | null
          recurring_rule?: string | null
          start_time?: string
          sync_status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "client_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      camisetas: {
        Row: {
          aluno_id: string
          camiseta_entregue: boolean
          created_at: string
          data_entrega: string | null
          id: string
          nao_tem_tamanho: boolean | null
          observacoes: string | null
          responsavel_entrega_id: string | null
          responsavel_entrega_nome: string | null
          responsavel_entrega_tipo: string | null
          tamanho_camiseta: string | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          camiseta_entregue?: boolean
          created_at?: string
          data_entrega?: string | null
          id?: string
          nao_tem_tamanho?: boolean | null
          observacoes?: string | null
          responsavel_entrega_id?: string | null
          responsavel_entrega_nome?: string | null
          responsavel_entrega_tipo?: string | null
          tamanho_camiseta?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          camiseta_entregue?: boolean
          created_at?: string
          data_entrega?: string | null
          id?: string
          nao_tem_tamanho?: boolean | null
          observacoes?: string | null
          responsavel_entrega_id?: string | null
          responsavel_entrega_nome?: string | null
          responsavel_entrega_tipo?: string | null
          tamanho_camiseta?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      class_types: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          max_capacity: number
          name: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          max_capacity: number
          name: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          max_capacity?: number
          name?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_types_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          active: boolean
          class_type_id: string
          created_at: string
          current_students: number
          end_date: string | null
          id: string
          name: string
          schedule: string
          start_date: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          class_type_id: string
          created_at?: string
          current_students?: number
          end_date?: string | null
          id?: string
          name: string
          schedule: string
          start_date: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          class_type_id?: string
          created_at?: string
          current_students?: number
          end_date?: string | null
          id?: string
          name?: string
          schedule?: string
          start_date?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_class_type_id_fkey"
            columns: ["class_type_id"]
            isOneToOne: false
            referencedRelation: "class_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      client_activities: {
        Row: {
          active: boolean
          client_id: string
          created_at: string
          created_by: string
          id: string
          next_contact_date: string | null
          notes: string | null
          scheduled_date: string | null
          tipo_atividade: string
          tipo_contato: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          client_id: string
          created_at?: string
          created_by: string
          id?: string
          next_contact_date?: string | null
          notes?: string | null
          scheduled_date?: string | null
          tipo_atividade: string
          tipo_contato: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          client_id?: string
          created_at?: string
          created_by?: string
          id?: string
          next_contact_date?: string | null
          notes?: string | null
          scheduled_date?: string | null
          tipo_atividade?: string
          tipo_contato?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "kanban_client_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activities_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client_activities_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client_activities_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "kanban_client_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      client_loss_reasons: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          observations: string | null
          previous_status: string | null
          reason_id: string | null
          total_reasons: number
          unit_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          observations?: string | null
          previous_status?: string | null
          reason_id?: string | null
          total_reasons?: number
          unit_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          observations?: string | null
          previous_status?: string | null
          reason_id?: string | null
          total_reasons?: number
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_loss_reasons_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_loss_reasons_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "kanban_client_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_loss_reasons_reason_id_fkey"
            columns: ["reason_id"]
            isOneToOne: false
            referencedRelation: "loss_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_loss_reasons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      client_webhook_logs: {
        Row: {
          attempt_count: number
          client_id: string
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt: string | null
          next_retry: string | null
          payload: Json
          status: string
          webhook_id: string
        }
        Insert: {
          attempt_count?: number
          client_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt?: string | null
          next_retry?: string | null
          payload: Json
          status: string
          webhook_id: string
        }
        Update: {
          attempt_count?: number
          client_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt?: string | null
          next_retry?: string | null
          payload?: Json
          status?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_webhook_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_webhook_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "kanban_client_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "client_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      client_webhooks: {
        Row: {
          active: boolean
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          last_failure: string | null
          last_success: string | null
          trigger_status: string
          unit_ids: string[]
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_failure?: string | null
          last_success?: string | null
          trigger_status: string
          unit_ids: string[]
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_failure?: string | null
          last_success?: string | null
          trigger_status?: string
          unit_ids?: string[]
          url?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          active: boolean
          age_range: string | null
          concatena: boolean | null
          concatena_tempo: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          etapa_bot: Database["public"]["Enums"]["etapa-do-bot"] | null
          id: string
          lead_quality_score: number | null
          lead_source: string
          meta_id: string | null
          msg_concatenada: string[]
          name: string
          next_contact_date: string | null
          observations: string | null
          original_ad: string | null
          original_adset: string | null
          phone_number: string
          primeiro_nome: string | null
          registration_cpf: string | null
          registration_name: string | null
          resumo_atendimento: string | null
          scheduled_date: string | null
          status: string
          tipo_atendimento: Database["public"]["Enums"]["tipo_atendimento"]
          unit_id: string | null
          updated_at: string
          valorization_confirmed: boolean | null
        }
        Insert: {
          active?: boolean
          age_range?: string | null
          concatena?: boolean | null
          concatena_tempo?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          etapa_bot?: Database["public"]["Enums"]["etapa-do-bot"] | null
          id?: string
          lead_quality_score?: number | null
          lead_source: string
          meta_id?: string | null
          msg_concatenada?: string[]
          name: string
          next_contact_date?: string | null
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number: string
          primeiro_nome?: string | null
          registration_cpf?: string | null
          registration_name?: string | null
          resumo_atendimento?: string | null
          scheduled_date?: string | null
          status?: string
          tipo_atendimento?: Database["public"]["Enums"]["tipo_atendimento"]
          unit_id?: string | null
          updated_at?: string
          valorization_confirmed?: boolean | null
        }
        Update: {
          active?: boolean
          age_range?: string | null
          concatena?: boolean | null
          concatena_tempo?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          etapa_bot?: Database["public"]["Enums"]["etapa-do-bot"] | null
          id?: string
          lead_quality_score?: number | null
          lead_source?: string
          meta_id?: string | null
          msg_concatenada?: string[]
          name?: string
          next_contact_date?: string | null
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number?: string
          primeiro_nome?: string | null
          registration_cpf?: string | null
          registration_name?: string | null
          resumo_atendimento?: string | null
          scheduled_date?: string | null
          status?: string
          tipo_atendimento?: Database["public"]["Enums"]["tipo_atendimento"]
          unit_id?: string | null
          updated_at?: string
          valorization_confirmed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_lead_source_fkey"
            columns: ["lead_source"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clients_unit_id"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      clients_backup: {
        Row: {
          active: boolean
          age_range: string | null
          concatena: boolean | null
          concatena_tempo: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          etapa_bot: Database["public"]["Enums"]["etapa-do-bot"] | null
          id: string
          lead_quality_score: number | null
          lead_source: string
          meta_id: string | null
          msg_concatenada: string[]
          name: string
          next_contact_date: string | null
          observations: string | null
          original_ad: string | null
          original_adset: string | null
          phone_number: string
          primeiro_nome: string | null
          registration_cpf: string | null
          registration_name: string | null
          resumo_atendimento: string | null
          scheduled_date: string | null
          status: string
          tipo_atendimento: Database["public"]["Enums"]["tipo_atendimento"]
          unit_api_key: string | null
          unit_id: string | null
          updated_at: string
          valorization_confirmed: boolean | null
        }
        Insert: {
          active?: boolean
          age_range?: string | null
          concatena?: boolean | null
          concatena_tempo?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          etapa_bot?: Database["public"]["Enums"]["etapa-do-bot"] | null
          id?: string
          lead_quality_score?: number | null
          lead_source: string
          meta_id?: string | null
          msg_concatenada?: string[]
          name: string
          next_contact_date?: string | null
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number: string
          primeiro_nome?: string | null
          registration_cpf?: string | null
          registration_name?: string | null
          resumo_atendimento?: string | null
          scheduled_date?: string | null
          status?: string
          tipo_atendimento?: Database["public"]["Enums"]["tipo_atendimento"]
          unit_api_key?: string | null
          unit_id?: string | null
          updated_at?: string
          valorization_confirmed?: boolean | null
        }
        Update: {
          active?: boolean
          age_range?: string | null
          concatena?: boolean | null
          concatena_tempo?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          etapa_bot?: Database["public"]["Enums"]["etapa-do-bot"] | null
          id?: string
          lead_quality_score?: number | null
          lead_source?: string
          meta_id?: string | null
          msg_concatenada?: string[]
          name?: string
          next_contact_date?: string | null
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number?: string
          primeiro_nome?: string | null
          registration_cpf?: string | null
          registration_name?: string | null
          resumo_atendimento?: string | null
          scheduled_date?: string | null
          status?: string
          tipo_atendimento?: Database["public"]["Enums"]["tipo_atendimento"]
          unit_api_key?: string | null
          unit_id?: string | null
          updated_at?: string
          valorization_confirmed?: boolean | null
        }
        Relationships: []
      }
      clients_duplicate: {
        Row: {
          active: boolean
          age_range: string | null
          concatena: boolean | null
          concatena_tempo: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          etapa_bot: Database["public"]["Enums"]["etapa-do-bot"] | null
          id: string
          lead_quality_score: number | null
          lead_source: string
          meta_id: string | null
          msg_concatenada: string[]
          name: string
          next_contact_date: string | null
          observations: string | null
          original_ad: string | null
          original_adset: string | null
          phone_number: string
          primeiro_nome: string | null
          registration_cpf: string | null
          registration_name: string | null
          resumo_atendimento: string | null
          scheduled_date: string | null
          status: string
          tipo_atendimento: Database["public"]["Enums"]["tipo_atendimento"]
          unit_id: string | null
          updated_at: string
          valorization_confirmed: boolean | null
        }
        Insert: {
          active?: boolean
          age_range?: string | null
          concatena?: boolean | null
          concatena_tempo?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          etapa_bot?: Database["public"]["Enums"]["etapa-do-bot"] | null
          id?: string
          lead_quality_score?: number | null
          lead_source: string
          meta_id?: string | null
          msg_concatenada?: string[]
          name: string
          next_contact_date?: string | null
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number: string
          primeiro_nome?: string | null
          registration_cpf?: string | null
          registration_name?: string | null
          resumo_atendimento?: string | null
          scheduled_date?: string | null
          status?: string
          tipo_atendimento?: Database["public"]["Enums"]["tipo_atendimento"]
          unit_id?: string | null
          updated_at?: string
          valorization_confirmed?: boolean | null
        }
        Update: {
          active?: boolean
          age_range?: string | null
          concatena?: boolean | null
          concatena_tempo?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          etapa_bot?: Database["public"]["Enums"]["etapa-do-bot"] | null
          id?: string
          lead_quality_score?: number | null
          lead_source?: string
          meta_id?: string | null
          msg_concatenada?: string[]
          name?: string
          next_contact_date?: string | null
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number?: string
          primeiro_nome?: string | null
          registration_cpf?: string | null
          registration_name?: string | null
          resumo_atendimento?: string | null
          scheduled_date?: string | null
          status?: string
          tipo_atendimento?: Database["public"]["Enums"]["tipo_atendimento"]
          unit_id?: string | null
          updated_at?: string
          valorization_confirmed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_duplicate_lead_source_fkey"
            columns: ["lead_source"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_duplicate_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_duplicate_unit_id_fkey1"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_calculations: {
        Row: {
          consolidated_at: string | null
          consolidated_by: string | null
          consultant_id: string
          created_at: string
          details: Json
          formula_id: string | null
          id: string
          is_consolidated: boolean
          month: string
          total_commission: number
          total_sales: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          consolidated_at?: string | null
          consolidated_by?: string | null
          consultant_id: string
          created_at?: string
          details?: Json
          formula_id?: string | null
          id?: string
          is_consolidated?: boolean
          month: string
          total_commission?: number
          total_sales?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          consolidated_at?: string | null
          consolidated_by?: string | null
          consultant_id?: string
          created_at?: string
          details?: Json
          formula_id?: string | null
          id?: string
          is_consolidated?: boolean
          month?: string
          total_commission?: number
          total_sales?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_calculations_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "commission_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_calculations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_formulas: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          formula_expression: string
          formula_name: string
          id: string
          unit_id: string
          updated_at: string
          valid_from: string
          valid_until: string | null
          variables_config: Json
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          formula_expression: string
          formula_name: string
          id?: string
          unit_id: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          variables_config?: Json
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          formula_expression?: string
          formula_name?: string
          id?: string
          unit_id?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          variables_config?: Json
        }
        Relationships: [
          {
            foreignKeyName: "commission_formulas_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_sale_details: {
        Row: {
          activity_id: string
          calculation_id: string
          client_name: string
          created_at: string
          enrollment_amount: number | null
          id: string
          material_amount: number | null
          monthly_fee_amount: number | null
          sale_commission: number
          sale_date: string
        }
        Insert: {
          activity_id: string
          calculation_id: string
          client_name: string
          created_at?: string
          enrollment_amount?: number | null
          id?: string
          material_amount?: number | null
          monthly_fee_amount?: number | null
          sale_commission?: number
          sale_date: string
        }
        Update: {
          activity_id?: string
          calculation_id?: string
          client_name?: string
          created_at?: string
          enrollment_amount?: number | null
          id?: string
          material_amount?: number | null
          monthly_fee_amount?: number | null
          sale_commission?: number
          sale_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_sale_details_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "atividade_pos_venda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_sale_details_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "commission_calculations"
            referencedColumns: ["id"]
          },
        ]
      }
      convidados: {
        Row: {
          created_at: string
          enviado_crm: boolean | null
          evento: string | null
          "forma de pagamento":
            | Database["public"]["Enums"]["forma_de_pagamento"]
            | null
          id: string
          nome: string | null
          Observaçoes: string | null
          "perfil-idade": Database["public"]["Enums"]["Perfil_idade"] | null
          telefone: string | null
          unidade: string
          viculado_a_aluno: string | null
          vinculo_aluno: Database["public"]["Enums"]["Vinculo_aluno"] | null
        }
        Insert: {
          created_at?: string
          enviado_crm?: boolean | null
          evento?: string | null
          "forma de pagamento"?:
            | Database["public"]["Enums"]["forma_de_pagamento"]
            | null
          id?: string
          nome?: string | null
          Observaçoes?: string | null
          "perfil-idade"?: Database["public"]["Enums"]["Perfil_idade"] | null
          telefone?: string | null
          unidade: string
          viculado_a_aluno?: string | null
          vinculo_aluno?: Database["public"]["Enums"]["Vinculo_aluno"] | null
        }
        Update: {
          created_at?: string
          enviado_crm?: boolean | null
          evento?: string | null
          "forma de pagamento"?:
            | Database["public"]["Enums"]["forma_de_pagamento"]
            | null
          id?: string
          nome?: string | null
          Observaçoes?: string | null
          "perfil-idade"?: Database["public"]["Enums"]["Perfil_idade"] | null
          telefone?: string | null
          unidade?: string
          viculado_a_aluno?: string | null
          vinculo_aluno?: Database["public"]["Enums"]["Vinculo_aluno"] | null
        }
        Relationships: [
          {
            foreignKeyName: "convidados_evento_fkey"
            columns: ["evento"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convidados_unidade_fkey"
            columns: ["unidade"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convidados_viculado_a_aluno_fkey"
            columns: ["viculado_a_aluno"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          enrolled_at: string
          id: string
          student_id: string
          student_source: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          enrolled_at?: string
          id?: string
          student_id: string
          student_source: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          enrolled_at?: string
          id?: string
          student_id?: string
          student_source?: string
          updated_at?: string
        }
        Relationships: []
      }
      dados_importantes: {
        Row: {
          data: string | null
          id: number
          key: string
        }
        Insert: {
          data?: string | null
          id?: number
          key: string
        }
        Update: {
          data?: string | null
          id?: number
          key?: string
        }
        Relationships: []
      }
      data_imports: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          error_log: Json | null
          file_name: string
          id: string
          import_type: string
          processed_rows: number | null
          status: string
          total_rows: number | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          error_log?: Json | null
          file_name: string
          id?: string
          import_type: string
          processed_rows?: number | null
          status?: string
          total_rows?: number | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          error_log?: Json | null
          file_name?: string
          id?: string
          import_type?: string
          processed_rows?: number | null
          status?: string
          total_rows?: number | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_imports_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      devolutivas_config: {
        Row: {
          created_at: string | null
          id: string
          texto_geral: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          texto_geral?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          texto_geral?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      estoque: {
        Row: {
          created_at: string
          id: string
          nome: string
          quantidade: number
          tipo_item: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          quantidade?: number
          tipo_item: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          quantidade?: number
          tipo_item?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      evento_participantes: {
        Row: {
          aluno_id: string
          created_at: string
          evento_id: string
          forma_pagamento: string
          id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          evento_id: string
          forma_pagamento: string
          id?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          evento_id?: string
          forma_pagamento?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_participantes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_participantes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          data_evento: string
          descricao: string | null
          id: string
          local: string | null
          numero_vagas: number
          responsavel: string | null
          tipo: string
          titulo: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          data_evento: string
          descricao?: string | null
          id?: string
          local?: string | null
          numero_vagas?: number
          responsavel?: string | null
          tipo?: string
          titulo: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          data_evento?: string
          descricao?: string | null
          id?: string
          local?: string | null
          numero_vagas?: number
          responsavel?: string | null
          tipo?: string
          titulo?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      faltas_antecipadas: {
        Row: {
          active: boolean
          aluno_id: string
          created_at: string
          created_by: string | null
          data_falta: string
          id: string
          observacoes: string | null
          responsavel_aviso_id: string
          responsavel_aviso_nome: string
          responsavel_aviso_tipo: string
          turma_id: string
          unit_id: string
        }
        Insert: {
          active?: boolean
          aluno_id: string
          created_at?: string
          created_by?: string | null
          data_falta: string
          id?: string
          observacoes?: string | null
          responsavel_aviso_id: string
          responsavel_aviso_nome: string
          responsavel_aviso_tipo: string
          turma_id: string
          unit_id: string
        }
        Update: {
          active?: boolean
          aluno_id?: string
          created_at?: string
          created_by?: string | null
          data_falta?: string
          id?: string
          observacoes?: string | null
          responsavel_aviso_id?: string
          responsavel_aviso_nome?: string
          responsavel_aviso_tipo?: string
          turma_id?: string
          unit_id?: string
        }
        Relationships: []
      }
      faq: {
        Row: {
          created_at: string
          faq: string | null
          id: number
        }
        Insert: {
          created_at?: string
          faq?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          faq?: string | null
          id?: number
        }
        Relationships: []
      }
      financial_responsibles: {
        Row: {
          birth_date: string
          city: string
          complement: string | null
          country: string
          cpf: string
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          mobile_phone: string
          neighborhood: string
          number: string
          observations: string | null
          postal_code: string
          profession: string
          state: string
          street: string
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          birth_date: string
          city: string
          complement?: string | null
          country?: string
          cpf: string
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          mobile_phone: string
          neighborhood: string
          number: string
          observations?: string | null
          postal_code: string
          profession: string
          state: string
          street: string
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          birth_date?: string
          city?: string
          complement?: string | null
          country?: string
          cpf?: string
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          mobile_phone?: string
          neighborhood?: string
          number?: string
          observations?: string | null
          postal_code?: string
          profession?: string
          state?: string
          street?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_responsibles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionalidades_unidade: {
        Row: {
          ativa: boolean
          configuracao: Json | null
          created_at: string | null
          data_habilitacao: string | null
          id: string
          tipo_funcionalidade: Database["public"]["Enums"]["tipo_funcionalidade"]
          unit_id: string
          updated_at: string | null
          usuario_habilitou: string | null
        }
        Insert: {
          ativa?: boolean
          configuracao?: Json | null
          created_at?: string | null
          data_habilitacao?: string | null
          id?: string
          tipo_funcionalidade: Database["public"]["Enums"]["tipo_funcionalidade"]
          unit_id: string
          updated_at?: string | null
          usuario_habilitou?: string | null
        }
        Update: {
          ativa?: boolean
          configuracao?: Json | null
          created_at?: string | null
          data_habilitacao?: string | null
          id?: string
          tipo_funcionalidade?: Database["public"]["Enums"]["tipo_funcionalidade"]
          unit_id?: string
          updated_at?: string | null
          usuario_habilitou?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionalidades_unidade_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          active: boolean
          avaliacao_abaco: string | null
          avaliacao_ah: string | null
          cargo: string | null
          codigo: string | null
          coordenador_responsavel: string | null
          created_at: string
          curso: string | null
          data_onboarding: string | null
          dias_apostila: number | null
          dias_supera: number | null
          email: string | null
          faltas_consecutivas: number
          foto_devolutiva_url: string | null
          foto_url: string | null
          id: string
          idade: number | null
          indice: string | null
          is_funcionario: boolean | null
          matricula: string | null
          motivo_procura: string | null
          niveldesafio: string | null
          nome: string
          percepcao_coordenador: string | null
          pontos_atencao: string | null
          telefone: string | null
          texto_devolutiva: string | null
          turma_id: string | null
          ultima_correcao_ah: string | null
          ultima_falta: string | null
          ultima_pagina: number | null
          ultimo_nivel: string | null
          unit_id: string
          vencimento_contrato: string | null
        }
        Insert: {
          active?: boolean
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          cargo?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          faltas_consecutivas?: number
          foto_devolutiva_url?: string | null
          foto_url?: string | null
          id?: string
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome: string
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultimo_nivel?: string | null
          unit_id: string
          vencimento_contrato?: string | null
        }
        Update: {
          active?: boolean
          avaliacao_abaco?: string | null
          avaliacao_ah?: string | null
          cargo?: string | null
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
          faltas_consecutivas?: number
          foto_devolutiva_url?: string | null
          foto_url?: string | null
          id?: string
          idade?: number | null
          indice?: string | null
          is_funcionario?: boolean | null
          matricula?: string | null
          motivo_procura?: string | null
          niveldesafio?: string | null
          nome?: string
          percepcao_coordenador?: string | null
          pontos_atencao?: string | null
          telefone?: string | null
          texto_devolutiva?: string | null
          turma_id?: string | null
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultimo_nivel?: string | null
          unit_id?: string
          vencimento_contrato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "calendario_turmas_view"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "funcionarios_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_cards: {
        Row: {
          acao_retencao: string | null
          acordo_retencao: string | null
          alerta_evasao_id: string
          aluno_nome: string | null
          column_id: string
          created_at: string
          data_evasao: string | null
          data_exclusao_sgs: string | null
          data_rescisao: string | null
          data_retencao_confirmada: string | null
          description: string | null
          due_date: string | null
          educador: string | null
          exclusao_sgs_confirmada: boolean | null
          exclusao_whatsapp_confirmada: boolean | null
          faltas_recorrentes: boolean | null
          fez_pausa_emergencial: boolean | null
          historico: string | null
          id: string
          link_ficha_rescisao: string | null
          motivo_evasao: string | null
          observacoes_adicionais: string | null
          origem: string | null
          priority: string | null
          responsavel: string | null
          resultado: string | null
          retention_date: string | null
          tags: string[] | null
          title: string
          turma: string | null
          updated_at: string
        }
        Insert: {
          acao_retencao?: string | null
          acordo_retencao?: string | null
          alerta_evasao_id: string
          aluno_nome?: string | null
          column_id?: string
          created_at?: string
          data_evasao?: string | null
          data_exclusao_sgs?: string | null
          data_rescisao?: string | null
          data_retencao_confirmada?: string | null
          description?: string | null
          due_date?: string | null
          educador?: string | null
          exclusao_sgs_confirmada?: boolean | null
          exclusao_whatsapp_confirmada?: boolean | null
          faltas_recorrentes?: boolean | null
          fez_pausa_emergencial?: boolean | null
          historico?: string | null
          id?: string
          link_ficha_rescisao?: string | null
          motivo_evasao?: string | null
          observacoes_adicionais?: string | null
          origem?: string | null
          priority?: string | null
          responsavel?: string | null
          resultado?: string | null
          retention_date?: string | null
          tags?: string[] | null
          title: string
          turma?: string | null
          updated_at?: string
        }
        Update: {
          acao_retencao?: string | null
          acordo_retencao?: string | null
          alerta_evasao_id?: string
          aluno_nome?: string | null
          column_id?: string
          created_at?: string
          data_evasao?: string | null
          data_exclusao_sgs?: string | null
          data_rescisao?: string | null
          data_retencao_confirmada?: string | null
          description?: string | null
          due_date?: string | null
          educador?: string | null
          exclusao_sgs_confirmada?: boolean | null
          exclusao_whatsapp_confirmada?: boolean | null
          faltas_recorrentes?: boolean | null
          fez_pausa_emergencial?: boolean | null
          historico?: string | null
          id?: string
          link_ficha_rescisao?: string | null
          motivo_evasao?: string | null
          observacoes_adicionais?: string | null
          origem?: string | null
          priority?: string | null
          responsavel?: string | null
          resultado?: string | null
          retention_date?: string | null
          tags?: string[] | null
          title?: string
          turma?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_cards_alerta_evasao_id_fkey"
            columns: ["alerta_evasao_id"]
            isOneToOne: false
            referencedRelation: "alerta_evasao"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_versions: {
        Row: {
          active: boolean
          created_at: string
          current_stock: number
          id: string
          kit_type_id: string
          unit_id: string
          updated_at: string
          version: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          current_stock?: number
          id?: string
          kit_type_id: string
          unit_id: string
          updated_at?: string
          version: string
        }
        Update: {
          active?: boolean
          created_at?: string
          current_stock?: number
          id?: string
          kit_type_id?: string
          unit_id?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_versions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_system: boolean
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id: string
          is_system?: boolean
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_system?: boolean
          name?: string
        }
        Relationships: []
      }
      loss_reason_categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      loss_reasons: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "loss_reasons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "loss_reason_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_bot_mensagens: {
        Row: {
          concatena: boolean | null
          concatena_tempo: string | null
          created_at: string
          id: number
          msg_concatenada: string[] | null
          nome: string | null
        }
        Insert: {
          concatena?: boolean | null
          concatena_tempo?: string | null
          created_at?: string
          id?: number
          msg_concatenada?: string[] | null
          nome?: string | null
        }
        Update: {
          concatena?: boolean | null
          concatena_tempo?: string | null
          created_at?: string
          id?: number
          msg_concatenada?: string[] | null
          nome?: string | null
        }
        Relationships: []
      }
      pedagogical_enrollments: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string | null
          id: string
          inaugural_class_date: string | null
          kit_version_id: string | null
          status: string
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inaugural_class_date?: string | null
          kit_version_id?: string | null
          status?: string
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inaugural_class_date?: string | null
          kit_version_id?: string | null
          status?: string
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedagogical_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedagogical_enrollments_kit_version_id_fkey"
            columns: ["kit_version_id"]
            isOneToOne: false
            referencedRelation: "kit_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedagogical_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      pedagogical_schedules: {
        Row: {
          active: boolean
          class_id: string
          created_at: string
          created_by: string
          id: string
          observations: string | null
          schedule_date: string
          status: string
          student_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          class_id: string
          created_at?: string
          created_by: string
          id?: string
          observations?: string | null
          schedule_date: string
          status?: string
          student_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          class_id?: string
          created_at?: string
          created_by?: string
          id?: string
          observations?: string | null
          schedule_date?: string
          status?: string
          student_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedagogical_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedagogical_schedules_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedagogical_schedules_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_venda_atividades_config: {
        Row: {
          ativa: boolean
          created_at: string
          created_by: string
          descricao: string | null
          id: string
          nome: string
          ordem: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          created_by: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          created_by?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pos_venda_config_unit"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_venda_atividades_realizadas: {
        Row: {
          atividade_config_id: string
          atividade_pos_venda_id: string
          created_at: string
          data_realizacao: string | null
          id: string
          realizada: boolean
          updated_at: string
          usuario_realizou: string | null
        }
        Insert: {
          atividade_config_id: string
          atividade_pos_venda_id: string
          created_at?: string
          data_realizacao?: string | null
          id?: string
          realizada?: boolean
          updated_at?: string
          usuario_realizou?: string | null
        }
        Update: {
          atividade_config_id?: string
          atividade_pos_venda_id?: string
          created_at?: string
          data_realizacao?: string | null
          id?: string
          realizada?: boolean
          updated_at?: string
          usuario_realizou?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pos_venda_realizadas_config"
            columns: ["atividade_config_id"]
            isOneToOne: false
            referencedRelation: "pos_venda_atividades_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_venda_atividades_realizadas_usuario_realizou_fkey"
            columns: ["usuario_realizou"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          published_at: string | null
          scheduled_for: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          published_at?: string | null
          scheduled_for: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          published_at?: string | null
          scheduled_for?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      produtividade_abaco: {
        Row: {
          aluno_nome: string | null
          apostila: string | null
          comentario: string | null
          created_at: string
          data_aula: string
          erros: number | null
          exercicios: number | null
          fez_desafio: boolean | null
          id: string
          is_reposicao: boolean
          motivo_falta: string | null
          pagina: string | null
          pessoa_id: string
          presente: boolean
          tipo_pessoa: string | null
          updated_at: string
        }
        Insert: {
          aluno_nome?: string | null
          apostila?: string | null
          comentario?: string | null
          created_at?: string
          data_aula: string
          erros?: number | null
          exercicios?: number | null
          fez_desafio?: boolean | null
          id?: string
          is_reposicao?: boolean
          motivo_falta?: string | null
          pagina?: string | null
          pessoa_id: string
          presente?: boolean
          tipo_pessoa?: string | null
          updated_at?: string
        }
        Update: {
          aluno_nome?: string | null
          apostila?: string | null
          comentario?: string | null
          created_at?: string
          data_aula?: string
          erros?: number | null
          exercicios?: number | null
          fez_desafio?: boolean | null
          id?: string
          is_reposicao?: boolean
          motivo_falta?: string | null
          pagina?: string | null
          pessoa_id?: string
          presente?: boolean
          tipo_pessoa?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      produtividade_abaco_backup: {
        Row: {
          aluno_nome: string | null
          apostila: string | null
          comentario: string | null
          created_at: string | null
          data_aula: string | null
          erros: number | null
          exercicios: number | null
          fez_desafio: boolean | null
          id: string | null
          is_reposicao: boolean | null
          motivo_falta: string | null
          pagina: string | null
          pessoa_id: string | null
          presente: boolean | null
          tipo_pessoa: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_nome?: string | null
          apostila?: string | null
          comentario?: string | null
          created_at?: string | null
          data_aula?: string | null
          erros?: number | null
          exercicios?: number | null
          fez_desafio?: boolean | null
          id?: string | null
          is_reposicao?: boolean | null
          motivo_falta?: string | null
          pagina?: string | null
          pessoa_id?: string | null
          presente?: boolean | null
          tipo_pessoa?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_nome?: string | null
          apostila?: string | null
          comentario?: string | null
          created_at?: string | null
          data_aula?: string | null
          erros?: number | null
          exercicios?: number | null
          fez_desafio?: boolean | null
          id?: string | null
          is_reposicao?: boolean | null
          motivo_falta?: string | null
          pagina?: string | null
          pessoa_id?: string | null
          presente?: boolean | null
          tipo_pessoa?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      produtividade_ah: {
        Row: {
          ah_recolhida_id: number | null
          aluno_nome: string | null
          apostila: string | null
          comentario: string | null
          created_at: string
          data_fim_correcao: string | null
          erros: number | null
          exercicios: number | null
          id: string
          pessoa_id: string
          professor_correcao: string | null
          tipo_pessoa: string
          updated_at: string
        }
        Insert: {
          ah_recolhida_id?: number | null
          aluno_nome?: string | null
          apostila?: string | null
          comentario?: string | null
          created_at?: string
          data_fim_correcao?: string | null
          erros?: number | null
          exercicios?: number | null
          id?: string
          pessoa_id: string
          professor_correcao?: string | null
          tipo_pessoa?: string
          updated_at?: string
        }
        Update: {
          ah_recolhida_id?: number | null
          aluno_nome?: string | null
          apostila?: string | null
          comentario?: string | null
          created_at?: string
          data_fim_correcao?: string | null
          erros?: number | null
          exercicios?: number | null
          id?: string
          pessoa_id?: string
          professor_correcao?: string | null
          tipo_pessoa?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_ah_ah_recolhida_id_fkey"
            columns: ["ah_recolhida_id"]
            isOneToOne: false
            referencedRelation: "ah_recolhidas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtividade_ah_backup: {
        Row: {
          apostila: string | null
          comentario: string | null
          created_at: string | null
          erros: number | null
          exercicios: number | null
          id: string | null
          pessoa_id: string | null
          professor_correcao: string | null
          tipo_pessoa: string | null
          updated_at: string | null
        }
        Insert: {
          apostila?: string | null
          comentario?: string | null
          created_at?: string | null
          erros?: number | null
          exercicios?: number | null
          id?: string | null
          pessoa_id?: string | null
          professor_correcao?: string | null
          tipo_pessoa?: string | null
          updated_at?: string | null
        }
        Update: {
          apostila?: string | null
          comentario?: string | null
          created_at?: string | null
          erros?: number | null
          exercicios?: number | null
          id?: string | null
          pessoa_id?: string | null
          professor_correcao?: string | null
          tipo_pessoa?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      professores: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          slack_username: string | null
          status: boolean | null
          telefone: string | null
          ultima_sincronizacao: string | null
          unit_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          slack_username?: string | null
          status?: boolean | null
          telefone?: string | null
          ultima_sincronizacao?: string | null
          unit_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          slack_username?: string | null
          status?: boolean | null
          telefone?: string | null
          ultima_sincronizacao?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professores_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      professores_backup1: {
        Row: {
          active: boolean
          backup_created_at: string
          backup_created_by: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          original_id: string
          slack_username: string | null
          status: string | null
          telefone: string | null
          ultima_sincronizacao: string | null
          unit_id: string
        }
        Insert: {
          active?: boolean
          backup_created_at?: string
          backup_created_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          original_id: string
          slack_username?: string | null
          status?: string | null
          telefone?: string | null
          ultima_sincronizacao?: string | null
          unit_id: string
        }
        Update: {
          active?: boolean
          backup_created_at?: string
          backup_created_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          original_id?: string
          slack_username?: string | null
          status?: string | null
          telefone?: string | null
          ultima_sincronizacao?: string | null
          unit_id?: string
        }
        Relationships: []
      }
      professores_backup2: {
        Row: {
          active: boolean
          backup_created_at: string
          backup_created_by: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          original_id: string
          slack_username: string | null
          status: string | null
          telefone: string | null
          ultima_sincronizacao: string | null
          unit_id: string
        }
        Insert: {
          active?: boolean
          backup_created_at?: string
          backup_created_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          original_id: string
          slack_username?: string | null
          status?: string | null
          telefone?: string | null
          ultima_sincronizacao?: string | null
          unit_id: string
        }
        Update: {
          active?: boolean
          backup_created_at?: string
          backup_created_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          original_id?: string
          slack_username?: string | null
          status?: string | null
          telefone?: string | null
          ultima_sincronizacao?: string | null
          unit_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_blocked: boolean | null
          avatar_url: string | null
          calendar_id: string | null
          created_at: string
          email: string | null
          email_confirmed: boolean | null
          first_access_at: string | null
          full_name: string | null
          g_access_token: string | null
          g_refresh_token: string | null
          g_token_expiration: string | null
          gcalendar_id: string | null
          google_calendars: Json | null
          google_email: string | null
          google_id: string | null
          id: string
          is_admin: boolean | null
          must_change_password: boolean | null
          role: string | null
          updated_at: string
        }
        Insert: {
          access_blocked?: boolean | null
          avatar_url?: string | null
          calendar_id?: string | null
          created_at?: string
          email?: string | null
          email_confirmed?: boolean | null
          first_access_at?: string | null
          full_name?: string | null
          g_access_token?: string | null
          g_refresh_token?: string | null
          g_token_expiration?: string | null
          gcalendar_id?: string | null
          google_calendars?: Json | null
          google_email?: string | null
          google_id?: string | null
          id: string
          is_admin?: boolean | null
          must_change_password?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          access_blocked?: boolean | null
          avatar_url?: string | null
          calendar_id?: string | null
          created_at?: string
          email?: string | null
          email_confirmed?: boolean | null
          first_access_at?: string | null
          full_name?: string | null
          g_access_token?: string | null
          g_refresh_token?: string | null
          g_token_expiration?: string | null
          gcalendar_id?: string | null
          google_calendars?: Json | null
          google_email?: string | null
          google_id?: string | null
          id?: string
          is_admin?: boolean | null
          must_change_password?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projeto_sao_rafael_textos: {
        Row: {
          created_at: string
          id: string
          mes_ano: string
          texto_geral: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mes_ano: string
          texto_geral?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mes_ano?: string
          texto_geral?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      reposicoes: {
        Row: {
          aluno_id: string | null
          created_at: string
          created_by: string | null
          data_falta: string | null
          data_reposicao: string
          id: string
          nome_responsavel: string | null
          observacoes: string | null
          pessoa_id: string
          pessoa_tipo: string | null
          responsavel_id: string
          responsavel_tipo: string
          turma_id: string
          unit_id: string
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string
          created_by?: string | null
          data_falta?: string | null
          data_reposicao: string
          id?: string
          nome_responsavel?: string | null
          observacoes?: string | null
          pessoa_id: string
          pessoa_tipo?: string | null
          responsavel_id: string
          responsavel_tipo: string
          turma_id: string
          unit_id: string
        }
        Update: {
          aluno_id?: string | null
          created_at?: string
          created_by?: string | null
          data_falta?: string | null
          data_reposicao?: string
          id?: string
          nome_responsavel?: string | null
          observacoes?: string | null
          pessoa_id?: string
          pessoa_tipo?: string | null
          responsavel_id?: string
          responsavel_tipo?: string
          turma_id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposicoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "calendario_turmas_view"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "reposicoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      resultados_alunos: {
        Row: {
          abaco_absoluto: number
          aluno_id: string
          aula_id: string | null
          created_at: string
          data_aula: string
          id: string
          mental_absoluto: number
          updated_at: string
        }
        Insert: {
          abaco_absoluto: number
          aluno_id: string
          aula_id?: string | null
          created_at?: string
          data_aula: string
          id?: string
          mental_absoluto: number
          updated_at?: string
        }
        Update: {
          abaco_absoluto?: number
          aluno_id?: string
          aula_id?: string | null
          created_at?: string
          data_aula?: string
          id?: string
          mental_absoluto?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resultados_alunos_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      retencoes: {
        Row: {
          acoes_tomadas: string
          active: boolean
          aluno_id: string
          created_at: string
          data_retencao: string
          descritivo_responsavel: string
          id: string
          responsavel_id: string
          responsavel_nome: string
          responsavel_tipo: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          acoes_tomadas: string
          active?: boolean
          aluno_id: string
          created_at?: string
          data_retencao: string
          descritivo_responsavel: string
          id?: string
          responsavel_id: string
          responsavel_nome: string
          responsavel_tipo: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          acoes_tomadas?: string
          active?: boolean
          aluno_id?: string
          created_at?: string
          data_retencao?: string
          descritivo_responsavel?: string
          id?: string
          responsavel_id?: string
          responsavel_nome?: string
          responsavel_tipo?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sale_webhooks: {
        Row: {
          active: boolean
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          last_failure: string | null
          last_success: string | null
          unit_id: string | null
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_failure?: string | null
          last_success?: string | null
          unit_id?: string | null
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_failure?: string | null
          last_success?: string | null
          unit_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_webhooks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          active: boolean
          attendance_activity_id: string
          client_id: string
          created_at: string
          created_by: string | null
          enrollment_amount: number
          enrollment_installments: number
          enrollment_payment_date: string
          enrollment_payment_method: Database["public"]["Enums"]["payment_method"]
          first_monthly_fee_date: string
          id: string
          important_info: string | null
          material_amount: number
          material_installments: number
          material_payment_date: string
          material_payment_method: Database["public"]["Enums"]["payment_method"]
          monthly_fee_amount: number
          monthly_fee_due_day: Database["public"]["Enums"]["due_day"] | null
          monthly_fee_payment_method: Database["public"]["Enums"]["payment_method"]
          photo_thumbnail_url: string | null
          photo_url: string | null
          sale_type: Database["public"]["Enums"]["sale_type"]
          student_id: string | null
          student_name: string
          student_photo_thumbnail_url: string | null
          student_photo_url: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          attendance_activity_id: string
          client_id: string
          created_at?: string
          created_by?: string | null
          enrollment_amount: number
          enrollment_installments: number
          enrollment_payment_date: string
          enrollment_payment_method: Database["public"]["Enums"]["payment_method"]
          first_monthly_fee_date: string
          id?: string
          important_info?: string | null
          material_amount: number
          material_installments: number
          material_payment_date: string
          material_payment_method: Database["public"]["Enums"]["payment_method"]
          monthly_fee_amount: number
          monthly_fee_due_day?: Database["public"]["Enums"]["due_day"] | null
          monthly_fee_payment_method: Database["public"]["Enums"]["payment_method"]
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          sale_type?: Database["public"]["Enums"]["sale_type"]
          student_id?: string | null
          student_name: string
          student_photo_thumbnail_url?: string | null
          student_photo_url?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          attendance_activity_id?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          enrollment_amount?: number
          enrollment_installments?: number
          enrollment_payment_date?: string
          enrollment_payment_method?: Database["public"]["Enums"]["payment_method"]
          first_monthly_fee_date?: string
          id?: string
          important_info?: string | null
          material_amount?: number
          material_installments?: number
          material_payment_date?: string
          material_payment_method?: Database["public"]["Enums"]["payment_method"]
          monthly_fee_amount?: number
          monthly_fee_due_day?: Database["public"]["Enums"]["due_day"] | null
          monthly_fee_payment_method?: Database["public"]["Enums"]["payment_method"]
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          sale_type?: Database["public"]["Enums"]["sale_type"]
          student_id?: string | null
          student_name?: string
          student_photo_thumbnail_url?: string | null
          student_photo_url?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sales_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_attendance_activity_id_fkey"
            columns: ["attendance_activity_id"]
            isOneToOne: false
            referencedRelation: "client_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "kanban_client_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          sale_id: string
          unit_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          sale_id: string
          unit_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          sale_id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_history_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_history_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_occupations: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          duration_minutes: number
          id: string
          start_datetime: string
          title: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          duration_minutes?: number
          id?: string
          start_datetime: string
          title: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          start_datetime?: string
          title?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_occupations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      student_logs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          student_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          student_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          active: boolean
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_postal_code: string | null
          address_state: string | null
          address_street: string | null
          alternative_phone: string | null
          birth_city: string | null
          birth_date: string | null
          birth_state: string | null
          client_id: string
          commercial_data_completed: boolean | null
          cpf: string | null
          created_at: string
          created_by: string | null
          education_level: string | null
          email: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          is_own_financial_responsible: boolean | null
          landline_phone: string | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          mobile_phone: string | null
          pedagogical_data_completed: boolean | null
          photo_thumbnail_url: string | null
          photo_url: string | null
          profession: string | null
          rg: string | null
          ssp: string | null
          status: Database["public"]["Enums"]["student_status"] | null
          unit_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street?: string | null
          alternative_phone?: string | null
          birth_city?: string | null
          birth_date?: string | null
          birth_state?: string | null
          client_id: string
          commercial_data_completed?: boolean | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          education_level?: string | null
          email?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_own_financial_responsible?: boolean | null
          landline_phone?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          mobile_phone?: string | null
          pedagogical_data_completed?: boolean | null
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          profession?: string | null
          rg?: string | null
          ssp?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
          unit_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          address_street?: string | null
          alternative_phone?: string | null
          birth_city?: string | null
          birth_date?: string | null
          birth_state?: string | null
          client_id?: string
          commercial_data_completed?: boolean | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          education_level?: string | null
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_own_financial_responsible?: boolean | null
          landline_phone?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          mobile_phone?: string | null
          pedagogical_data_completed?: boolean | null
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          profession?: string | null
          rg?: string | null
          ssp?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
          unit_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "kanban_client_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      system_pages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          path: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          path: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          path?: string
        }
        Relationships: []
      }
      system_updates: {
        Row: {
          active: boolean
          build_version: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          published: boolean
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          build_version?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          published?: boolean
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          build_version?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          published?: boolean
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      temp_produtividade_abaco: {
        Row: {
          fez_desafio: boolean | null
          id: string
          presente: boolean | null
        }
        Insert: {
          fez_desafio?: boolean | null
          id: string
          presente?: boolean | null
        }
        Update: {
          fez_desafio?: boolean | null
          id?: string
          presente?: boolean | null
        }
        Relationships: []
      }
      trofeus_1000_dias: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
          trofeu_confeccionado: boolean
          trofeu_entregue: boolean
          trofeu_pedido: boolean
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          id?: string
          trofeu_confeccionado?: boolean
          trofeu_entregue?: boolean
          trofeu_pedido?: boolean
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
          trofeu_confeccionado?: boolean
          trofeu_entregue?: boolean
          trofeu_pedido?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          active: boolean | null
          created_at: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          id: string
          nome: string
          professor_id: string
          projeto: boolean | null
          sala: string | null
          ultima_sincronizacao: string | null
          unit_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          id?: string
          nome: string
          professor_id: string
          projeto?: boolean | null
          sala?: string | null
          ultima_sincronizacao?: string | null
          unit_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          dia_semana?: Database["public"]["Enums"]["dia_semana"]
          id?: string
          nome?: string
          professor_id?: string
          projeto?: boolean | null
          sala?: string | null
          ultima_sincronizacao?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_professor_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas_backup1: {
        Row: {
          active: boolean
          backup_created_at: string
          backup_created_by: string | null
          categoria: string | null
          cor_identificacao: string | null
          created_at: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          horario_fim: string
          horario_inicio: string
          id: string
          max_alunos: number | null
          nome: string
          observacoes: string | null
          original_id: string
          professor_id: string | null
          sala: string | null
          status: string | null
          ultima_sincronizacao: string | null
          unit_id: string
          whatsapp_grupo: string | null
        }
        Insert: {
          active?: boolean
          backup_created_at?: string
          backup_created_by?: string | null
          categoria?: string | null
          cor_identificacao?: string | null
          created_at?: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          max_alunos?: number | null
          nome: string
          observacoes?: string | null
          original_id: string
          professor_id?: string | null
          sala?: string | null
          status?: string | null
          ultima_sincronizacao?: string | null
          unit_id: string
          whatsapp_grupo?: string | null
        }
        Update: {
          active?: boolean
          backup_created_at?: string
          backup_created_by?: string | null
          categoria?: string | null
          cor_identificacao?: string | null
          created_at?: string
          dia_semana?: Database["public"]["Enums"]["dia_semana"]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          max_alunos?: number | null
          nome?: string
          observacoes?: string | null
          original_id?: string
          professor_id?: string | null
          sala?: string | null
          status?: string | null
          ultima_sincronizacao?: string | null
          unit_id?: string
          whatsapp_grupo?: string | null
        }
        Relationships: []
      }
      turmas_backup2: {
        Row: {
          active: boolean
          backup_created_at: string
          backup_created_by: string | null
          categoria: string | null
          cor_identificacao: string | null
          created_at: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          horario_fim: string
          horario_inicio: string
          id: string
          max_alunos: number | null
          nome: string
          observacoes: string | null
          original_id: string
          professor_id: string | null
          sala: string | null
          status: string | null
          ultima_sincronizacao: string | null
          unit_id: string
          whatsapp_grupo: string | null
        }
        Insert: {
          active?: boolean
          backup_created_at?: string
          backup_created_by?: string | null
          categoria?: string | null
          cor_identificacao?: string | null
          created_at?: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          max_alunos?: number | null
          nome: string
          observacoes?: string | null
          original_id: string
          professor_id?: string | null
          sala?: string | null
          status?: string | null
          ultima_sincronizacao?: string | null
          unit_id: string
          whatsapp_grupo?: string | null
        }
        Update: {
          active?: boolean
          backup_created_at?: string
          backup_created_by?: string | null
          categoria?: string | null
          cor_identificacao?: string | null
          created_at?: string
          dia_semana?: Database["public"]["Enums"]["dia_semana"]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          max_alunos?: number | null
          nome?: string
          observacoes?: string | null
          original_id?: string
          professor_id?: string | null
          sala?: string | null
          status?: string | null
          ultima_sincronizacao?: string | null
          unit_id?: string
          whatsapp_grupo?: string | null
        }
        Relationships: []
      }
      unidades: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      unit_users: {
        Row: {
          active: boolean
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          unit_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          unit_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          unit_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_unit_users_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_users_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          active: boolean
          city: string
          cnpj: string
          company_name: string
          complement: string | null
          created_at: string
          email: string | null
          enrollment_fee: number | null
          evolution_instance_name: string | null
          evolutionapi_token: string | null
          id: string
          legal_representative: string | null
          material_fee: number | null
          monthly_fee: number | null
          name: string
          neighborhood: string
          number: string
          phone: string | null
          postal_code: string
          region_id: string | null
          state: string
          street: string
          trading_name: string | null
          unit_number: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          city: string
          cnpj: string
          company_name: string
          complement?: string | null
          created_at?: string
          email?: string | null
          enrollment_fee?: number | null
          evolution_instance_name?: string | null
          evolutionapi_token?: string | null
          id?: string
          legal_representative?: string | null
          material_fee?: number | null
          monthly_fee?: number | null
          name: string
          neighborhood: string
          number: string
          phone?: string | null
          postal_code: string
          region_id?: string | null
          state: string
          street: string
          trading_name?: string | null
          unit_number: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          city?: string
          cnpj?: string
          company_name?: string
          complement?: string | null
          created_at?: string
          email?: string | null
          enrollment_fee?: number | null
          evolution_instance_name?: string | null
          evolutionapi_token?: string | null
          id?: string
          legal_representative?: string | null
          material_fee?: number | null
          monthly_fee?: number | null
          name?: string
          neighborhood?: string
          number?: string
          phone?: string | null
          postal_code?: string
          region_id?: string | null
          state?: string
          street?: string
          trading_name?: string | null
          unit_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_calendar_settings: {
        Row: {
          calendars_metadata: Json | null
          created_at: string | null
          default_calendar_id: string | null
          google_account_email: string | null
          google_refresh_token: string | null
          id: string
          last_sync: string | null
          selected_calendars: Json | null
          sync_enabled: boolean | null
          sync_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calendars_metadata?: Json | null
          created_at?: string | null
          default_calendar_id?: string | null
          google_account_email?: string | null
          google_refresh_token?: string | null
          id?: string
          last_sync?: string | null
          selected_calendars?: Json | null
          sync_enabled?: boolean | null
          sync_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calendars_metadata?: Json | null
          created_at?: string | null
          default_calendar_id?: string | null
          google_account_email?: string | null
          google_refresh_token?: string | null
          id?: string
          last_sync?: string | null
          selected_calendars?: Json | null
          sync_enabled?: boolean | null
          sync_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_calendar_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_update_reads: {
        Row: {
          id: string
          read_at: string
          update_id: string
          user_id: string
        }
        Insert: {
          id?: string
          read_at?: string
          update_id: string
          user_id: string
        }
        Update: {
          id?: string
          read_at?: string
          update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_update_reads_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "system_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_credentials: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          attempt_count: number
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt: string | null
          next_retry: string | null
          payload: Json
          sale_id: string
          status: string
          webhook_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt?: string | null
          next_retry?: string | null
          payload: Json
          sale_id: string
          status: string
          webhook_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt?: string | null
          next_retry?: string | null
          payload?: Json
          sale_id?: string
          status?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "sale_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      calendario_turmas_view: {
        Row: {
          categoria: string | null
          created_at: string | null
          dia_semana: Database["public"]["Enums"]["dia_semana"] | null
          horario_inicio: string | null
          nome_completo: string | null
          professor_id: string | null
          professor_nome: string | null
          professor_slack: string | null
          sala: string | null
          total_alunos_ativos: number | null
          turma_id: string | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turmas_professor_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      corretores_view: {
        Row: {
          active: boolean | null
          id: string | null
          nome: string | null
          tipo: string | null
          unit_id: string | null
        }
        Relationships: []
      }
      kanban_client_summary: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          last_activity: Json | null
          lead_source: string | null
          name: string | null
          next_contact_date: string | null
          observations: string | null
          original_ad: string | null
          original_adset: string | null
          phone_number: string | null
          registration_name: string | null
          scheduled_date: string | null
          status: string | null
          unit_id: string | null
          unit_name: string | null
          valorization_confirmed: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_lead_source_fkey"
            columns: ["lead_source"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clients_unit_id"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas_turma_view: {
        Row: {
          active: boolean | null
          cargo: string | null
          codigo: string | null
          data_onboarding: string | null
          dias_supera: number | null
          email: string | null
          id: string | null
          idade: number | null
          niveldesafio: string | null
          nome: string | null
          origem: string | null
          telefone: string | null
          turma_id: string | null
          ultima_correcao_ah: string | null
          ultima_pagina: number | null
          ultimo_nivel: string | null
          unit_id: string | null
        }
        Relationships: []
      }
      responsaveis_view: {
        Row: {
          id: string | null
          nome: string | null
          tipo: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      buscar_dados_abaco_projeto_sao_rafael: {
        Args: { p_mes_ano: string; p_professor_id: string }
        Returns: {
          ano_mes: string
          nome_aluno: string
          percentual_acerto: number
          total_erros: number
          total_exercicios: number
          total_presencas: number
        }[]
      }
      buscar_dados_ah_projeto_sao_rafael: {
        Args: { p_mes_ano: string; p_professor_id: string }
        Returns: {
          ano_mes: string
          nome_aluno: string
          percentual_acerto: number
          total_erros: number
          total_exercicios: number
        }[]
      }
      calculate_monthly_commission: {
        Args: {
          p_consultant_id: string
          p_force_recalculate?: boolean
          p_month: string
          p_unit_id: string
        }
        Returns: Json
      }
      change_initial_password: {
        Args: { new_password: string; user_id: string }
        Returns: boolean
      }
      check_commercial_data_complete: {
        Args: { p_activity_id: string }
        Returns: boolean
      }
      check_lancamentos_pendentes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_pedagogical_data_complete: {
        Args: { p_activity_id: string }
        Returns: boolean
      }
      consolidate_monthly_commission: {
        Args: { p_calculation_id: string }
        Returns: boolean
      }
      count_draft_updates: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_unit_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_unit_ids: string[]
        }
        Returns: string
      }
      create_unit_user_service: {
        Args: {
          p_creator_id: string
          p_email: string
          p_full_name: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_unit_ids: string[]
        }
        Returns: string
      }
      create_unit_user_simple: {
        Args: {
          p_email: string
          p_full_name: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      delete_aula_experimental: {
        Args: { p_aula_experimental_id: string }
        Returns: boolean
      }
      delete_reposicao: {
        Args: { p_reposicao_id: string }
        Returns: boolean
      }
      evaluate_formula: {
        Args: {
          p_formula: string
          p_material: number
          p_matricula: number
          p_mensalidade: number
        }
        Returns: number
      }
      get_activity_funnel_stats: {
        Args: {
          p_end_date: string
          p_previous_end_date: string
          p_previous_start_date: string
          p_start_date: string
          p_unit_id: string
        }
        Returns: Json
      }
      get_ah_tempo_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          tempo_medio_coleta_correcao: number
          tempo_medio_coleta_entrega: number
          tempo_medio_correcao_entrega: number
          tempo_medio_inicio_fim_correcao: number
          total_apostilas_corrigidas: number
          total_apostilas_entregues: number
        }[]
      }
      get_aluno_desempenho: {
        Args: {
          p_aluno_id: string
          p_data_final?: string
          p_data_inicial: string
        }
        Returns: Json
      }
      get_aluno_detalhes: {
        Args: { p_aluno_nome: string }
        Returns: {
          aluno_id: string
          educador: string
          faltas_recorrentes: boolean
          turma: string
        }[]
      }
      get_alunos_retencoes_historico: {
        Args:
          | {
              p_incluir_ocultos?: boolean
              p_search_term?: string
              p_status_filter?: string
            }
          | { p_search_term?: string; p_status_filter?: string }
        Returns: {
          alertas_ativos: number
          educador: string
          id: string
          nome: string
          status: string
          total_alertas: number
          total_retencoes: number
          turma: string
          ultima_retencao: string
          ultimo_alerta: string
        }[]
      }
      get_attendance_rate_stats: {
        Args: {
          p_end_date: string
          p_prev_end_date: string
          p_prev_start_date: string
          p_start_date: string
          p_unit_ids: string[]
        }
        Returns: Json
      }
      get_calendario_turmas_com_reposicoes: {
        Args: { p_data_consulta: string }
        Returns: {
          categoria: string
          created_at: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          horario_inicio: string
          nome_completo: string
          professor_id: string
          professor_nome: string
          professor_slack: string
          sala: string
          total_alunos_ativos: number
          total_reposicoes: number
          turma_id: string
          unit_id: string
        }[]
      }
      get_calendario_turmas_semana_com_reposicoes: {
        Args: { p_data_fim: string; p_data_inicio: string }
        Returns: {
          categoria: string
          created_at: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          horario_inicio: string
          nome_completo: string
          professor_id: string
          professor_nome: string
          professor_slack: string
          sala: string
          total_alunos_ativos: number
          total_aulas_experimentais: number
          total_faltas_futuras: number
          total_reposicoes: number
          turma_id: string
          unit_id: string
        }[]
      }
      get_commercial_unit_stats: {
        Args: {
          p_end_date: string
          p_source_id: string
          p_start_date: string
          p_unit_ids: string[]
        }
        Returns: {
          ag_conversion_rate: number
          at_conversion_rate: number
          awaiting_visits: number
          ce_conversion_rate: number
          completed_visits: number
          contact_attempts: number
          effective_contacts: number
          enrollments: number
          ma_conversion_rate: number
          new_clients: number
          scheduled_visits: number
          unit_id: string
          unit_name: string
        }[]
      }
      get_commercial_user_stats: {
        Args: {
          p_end_date: string
          p_source_id: string
          p_start_date: string
          p_unit_ids: string[]
        }
        Returns: {
          ag_conversion_rate: number
          at_conversion_rate: number
          awaiting_visits: number
          ce_conversion_rate: number
          completed_visits: number
          contact_attempts: number
          effective_contacts: number
          enrollments: number
          ma_conversion_rate: number
          new_clients: number
          scheduled_visits: number
          user_id: string
          user_name: string
        }[]
      }
      get_commission_summary: {
        Args: {
          p_consultant_id?: string
          p_end_month?: string
          p_start_month?: string
          p_unit_id: string
        }
        Returns: {
          calculation_id: string
          consolidated_at: string
          consultant_id: string
          consultant_name: string
          created_at: string
          formula_name: string
          is_consolidated: boolean
          month: string
          sales_confirmed: number
          sales_pending: number
          total_commission: number
          total_sales: number
          unit_id: string
        }[]
      }
      get_correcoes_ah_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          mes_anterior: number
          mes_atual: number
          professor_correcao: string
          ultimos_12_meses: number
          ultimos_3_meses: number
          ultimos_6_meses: number
        }[]
      }
      get_daily_activities_by_type: {
        Args: { p_end_date: string; p_start_date: string; p_unit_ids: string[] }
        Returns: {
          count: number
          date: string
          source: string
          tipo_atividade: string
        }[]
      }
      get_daily_new_clients: {
        Args: { p_end_date: string; p_start_date: string; p_unit_ids: string[] }
        Returns: {
          count: number
          date: string
          lead_source: string
        }[]
      }
      get_daily_scheduled_activities: {
        Args: { p_end_date: string; p_start_date: string; p_unit_ids: string[] }
        Returns: {
          count: number
          date: string
          source: string
        }[]
      }
      get_dashboard_activity_funnel_stats: {
        Args: {
          p_end_date: string
          p_prev_end_date: string
          p_prev_start_date: string
          p_start_date: string
          p_unit_ids: string[]
        }
        Returns: Json
      }
      get_funcionario_devolutiva: {
        Args: { p_data_inicial: string; p_funcionario_id: string }
        Returns: Json
      }
      get_leads_by_month_and_source: {
        Args: { p_months_back?: number; p_unit_ids: string[] }
        Returns: {
          lead_count: number
          lead_source: string
          month_year: string
        }[]
      }
      get_leads_stats: {
        Args: { p_unit_ids: string[] }
        Returns: Json
      }
      get_lista_aulas_experimentais: {
        Args: Record<PropertyKey, never>
        Returns: {
          aula_experimental_id: string
          cliente_nome: string
          data_aula_experimental: string
          descricao_cliente: string
          responsavel_id: string
          responsavel_nome: string
          responsavel_tipo: string
          turma_id: string
          turma_nome: string
          unit_id: string
        }[]
      }
      get_lista_completa_reposicoes: {
        Args: Record<PropertyKey, never>
        Returns: {
          aluno_id: string
          aluno_nome: string
          data_falta: string
          data_reposicao: string
          observacoes: string
          pessoa_tipo: string
          reposicao_id: string
          turma_original_id: string
          turma_original_nome: string
          turma_reposicao_id: string
          turma_reposicao_nome: string
          unit_id: string
        }[]
      }
      get_loss_reasons_report: {
        Args: {
          p_created_by_ids?: string[]
          p_current_user_id?: string
          p_end_date?: string
          p_start_date?: string
          p_unit_ids?: string[]
        }
        Returns: {
          atendimento_agendado: number
          contato_efetivo: number
          motivo_perda: string
          negociacao: number
          novo_cadastro: number
          perdido: number
          tentativa_contato: number
          total_motivo: number
        }[]
      }
      get_periodo_data: {
        Args: { p_periodo: string }
        Returns: string
      }
      get_pessoas_turma: {
        Args: { p_turma_id: string }
        Returns: {
          cargo: string
          dias_supera: number
          email: string
          id: string
          idade: number
          nome: string
          origem: string
          telefone: string
          ultimo_registro_data: string
          ultimo_registro_id: string
        }[]
      }
      get_pos_venda_activities: {
        Args: { p_unit_ids: string[] }
        Returns: {
          active: boolean
          address_city: string
          address_complement: string
          address_neighborhood: string
          address_number: string
          address_postal_code: string
          address_state: string
          address_street: string
          birth_date: string
          client_activity_id: string
          client_id: string
          client_name: string
          cpf: string
          created_at: string
          created_by: string
          created_by_name: string
          full_name: string
          id: string
          photo_thumbnail_url: string
          photo_url: string
          rg: string
          unit_id: string
          updated_at: string
        }[]
      }
      get_pos_venda_activities_config: {
        Args: { p_unit_id: string }
        Returns: {
          ativa: boolean
          created_at: string
          created_by: string
          created_by_name: string
          descricao: string
          id: string
          nome: string
          ordem: number
          updated_at: string
        }[]
      }
      get_pos_venda_activity_status: {
        Args: {
          p_atividade_config_id: string
          p_atividade_pos_venda_id: string
        }
        Returns: Json
      }
      get_pos_venda_commercial_data: {
        Args: { p_activity_id: string }
        Returns: Json
      }
      get_pos_venda_pedagogical_data: {
        Args: { p_activity_id: string }
        Returns: Json
      }
      get_produtividade_abaco_limpa: {
        Args: {
          p_data_final: string
          p_data_inicial: string
          p_pessoa_id: string
        }
        Returns: {
          aluno_nome: string
          apostila: string
          comentario: string
          created_at: string
          data_aula: string
          erros: number
          exercicios: number
          fez_desafio: boolean
          id: string
          is_reposicao: boolean
          motivo_falta: string
          pagina: string
          pessoa_id: string
          presente: boolean
          tipo_pessoa: string
          updated_at: string
        }[]
      }
      get_registration_stats: {
        Args: {
          p_end_date: string
          p_source_id: string
          p_start_date: string
          p_unit_ids: string[]
        }
        Returns: {
          ag_conversion_rate: number
          at_conversion_rate: number
          awaiting_visits: number
          ce_conversion_rate: number
          completed_visits: number
          contact_attempts: number
          effective_contacts: number
          enrollments: number
          lead_source: string
          ma_conversion_rate: number
          new_clients: number
          registration_name: string
          scheduled_visits: number
        }[]
      }
      get_resultados_mensais_retencao: {
        Args: Record<PropertyKey, never>
        Returns: {
          aluno_ativo: boolean
          aluno_id: string
          aluno_nome: string
          dias_desde_primeira_retencao: number
          dias_desde_primeiro_alerta: number
          primeira_retencao: string
          primeiro_alerta: string
          professor_nome: string
          total_alertas: number
          total_retencoes: number
          turma_nome: string
        }[]
      }
      get_resultados_retencao_temporal: {
        Args: Record<PropertyKey, never>
        Returns: {
          media_dias_retencao: number
          mesmo_periodo_ano_anterior_media_dias: number
          mesmo_periodo_ano_anterior_total_casos: number
          periodo_anterior_media_dias: number
          periodo_anterior_total_casos: number
          periodo_nome: string
          periodo_tipo: string
          total_casos: number
          variacao_percentual_ano_anterior: number
          variacao_percentual_anterior: number
        }[]
      }
      get_temporal_loss_reasons_report: {
        Args: {
          p_created_by_ids?: string[]
          p_current_user_id?: string
          p_end_date?: string
          p_start_date?: string
          p_unit_ids?: string[]
        }
        Returns: {
          mes_1_count: number
          mes_1_header: string
          mes_1_percent: number
          mes_2_count: number
          mes_2_header: string
          mes_2_percent: number
          mes_3_count: number
          mes_3_header: string
          mes_3_percent: number
          mes_4_count: number
          mes_4_header: string
          mes_4_percent: number
          mes_5_count: number
          mes_5_header: string
          mes_5_percent: number
          mes_6_count: number
          mes_6_header: string
          mes_6_percent: number
          motivo_perda: string
          total_n: number
          total_percent: number
        }[]
      }
      get_todas_pessoas: {
        Args: Record<PropertyKey, never>
        Returns: {
          cargo: string
          email: string
          id: string
          nome: string
          origem: string
          telefone: string
          turma_id: string
          turma_nome: string
          ultima_correcao_ah: string
        }[]
      }
      get_turma_modal_data: {
        Args: { p_data_consulta?: string; p_turma_id: string }
        Returns: Json
      }
      get_turmas_with_professor: {
        Args: { p_unit_id: string }
        Returns: {
          professor_id: string
          professor_nome: string
          turma_active: boolean
          turma_dia_semana: Database["public"]["Enums"]["dia_semana"]
          turma_id: string
          turma_nome: string
          turma_sala: string
        }[]
      }
      get_user_access_info: {
        Args: { user_id: string }
        Returns: {
          has_first_access: boolean
          last_sign_in_at: string
        }[]
      }
      get_user_productivity_stats: {
        Args: {
          p_days_back?: number
          p_unit_ids?: string[]
          p_user_ids?: string[]
        }
        Returns: Json
      }
      has_unread_updates: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      inactivate_activity: {
        Args: { activity_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_in_unit: {
        Args: { unit_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      kanban_client_activities: {
        Args: { p_client_id: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      manage_pos_venda_activity_config: {
        Args: {
          p_activity_id?: string
          p_ativa?: boolean
          p_descricao?: string
          p_new_order?: number
          p_nome?: string
          p_operation: string
          p_ordem?: number
          p_unit_id?: string
        }
        Returns: Json
      }
      manage_user_units: {
        Args: {
          p_creator_id: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_unit_ids: string[]
          p_user_id: string
        }
        Returns: string
      }
      mark_all_updates_as_read: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_update_as_read: {
        Args: { p_update_id: string }
        Returns: boolean
      }
      normalizar_telefone_brasil: {
        Args: { telefone_raw: string }
        Returns: string
      }
      obter_config_funcionalidade: {
        Args: {
          p_tipo_funcionalidade: Database["public"]["Enums"]["tipo_funcionalidade"]
          p_unit_id: string
        }
        Returns: Json
      }
      publish_update: {
        Args: { p_update_id: string }
        Returns: boolean
      }
      retry_failed_client_webhooks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      retry_failed_webhooks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rpc_funnel_conversion: {
        Args: { data_fim: string; data_inicio: string; unit_ids: string[] }
        Returns: {
          agendamentos: number
          atendimentos: number
          contatos_efetivos: number
          leads: number
          matriculas: number
        }[]
      }
      save_pos_venda_commercial_data: {
        Args:
          | {
              p_activity_id: string
              p_commercial_observations?: string
              p_enrollment_amount?: number
              p_enrollment_installments?: number
              p_enrollment_payment_date?: string
              p_enrollment_payment_method?: Database["public"]["Enums"]["payment_method"]
              p_first_monthly_fee_date?: string
              p_kit_type?: Database["public"]["Enums"]["kit_type"]
              p_material_amount?: number
              p_material_installments?: number
              p_material_payment_date?: string
              p_material_payment_method?: Database["public"]["Enums"]["payment_method"]
              p_monthly_fee_amount?: number
              p_monthly_fee_payment_method?: Database["public"]["Enums"]["payment_method"]
            }
          | {
              p_activity_id: string
              p_enrollment_amount?: number
              p_enrollment_installments?: number
              p_enrollment_payment_confirmed?: boolean
              p_enrollment_payment_date?: string
              p_enrollment_payment_method?: Database["public"]["Enums"]["payment_method"]
              p_first_monthly_fee_date?: string
              p_kit_type?: Database["public"]["Enums"]["kit_type"]
              p_material_amount?: number
              p_material_installments?: number
              p_material_payment_confirmed?: boolean
              p_material_payment_date?: string
              p_material_payment_method?: Database["public"]["Enums"]["payment_method"]
              p_monthly_fee_amount?: number
              p_monthly_fee_payment_method?: Database["public"]["Enums"]["payment_method"]
            }
          | {
              p_activity_id: string
              p_enrollment_amount?: number
              p_enrollment_installments?: number
              p_enrollment_payment_date?: string
              p_enrollment_payment_method?: Database["public"]["Enums"]["payment_method"]
              p_first_monthly_fee_date?: string
              p_kit_type_id?: string
              p_material_amount?: number
              p_material_installments?: number
              p_material_payment_date?: string
              p_material_payment_method?: Database["public"]["Enums"]["payment_method"]
              p_monthly_fee_amount?: number
              p_monthly_fee_payment_method?: Database["public"]["Enums"]["payment_method"]
              p_observations?: string
            }
        Returns: boolean
      }
      save_pos_venda_pedagogical_data: {
        Args: {
          p_activity_id: string
          p_data_aula_inaugural?: string
          p_informacoes_onboarding?: string
          p_turma_id?: string
        }
        Returns: Json
      }
      toggle_pos_venda_activity_status: {
        Args: {
          p_atividade_config_id: string
          p_atividade_pos_venda_id: string
          p_realizada: boolean
        }
        Returns: Json
      }
      unidade_tem_funcionalidade: {
        Args: {
          p_tipo_funcionalidade: Database["public"]["Enums"]["tipo_funcionalidade"]
          p_unit_id: string
        }
        Returns: boolean
      }
      unpublish_update: {
        Args: { p_update_id: string }
        Returns: boolean
      }
      update_existing_kanban_cards_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_access_to_unit: {
        Args: { unit_id: string }
        Returns: boolean
      }
      user_has_unit_access: {
        Args: { p_unit_id: string }
        Returns: boolean
      }
      verificar_criterios_alerta_falta: {
        Args: { p_aluno_id: string }
        Returns: {
          aluno_nome: string
          data_falta: string
          detalhes: Json
          dias_supera: number
          motivo_falta: string
          professor_id: string
          professor_nome: string
          professor_slack: string
          tipo_criterio: string
          turma_id: string
          unit_id: string
        }[]
      }
      verificar_pessoa_existe: {
        Args: { p_pessoa_id: string }
        Returns: {
          id: string
          nome: string
          tipo: string
        }[]
      }
      verify_webhook_credentials: {
        Args: { p_password: string; p_username: string }
        Returns: boolean
      }
    }
    Enums: {
      dia_semana:
        | "segunda"
        | "terca"
        | "quarta"
        | "quinta"
        | "sexta"
        | "sabado"
        | "domingo"
      due_day: "5" | "10" | "15" | "20" | "25"
      "etapa-do-bot": "apresentador" | "rapport" | "agendador" | "negociador"
      forma_de_pagamento: "Cartão" | "Pix" | "Dinheiro" | "Carimbo" | "Outro"
      gender: "masculino" | "feminino"
      kit_type:
        | "kit_1"
        | "kit_2"
        | "kit_3"
        | "kit_4"
        | "kit_5"
        | "kit_6"
        | "kit_7"
        | "kit_8"
      marital_status: "solteiro" | "casado" | "divorciado" | "viuvo" | "outro"
      origem_alerta:
        | "conversa_indireta"
        | "aviso_recepcao"
        | "aviso_professor_coordenador"
        | "aviso_whatsapp"
        | "inadimplencia"
        | "outro"
      payment_method:
        | "dinheiro"
        | "pix"
        | "cartao_credito"
        | "cartao_debito"
        | "boleto"
        | "recorrencia"
      Perfil_idade:
        | "crianca-adolescente"
        | "adulto"
        | "idoso-ativo"
        | "60+"
        | "80+"
      sale_type: "matricula" | "outros"
      status_alerta: "pendente" | "em_andamento" | "resolvido" | "cancelado"
      student_status: "pre_matricula" | "matricula_completa"
      tipo_atendimento: "bot" | "humano"
      tipo_funcionalidade:
        | "assistente_whatsapp"
        | "google_agenda"
        | "relatorios_avancados"
        | "integracao_telefonia_net2phone"
        | "disparo_slack"
        | "gestao_estoque"
        | "gestao_eventos"
        | "automacao_whatsapp"
        | "pos_venda_comercial"
      user_role:
        | "consultor"
        | "franqueado"
        | "admin"
        | "educador"
        | "gestor_pedagogico"
      user_role_old: "consultor" | "franqueado" | "gestor_comercial"
      Vinculo_aluno:
        | "Pai do aluno"
        | "Filho(a) do aluno"
        | "amigo"
        | "familiar"
        | "outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dia_semana: [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
      ],
      due_day: ["5", "10", "15", "20", "25"],
      "etapa-do-bot": ["apresentador", "rapport", "agendador", "negociador"],
      forma_de_pagamento: ["Cartão", "Pix", "Dinheiro", "Carimbo", "Outro"],
      gender: ["masculino", "feminino"],
      kit_type: [
        "kit_1",
        "kit_2",
        "kit_3",
        "kit_4",
        "kit_5",
        "kit_6",
        "kit_7",
        "kit_8",
      ],
      marital_status: ["solteiro", "casado", "divorciado", "viuvo", "outro"],
      origem_alerta: [
        "conversa_indireta",
        "aviso_recepcao",
        "aviso_professor_coordenador",
        "aviso_whatsapp",
        "inadimplencia",
        "outro",
      ],
      payment_method: [
        "dinheiro",
        "pix",
        "cartao_credito",
        "cartao_debito",
        "boleto",
        "recorrencia",
      ],
      Perfil_idade: [
        "crianca-adolescente",
        "adulto",
        "idoso-ativo",
        "60+",
        "80+",
      ],
      sale_type: ["matricula", "outros"],
      status_alerta: ["pendente", "em_andamento", "resolvido", "cancelado"],
      student_status: ["pre_matricula", "matricula_completa"],
      tipo_atendimento: ["bot", "humano"],
      tipo_funcionalidade: [
        "assistente_whatsapp",
        "google_agenda",
        "relatorios_avancados",
        "integracao_telefonia_net2phone",
        "disparo_slack",
        "gestao_estoque",
        "gestao_eventos",
        "automacao_whatsapp",
        "pos_venda_comercial",
      ],
      user_role: [
        "consultor",
        "franqueado",
        "admin",
        "educador",
        "gestor_pedagogico",
      ],
      user_role_old: ["consultor", "franqueado", "gestor_comercial"],
      Vinculo_aluno: [
        "Pai do aluno",
        "Filho(a) do aluno",
        "amigo",
        "familiar",
        "outro",
      ],
    },
  },
} as const
