export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  marketing: {
    Tables: {
      activity_logs: {
        Row: {
          id: string
          organization_id: string
          lead_id: string
          lead_funnel_entry_id: string | null
          action: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          lead_id: string
          lead_funnel_entry_id?: string | null
          action: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          lead_id?: string
          lead_funnel_entry_id?: string | null
          action?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            foreignKeyName: "activity_logs_lead_funnel_entry_id_fkey"
            columns: ["lead_funnel_entry_id"]
            isOneToOne: false
            referencedRelation: "lead_funnel_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      business_units: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          created_at?: string
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
      custom_field_definitions: {
        Row: {
          id: string
          organization_id: string
          entity_type: string
          field_key: string
          field_label: string
          field_type: string
          options: Json | null
          required: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          entity_type: string
          field_key: string
          field_label: string
          field_type: string
          options?: Json | null
          required?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          entity_type?: string
          field_key?: string
          field_label?: string
          field_type?: string
          options?: Json | null
          required?: boolean
          created_at?: string
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
          id: string
          entity_type: string
          entity_id: string
          field_definition_id: string
          value: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          field_definition_id: string
          value?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          field_definition_id?: string
          value?: string | null
          created_at?: string
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
      funnel_stages: {
        Row: {
          id: string
          funnel_id: string
          name: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          funnel_id: string
          name: string
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          funnel_id?: string
          name?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_stages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          id: string
          business_unit_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_unit_id: string
          name: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_unit_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
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
      lead_funnel_entries: {
        Row: {
          id: string
          lead_id: string
          funnel_id: string
          current_stage_id: string
          channel: string
          trigger_type: string
          source_type: string | null
          source_id: string | null
          utm_data: Json | null
          entered_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          funnel_id: string
          current_stage_id: string
          channel: string
          trigger_type: string
          source_type?: string | null
          source_id?: string | null
          utm_data?: Json | null
          entered_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          funnel_id?: string
          current_stage_id?: string
          channel?: string
          trigger_type?: string
          source_type?: string | null
          source_id?: string | null
          utm_data?: Json | null
          entered_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_funnel_entries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_funnel_entries_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_funnel_entries_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "funnel_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_stage_history: {
        Row: {
          id: string
          lead_funnel_entry_id: string
          from_stage_id: string | null
          to_stage_id: string
          changed_at: string
        }
        Insert: {
          id?: string
          lead_funnel_entry_id: string
          from_stage_id?: string | null
          to_stage_id: string
          changed_at?: string
        }
        Update: {
          id?: string
          lead_funnel_entry_id?: string
          from_stage_id?: string | null
          to_stage_id?: string
          changed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_stage_history_lead_funnel_entry_id_fkey"
            columns: ["lead_funnel_entry_id"]
            isOneToOne: false
            referencedRelation: "lead_funnel_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "funnel_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "funnel_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          id: string
          organization_id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          source: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          created_at?: string
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
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          id: string
          workflow_id: string
          lead_id: string
          lead_funnel_entry_id: string
          current_step_id: string | null
          status: string
          started_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          lead_id: string
          lead_funnel_entry_id: string
          current_step_id?: string | null
          status?: string
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          workflow_id?: string
          lead_id?: string
          lead_funnel_entry_id?: string
          current_step_id?: string | null
          status?: string
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_lead_funnel_entry_id_fkey"
            columns: ["lead_funnel_entry_id"]
            isOneToOne: false
            referencedRelation: "lead_funnel_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          id: string
          workflow_id: string
          step_type: string
          config: Json | null
          next_step_id: string | null
          is_entry_point: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          step_type: string
          config?: Json | null
          next_step_id?: string | null
          is_entry_point?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workflow_id?: string
          step_type?: string
          config?: Json | null
          next_step_id?: string | null
          is_entry_point?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          id: string
          funnel_id: string
          name: string
          trigger_on: string
          trigger_conditions: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          funnel_id: string
          name: string
          trigger_on: string
          trigger_conditions?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          funnel_id?: string
          name?: string
          trigger_on?: string
          trigger_conditions?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
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

// Convenience helpers
type MarketingSchema = Database["marketing"]["Tables"]

export type Tables<T extends keyof MarketingSchema> = MarketingSchema[T]["Row"]
export type InsertTables<T extends keyof MarketingSchema> = MarketingSchema[T]["Insert"]
export type UpdateTables<T extends keyof MarketingSchema> = MarketingSchema[T]["Update"]
