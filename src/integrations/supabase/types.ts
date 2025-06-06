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
      absences: {
        Row: {
          approved: boolean | null
          created_at: string | null
          date: string
          employee_id: number
          id: number
          reason: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          date: string
          employee_id: number
          id?: number
          reason: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          date?: string
          employee_id?: number
          id?: number
          reason?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "absences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      absences_new: {
        Row: {
          approved: boolean | null
          created_at: string | null
          date: string
          employee_id: number
          id: number
          reason: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          date: string
          employee_id: number
          id?: number
          reason: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          date?: string
          employee_id?: number
          id?: number
          reason?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "absences_new_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_new"
            referencedColumns: ["id"]
          },
        ]
      }
      break_assignments: {
        Row: {
          created_at: string | null
          id: number
          operator_id: number
          supervisor_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          operator_id: number
          supervisor_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          operator_id?: number
          supervisor_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "break_assignments_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_assignments_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      break_assignments_new: {
        Row: {
          created_at: string | null
          id: number
          operator_id: number
          supervisor_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          operator_id: number
          supervisor_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          operator_id?: number
          supervisor_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "break_assignments_new_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: true
            referencedRelation: "employees_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_assignments_new_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees_new"
            referencedColumns: ["id"]
          },
        ]
      }
      break_rotations: {
        Row: {
          created_at: string | null
          hour: number
          id: number
          month: number
          operator_id: number
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          hour: number
          id?: number
          month: number
          operator_id: number
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          hour?: number
          id?: number
          month?: number
          operator_id?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "break_rotations_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      break_rotations_new: {
        Row: {
          created_at: string | null
          hour: number
          id: number
          month: number
          operator_id: number
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          hour: number
          id?: number
          month: number
          operator_id: number
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          hour?: number
          id?: number
          month?: number
          operator_id?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "break_rotations_new_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "employees_new"
            referencedColumns: ["id"]
          },
        ]
      }
      break_schedules: {
        Row: {
          created_at: string | null
          date: string
          hour: number
          id: number
          operator_id: number | null
          supervisor_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          hour: number
          id?: number
          operator_id?: number | null
          supervisor_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          hour?: number
          id?: number
          operator_id?: number | null
          supervisor_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "break_schedules_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_schedules_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      break_schedules_new: {
        Row: {
          created_at: string | null
          date: string
          hour: number
          id: number
          operator_id: number | null
          supervisor_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          hour: number
          id?: number
          operator_id?: number | null
          supervisor_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          hour?: number
          id?: number
          operator_id?: number | null
          supervisor_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "break_schedules_new_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "employees_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "break_schedules_new_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees_new"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string | null
          id: number
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employees_new: {
        Row: {
          created_at: string | null
          id: number
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          role?: string
          updated_at?: string | null
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
    Enums: {},
  },
} as const
