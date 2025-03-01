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
        ]
      }
      client_loss_reasons: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          observations: string | null
          reason_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          observations?: string | null
          reason_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          observations?: string | null
          reason_id?: string | null
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
            foreignKeyName: "client_loss_reasons_reason_id_fkey"
            columns: ["reason_id"]
            isOneToOne: false
            referencedRelation: "loss_reasons"
            referencedColumns: ["id"]
          },
        ]
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
          scheduled_date: string | null
          status: string
          unit_id: string | null
          updated_at: string
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
          scheduled_date?: string | null
          status?: string
          unit_id?: string | null
          updated_at?: string
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
          scheduled_date?: string | null
          status?: string
          unit_id?: string | null
          updated_at?: string
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
        ]
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
          address_city: string
          address_complement: string | null
          address_neighborhood: string
          address_number: string
          address_postal_code: string
          address_state: string
          address_street: string
          birth_date: string
          client_id: string
          cpf: string
          created_at: string
          created_by: string | null
          full_name: string
          id: string
          photo_thumbnail_url: string | null
          photo_url: string | null
          rg: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address_city: string
          address_complement?: string | null
          address_neighborhood: string
          address_number: string
          address_postal_code: string
          address_state: string
          address_street: string
          birth_date: string
          client_id: string
          cpf: string
          created_at?: string
          created_by?: string | null
          full_name: string
          id?: string
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          rg?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address_city?: string
          address_complement?: string | null
          address_neighborhood?: string
          address_number?: string
          address_postal_code?: string
          address_state?: string
          address_street?: string
          birth_date?: string
          client_id?: string
          cpf?: string
          created_at?: string
          created_by?: string | null
          full_name?: string
          id?: string
          photo_thumbnail_url?: string | null
          photo_url?: string | null
          rg?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      [_ in never]: never
    }
    Functions: {
      change_initial_password: {
        Args: {
          user_id: string
          new_password: string
        }
        Returns: boolean
      }
      create_unit_user:
        | {
            Args: {
              p_email: string
              p_full_name: string
              p_unit_id: string
              p_role: Database["public"]["Enums"]["user_role"]
            }
            Returns: string
          }
        | {
            Args: {
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
      get_user_access_info: {
        Args: {
          user_id: string
        }
        Returns: {
          last_sign_in_at: string
          has_first_access: boolean
        }[]
      }
      inactivate_activity: {
        Args: {
          activity_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_admin_in_unit: {
        Args: {
          unit_id: string
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      retry_failed_webhooks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_has_unit_access: {
        Args: {
          unit_id: string
        }
        Returns: boolean
      }
      verify_webhook_credentials: {
        Args: {
          p_username: string
          p_password: string
        }
        Returns: boolean
      }
    }
    Enums: {
      due_day: "5" | "10" | "15" | "20" | "25"
      payment_method:
        | "dinheiro"
        | "pix"
        | "cartao_credito"
        | "cartao_debito"
        | "boleto"
        | "recorrencia"
      sale_type: "matricula" | "outros"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
