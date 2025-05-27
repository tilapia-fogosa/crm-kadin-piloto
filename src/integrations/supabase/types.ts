export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_falta_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "unidades"
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
          turma_id: string
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
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
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
          turma_id: string
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
          codigo?: string | null
          coordenador_responsavel?: string | null
          created_at?: string
          curso?: string | null
          data_onboarding?: string | null
          dias_apostila?: number | null
          dias_supera?: number | null
          email?: string | null
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
          turma_id?: string
          ultima_correcao_ah?: string | null
          ultima_falta?: string | null
          ultima_pagina?: number | null
          ultimo_nivel?: string | null
          unit_id?: string
          vencimento_contrato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_alunos_unit_id"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          lead_quality_score: number | null
          lead_source: string
          meta_id: string | null
          name: string
          next_contact_date: string | null
          observations: string | null
          original_ad: string | null
          original_adset: string | null
          phone_number: string
          registration_cpf: string | null
          registration_name: string | null
          scheduled_date: string | null
          status: string
          unit_id: string | null
          updated_at: string
          valorization_confirmed: boolean | null
        }
        Insert: {
          active?: boolean
          age_range?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          lead_quality_score?: number | null
          lead_source: string
          meta_id?: string | null
          name: string
          next_contact_date?: string | null
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number: string
          registration_cpf?: string | null
          registration_name?: string | null
          scheduled_date?: string | null
          status?: string
          unit_id?: string | null
          updated_at?: string
          valorization_confirmed?: boolean | null
        }
        Update: {
          active?: boolean
          age_range?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          lead_quality_score?: number | null
          lead_source?: string
          meta_id?: string | null
          name?: string
          next_contact_date?: string | null
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number?: string
          registration_cpf?: string | null
          registration_name?: string | null
          scheduled_date?: string | null
          status?: string
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
          created_by: string
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
          created_by: string
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
          created_by?: string
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
      kit_types: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_types_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
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
            foreignKeyName: "kit_versions_kit_type_id_fkey"
            columns: ["kit_type_id"]
            isOneToOne: false
            referencedRelation: "kit_types"
            referencedColumns: ["id"]
          },
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
      produtividade_abaco: {
        Row: {
          aluno_id: string
          apostila: string | null
          comentario: string | null
          created_at: string
          data_aula: string
          erros: number | null
          exercicios: number | null
          fez_desafio: boolean | null
          id: string
          is_reposicao: boolean
          pagina: string | null
          presente: boolean
          updated_at: string
        }
        Insert: {
          aluno_id: string
          apostila?: string | null
          comentario?: string | null
          created_at?: string
          data_aula: string
          erros?: number | null
          exercicios?: number | null
          fez_desafio?: boolean | null
          id?: string
          is_reposicao?: boolean
          pagina?: string | null
          presente?: boolean
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          apostila?: string | null
          comentario?: string | null
          created_at?: string
          data_aula?: string
          erros?: number | null
          exercicios?: number | null
          fez_desafio?: boolean | null
          id?: string
          is_reposicao?: boolean
          pagina?: string | null
          presente?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_abaco_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtividade_ah: {
        Row: {
          aluno_id: string
          apostila: string | null
          comentario: string | null
          created_at: string
          erros: number | null
          exercicios: number | null
          id: string
          professor_correcao: string | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          apostila?: string | null
          comentario?: string | null
          created_at?: string
          erros?: number | null
          exercicios?: number | null
          id?: string
          professor_correcao?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          apostila?: string | null
          comentario?: string | null
          created_at?: string
          erros?: number | null
          exercicios?: number | null
          id?: string
          professor_correcao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtividade_ah_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          slack_username: string | null
          telefone: string | null
          unit_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          slack_username?: string | null
          telefone?: string | null
          unit_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          slack_username?: string | null
          telefone?: string | null
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
      profiles: {
        Row: {
          access_blocked: boolean | null
          avatar_url: string | null
          created_at: string
          email: string | null
          email_confirmed: boolean | null
          first_access_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          must_change_password: boolean | null
          role: string | null
          updated_at: string
        }
        Insert: {
          access_blocked?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          email_confirmed?: boolean | null
          first_access_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          must_change_password?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          access_blocked?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          email_confirmed?: boolean | null
          first_access_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          must_change_password?: boolean | null
          role?: string | null
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
      student_logs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          student_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          student_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          student_id?: string
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
      turmas: {
        Row: {
          created_at: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          horario: string
          id: string
          nome: string
          professor_id: string
          sala: string | null
          unit_id: string
        }
        Insert: {
          created_at?: string
          dia_semana: Database["public"]["Enums"]["dia_semana"]
          horario: string
          id?: string
          nome: string
          professor_id: string
          sala?: string | null
          unit_id: string
        }
        Update: {
          created_at?: string
          dia_semana?: Database["public"]["Enums"]["dia_semana"]
          horario?: string
          id?: string
          nome?: string
          professor_id?: string
          sala?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_professor_id_fkey"
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
    }
    Functions: {
      change_initial_password: {
        Args: { user_id: string; new_password: string }
        Returns: boolean
      }
      check_lancamentos_pendentes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      count_draft_updates: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_unit_user: {
        Args: {
          p_email: string
          p_full_name: string
          p_unit_ids: string[]
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      create_unit_user_service: {
        Args: {
          p_creator_id: string
          p_email: string
          p_full_name: string
          p_unit_ids: string[]
          p_role: Database["public"]["Enums"]["user_role"]
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
      get_activity_funnel_stats: {
        Args: {
          p_unit_id: string
          p_start_date: string
          p_end_date: string
          p_previous_start_date: string
          p_previous_end_date: string
        }
        Returns: Json
      }
      get_aluno_desempenho: {
        Args: {
          p_aluno_id: string
          p_data_inicial: string
          p_data_final?: string
        }
        Returns: Json
      }
      get_aluno_detalhes: {
        Args: { p_aluno_nome: string }
        Returns: {
          aluno_id: string
          turma: string
          educador: string
          faltas_recorrentes: boolean
        }[]
      }
      get_commercial_unit_stats: {
        Args: {
          p_start_date: string
          p_end_date: string
          p_unit_ids: string[]
          p_source_id: string
        }
        Returns: {
          unit_id: string
          unit_name: string
          new_clients: number
          contact_attempts: number
          effective_contacts: number
          scheduled_visits: number
          awaiting_visits: number
          completed_visits: number
          enrollments: number
          ce_conversion_rate: number
          ag_conversion_rate: number
          at_conversion_rate: number
          ma_conversion_rate: number
        }[]
      }
      get_commercial_user_stats: {
        Args: {
          p_start_date: string
          p_end_date: string
          p_unit_ids: string[]
          p_source_id: string
        }
        Returns: {
          user_id: string
          user_name: string
          new_clients: number
          contact_attempts: number
          effective_contacts: number
          scheduled_visits: number
          awaiting_visits: number
          completed_visits: number
          enrollments: number
          ce_conversion_rate: number
          ag_conversion_rate: number
          at_conversion_rate: number
          ma_conversion_rate: number
        }[]
      }
      get_daily_activities_by_type: {
        Args: { p_start_date: string; p_end_date: string; p_unit_ids: string[] }
        Returns: {
          date: string
          tipo_atividade: string
          source: string
          count: number
        }[]
      }
      get_daily_new_clients: {
        Args: { p_start_date: string; p_end_date: string; p_unit_ids: string[] }
        Returns: {
          date: string
          lead_source: string
          count: number
        }[]
      }
      get_daily_scheduled_activities: {
        Args: { p_start_date: string; p_end_date: string; p_unit_ids: string[] }
        Returns: {
          date: string
          source: string
          count: number
        }[]
      }
      get_dashboard_activity_funnel_stats: {
        Args: {
          p_start_date: string
          p_end_date: string
          p_prev_start_date: string
          p_prev_end_date: string
          p_unit_ids: string[]
        }
        Returns: Json
      }
      get_leads_stats: {
        Args: { p_unit_ids: string[] }
        Returns: Json
      }
      get_periodo_data: {
        Args: { p_periodo: string }
        Returns: string
      }
      get_registration_stats: {
        Args: {
          p_start_date: string
          p_end_date: string
          p_unit_ids: string[]
          p_source_id: string
        }
        Returns: {
          registration_name: string
          lead_source: string
          new_clients: number
          contact_attempts: number
          effective_contacts: number
          scheduled_visits: number
          awaiting_visits: number
          completed_visits: number
          enrollments: number
          ce_conversion_rate: number
          ag_conversion_rate: number
          at_conversion_rate: number
          ma_conversion_rate: number
        }[]
      }
      get_user_access_info: {
        Args: { user_id: string }
        Returns: {
          last_sign_in_at: string
          has_first_access: boolean
        }[]
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
      manage_user_units: {
        Args: {
          p_creator_id: string
          p_user_id: string
          p_unit_ids: string[]
          p_role: Database["public"]["Enums"]["user_role"]
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
        Args: { data_inicio: string; data_fim: string; unit_ids: string[] }
        Returns: {
          leads: number
          contatos_efetivos: number
          agendamentos: number
          atendimentos: number
          matriculas: number
        }[]
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
          tipo_criterio: string
          detalhes: Json
          data_falta: string
          aluno_nome: string
          turma_id: string
          professor_id: string
          unit_id: string
          dias_supera: number
          motivo_falta: string
          professor_nome: string
          professor_slack: string
        }[]
      }
      verify_webhook_credentials: {
        Args: { p_username: string; p_password: string }
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
      gender: "masculino" | "feminino"
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
      sale_type: "matricula" | "outros"
      status_alerta: "pendente" | "em_andamento" | "resolvido" | "cancelado"
      student_status: "pre_matricula" | "matricula_completa"
      user_role:
        | "consultor"
        | "franqueado"
        | "admin"
        | "educador"
        | "gestor_pedagogico"
      user_role_old: "consultor" | "franqueado" | "gestor_comercial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      gender: ["masculino", "feminino"],
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
      sale_type: ["matricula", "outros"],
      status_alerta: ["pendente", "em_andamento", "resolvido", "cancelado"],
      student_status: ["pre_matricula", "matricula_completa"],
      user_role: [
        "consultor",
        "franqueado",
        "admin",
        "educador",
        "gestor_pedagogico",
      ],
      user_role_old: ["consultor", "franqueado", "gestor_comercial"],
    },
  },
} as const
