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
          unit_api_key: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
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
          unit_api_key?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
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
          unit_api_key?: string | null
          unit_id?: string
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
      deleted_activities: {
        Row: {
          client_activity_id: string
          client_id: string
          created_at: string
          deleted_at: string
          deleted_by: string
          id: string
          next_contact_date: string | null
          notes: string | null
          original_created_at: string
          original_created_by: string
          tipo_atividade: string
          tipo_contato: string
          updated_at: string | null
        }
        Insert: {
          client_activity_id: string
          client_id: string
          created_at?: string
          deleted_at?: string
          deleted_by: string
          id?: string
          next_contact_date?: string | null
          notes?: string | null
          original_created_at: string
          original_created_by: string
          tipo_atividade: string
          tipo_contato: string
          updated_at?: string | null
        }
        Update: {
          client_activity_id?: string
          client_id?: string
          created_at?: string
          deleted_at?: string
          deleted_by?: string
          id?: string
          next_contact_date?: string | null
          notes?: string | null
          original_created_at?: string
          original_created_by?: string
          tipo_atividade?: string
          tipo_contato?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      deleted_clients: {
        Row: {
          age_range: string | null
          client_id: string
          created_at: string
          deleted_at: string
          deleted_by: string
          id: string
          lead_source: string
          meta_id: string | null
          name: string
          observations: string | null
          original_ad: string | null
          original_adset: string | null
          original_created_at: string
          original_created_by: string
          phone_number: string
          status: string
          updated_at: string | null
        }
        Insert: {
          age_range?: string | null
          client_id: string
          created_at?: string
          deleted_at?: string
          deleted_by: string
          id: string
          lead_source: string
          meta_id?: string | null
          name: string
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          original_created_at: string
          original_created_by: string
          phone_number: string
          status: string
          updated_at?: string | null
        }
        Update: {
          age_range?: string | null
          client_id?: string
          created_at?: string
          deleted_at?: string
          deleted_by?: string
          id?: string
          lead_source?: string
          meta_id?: string | null
          name?: string
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          original_created_at?: string
          original_created_by?: string
          phone_number?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
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
      leads: {
        Row: {
          age_range: string | null
          created_at: string
          email: string | null
          id: string
          lead_source: string | null
          meta_id: string | null
          name: string
          observations: string | null
          original_ad: string | null
          original_adset: string | null
          phone_number: string
          unit_api_key: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_source?: string | null
          meta_id?: string | null
          name: string
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number: string
          unit_api_key?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          age_range?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_source?: string | null
          meta_id?: string | null
          name?: string
          observations?: string | null
          original_ad?: string | null
          original_adset?: string | null
          phone_number?: string
          unit_api_key?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      unit_users: {
        Row: {
          created_at: string
          id: string
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
          api_key: string
          city: string
          complement: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          neighborhood: string
          number: string
          postal_code: string
          state: string
          street: string
          updated_at: string
        }
        Insert: {
          api_key?: string
          city: string
          complement?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          neighborhood: string
          number: string
          postal_code: string
          state: string
          street: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          city?: string
          complement?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          neighborhood?: string
          number?: string
          postal_code?: string
          state?: string
          street?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
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
      has_role: {
        Args: {
          requested_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      verify_unit_api_key: {
        Args: {
          p_api_key: string
        }
        Returns: string
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
      app_role: "admin" | "franqueado" | "consultor"
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
