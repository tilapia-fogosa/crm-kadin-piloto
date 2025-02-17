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
      clients: {
        Row: {
          active: boolean
          age_range: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
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
          updated_at: string
        }
        Insert: {
          active?: boolean
          age_range?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
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
          updated_at?: string
        }
        Update: {
          active?: boolean
          age_range?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          active: boolean
          attendance_activity_id: string
          client_id: string
          created_at: string
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
          updated_at: string
        }
        Insert: {
          active?: boolean
          attendance_activity_id: string
          client_id: string
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          active?: boolean
          attendance_activity_id?: string
          client_id?: string
          created_at?: string
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
          updated_at?: string
        }
        Relationships: [
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      inactivate_activity: {
        Args: {
          activity_id: string
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
      user_role: "consultor" | "franqueado"
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
