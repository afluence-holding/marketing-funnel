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
    PostgrestVersion: "13.0.5"
  }
  marketing: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          lead_id: string
          lead_pipeline_entry_id: string | null
          metadata: Json | null
          organization_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          lead_id: string
          lead_pipeline_entry_id?: string | null
          metadata?: Json | null
          organization_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          lead_id?: string
          lead_pipeline_entry_id?: string | null
          metadata?: Json | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_lead_funnel_entry_id_fkey"
            columns: ["lead_pipeline_entry_id"]
            isOneToOne: false
            referencedRelation: "lead_pipeline_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bukku_leads: {
        Row: {
          created_at: string
          custom_fields: Json
          email: string
          first_name: string
          id: string
          phone: string
          source: string
          updated_at: string
          utm_data: Json
        }
        Insert: {
          created_at?: string
          custom_fields?: Json
          email: string
          first_name?: string
          id?: string
          phone?: string
          source?: string
          updated_at?: string
          utm_data?: Json
        }
        Update: {
          created_at?: string
          custom_fields?: Json
          email?: string
          first_name?: string
          id?: string
          phone?: string
          source?: string
          updated_at?: string
          utm_data?: Json
        }
        Relationships: []
      }
      business_units: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      caro_fitness_progress: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          lead_id: string | null
          phone: string
          quiz_step: string
          session_id: string
          source: string
          status: string
          updated_at: string
          utm_data: Json
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          lead_id?: string | null
          phone?: string
          quiz_step?: string
          session_id: string
          source?: string
          status?: string
          updated_at?: string
          utm_data?: Json
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          lead_id?: string | null
          phone?: string
          quiz_step?: string
          session_id?: string
          source?: string
          status?: string
          updated_at?: string
          utm_data?: Json
        }
        Relationships: []
      }
      cohorts: {
        Row: {
          bu_key: string
          business_unit_id: string | null
          code: string
          content_id: string
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          org_key: string
          starts_at: string | null
          synced_at: string
          tiers: Json
          timezone: string
        }
        Insert: {
          bu_key: string
          business_unit_id?: string | null
          code: string
          content_id: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          org_key: string
          starts_at?: string | null
          synced_at?: string
          tiers?: Json
          timezone: string
        }
        Update: {
          bu_key?: string
          business_unit_id?: string | null
          code?: string
          content_id?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          org_key?: string
          starts_at?: string | null
          synced_at?: string
          tiers?: Json
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string
          entity_type: string
          field_key: string
          field_label: string
          field_type: string
          id: string
          options: Json | null
          organization_id: string
          required: boolean
        }
        Insert: {
          created_at?: string
          entity_type: string
          field_key: string
          field_label: string
          field_type: string
          id?: string
          options?: Json | null
          organization_id: string
          required?: boolean
        }
        Update: {
          created_at?: string
          entity_type?: string
          field_key?: string
          field_label?: string
          field_type?: string
          id?: string
          options?: Json | null
          organization_id?: string
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          field_definition_id: string
          id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          field_definition_id: string
          id?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          field_definition_id?: string
          id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_field_definition_id_fkey"
            columns: ["field_definition_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      german_roz_progress: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          lead_id: string | null
          phone: string
          quiz_step: string
          session_id: string
          source: string
          status: string
          updated_at: string
          utm_data: Json
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          lead_id?: string | null
          phone?: string
          quiz_step?: string
          session_id: string
          source?: string
          status?: string
          updated_at?: string
          utm_data?: Json
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          lead_id?: string | null
          phone?: string
          quiz_step?: string
          session_id?: string
          source?: string
          status?: string
          updated_at?: string
          utm_data?: Json
        }
        Relationships: []
      }
      lead_pipeline_entries: {
        Row: {
          channel: string
          clickup_task_id: string | null
          current_stage_id: string
          entered_at: string
          id: string
          lead_id: string
          pipeline_id: string
          source_id: string | null
          source_type: string | null
          trigger_type: string
          updated_at: string
          utm_data: Json | null
        }
        Insert: {
          channel: string
          clickup_task_id?: string | null
          current_stage_id: string
          entered_at?: string
          id?: string
          lead_id: string
          pipeline_id: string
          source_id?: string | null
          source_type?: string | null
          trigger_type: string
          updated_at?: string
          utm_data?: Json | null
        }
        Update: {
          channel?: string
          clickup_task_id?: string | null
          current_stage_id?: string
          entered_at?: string
          id?: string
          lead_id?: string
          pipeline_id?: string
          source_id?: string | null
          source_type?: string | null
          trigger_type?: string
          updated_at?: string
          utm_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_funnel_entries_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_funnel_entries_funnel_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_funnel_entries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_stage_history: {
        Row: {
          changed_at: string
          from_stage_id: string | null
          id: string
          lead_pipeline_entry_id: string
          to_stage_id: string
        }
        Insert: {
          changed_at?: string
          from_stage_id?: string | null
          id?: string
          lead_pipeline_entry_id: string
          to_stage_id: string
        }
        Update: {
          changed_at?: string
          from_stage_id?: string | null
          id?: string
          lead_pipeline_entry_id?: string
          to_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_stage_history_lead_funnel_entry_id_fkey"
            columns: ["lead_pipeline_entry_id"]
            isOneToOne: false
            referencedRelation: "lead_pipeline_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string
          phone: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id: string
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mama_sin_caos_leads: {
        Row: {
          created_at: string
          custom_fields: Json
          email: string
          first_name: string
          id: string
          phone: string
          source: string
          updated_at: string
          utm_data: Json
        }
        Insert: {
          created_at?: string
          custom_fields?: Json
          email: string
          first_name?: string
          id?: string
          phone?: string
          source?: string
          updated_at?: string
          utm_data?: Json
        }
        Update: {
          created_at?: string
          custom_fields?: Json
          email?: string
          first_name?: string
          id?: string
          phone?: string
          source?: string
          updated_at?: string
          utm_data?: Json
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          created_at: string
          id: string
          name: string
          pipeline_id: string
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          pipeline_id: string
          position: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          pipeline_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_stages_funnel_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          business_unit_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnels_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          business_unit_id: string | null
          capi_sent_at: string | null
          cohort_code: string
          cohort_id: string | null
          content_id: string | null
          created_at: string
          currency: string
          external_id: string
          id: string
          lead_id: string | null
          metadata: Json
          organization_id: string
          plan_or_offer_id: string | null
          product_key: string
          provider: string
          purchased_at: string
          refunded_at: string | null
          status: string
        }
        Insert: {
          amount: number
          business_unit_id?: string | null
          capi_sent_at?: string | null
          cohort_code: string
          cohort_id?: string | null
          content_id?: string | null
          created_at?: string
          currency?: string
          external_id: string
          id?: string
          lead_id?: string | null
          metadata?: Json
          organization_id: string
          plan_or_offer_id?: string | null
          product_key: string
          provider: string
          purchased_at?: string
          refunded_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          business_unit_id?: string | null
          capi_sent_at?: string | null
          cohort_code?: string
          cohort_id?: string | null
          content_id?: string | null
          created_at?: string
          currency?: string
          external_id?: string
          id?: string
          lead_id?: string | null
          metadata?: Json
          organization_id?: string
          plan_or_offer_id?: string | null
          product_key?: string
          provider?: string
          purchased_at?: string
          refunded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_enrollments: {
        Row: {
          completed_at: string | null
          current_step_index: number
          id: string
          lead_id: string
          lead_pipeline_entry_id: string | null
          next_step_at: string | null
          organization_id: string
          sequence_key: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          current_step_index?: number
          id?: string
          lead_id: string
          lead_pipeline_entry_id?: string | null
          next_step_at?: string | null
          organization_id: string
          sequence_key: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          current_step_index?: number
          id?: string
          lead_id?: string
          lead_pipeline_entry_id?: string | null
          next_step_at?: string | null
          organization_id?: string
          sequence_key?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_lead_pipeline_entry_id_fkey"
            columns: ["lead_pipeline_entry_id"]
            isOneToOne: false
            referencedRelation: "lead_pipeline_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_group_assignments: {
        Row: {
          assigned_at: string
          group_id: string
          id: string
          joined_at: string | null
          lead_id: string | null
          phone: string
          pool_id: string
        }
        Insert: {
          assigned_at?: string
          group_id: string
          id?: string
          joined_at?: string | null
          lead_id?: string | null
          phone?: string
          pool_id: string
        }
        Update: {
          assigned_at?: string
          group_id?: string
          id?: string
          joined_at?: string | null
          lead_id?: string | null
          phone?: string
          pool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_group_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_group_assignments_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_group_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_group_pools: {
        Row: {
          bu_key: string
          capacity: number
          created_at: string
          id: string
          is_active: boolean
          label: string
          launch_code: string | null
          org_key: string
          pool_key: string
          rotation_mode: string
          updated_at: string
        }
        Insert: {
          bu_key: string
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          launch_code?: string | null
          org_key: string
          pool_key: string
          rotation_mode?: string
          updated_at?: string
        }
        Update: {
          bu_key?: string
          capacity?: number
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          launch_code?: string | null
          org_key?: string
          pool_key?: string
          rotation_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_groups: {
        Row: {
          assigned_count: number
          created_at: string
          group_jid: string | null
          id: string
          invite_url: string
          is_active: boolean
          is_full: boolean
          label: string
          member_count: number
          pool_id: string
          position: number
          updated_at: string
        }
        Insert: {
          assigned_count?: number
          created_at?: string
          group_jid?: string | null
          id?: string
          invite_url: string
          is_active?: boolean
          is_full?: boolean
          label?: string
          member_count?: number
          pool_id: string
          position?: number
          updated_at?: string
        }
        Update: {
          assigned_count?: number
          created_at?: string
          group_jid?: string | null
          id?: string
          invite_url?: string
          is_active?: boolean
          is_full?: boolean
          label?: string
          member_count?: number
          pool_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_groups_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_group_pools"
            referencedColumns: ["id"]
          },
        ]
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
  marketing: {
    Enums: {},
  },
} as const
