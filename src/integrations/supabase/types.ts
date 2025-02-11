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
          created_by: string
          deleted_at: string | null
          id: string
          lead_source: string
          meta_id: string | null
          name: string
          observations: string | null
          original_ad: string | null
          phone_number: string
          status: string
          updated_at: string
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          lead_source: string
          meta_id?: string | null
          name: string
          observations?: string | null
          original_ad?: string | null
          phone_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          age_range?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          lead_source?: string
          meta_id?: string | null
          name?: string
          observations?: string | null
          original_ad?: string | null
          phone_number?: string
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
          created_at: string
          email: string
          id: string
          lead_source: string | null
          name: string
          observations: string | null
          phone_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          lead_source?: string | null
          name: string
          observations?: string | null
          phone_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          lead_source?: string | null
          name?: string
          observations?: string | null
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
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
      webhook_leads: {
        Row: {
          created_at: string
          error: string | null
          id: string
          lead_source: string | null
          meta_id: string | null
          name: string
          observations: string | null
          original_ad: string | null
          phone_number: string
          processed: boolean | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          lead_source?: string | null
          meta_id?: string | null
          name: string
          observations?: string | null
          original_ad?: string | null
          phone_number: string
          processed?: boolean | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          lead_source?: string | null
          meta_id?: string | null
          name?: string
          observations?: string | null
          original_ad?: string | null
          phone_number?: string
          processed?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
