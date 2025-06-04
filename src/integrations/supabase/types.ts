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
      agent: {
        Row: {
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          life_period: unknown | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          life_period?: unknown | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          life_period?: unknown | null
          name?: string
        }
        Relationships: []
      }
      candidate: {
        Row: {
          applied: boolean | null
          city_id: string | null
          created_at: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          embedding: string | null
          github: string | null
          id: string
          linkedin_url: string | null
          metadata: Json | null
          name: string
          phone: string | null
          rol: string | null
          summary: string | null
          transfer_head_quarters: boolean | null
          work_mode: string | null
        }
        Insert: {
          applied?: boolean | null
          city_id?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          embedding?: string | null
          github?: string | null
          id?: string
          linkedin_url?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          rol?: string | null
          summary?: string | null
          transfer_head_quarters?: boolean | null
          work_mode?: string | null
        }
        Update: {
          applied?: boolean | null
          city_id?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          embedding?: string | null
          github?: string | null
          id?: string
          linkedin_url?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          rol?: string | null
          summary?: string | null
          transfer_head_quarters?: boolean | null
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_document_type_fkey"
            columns: ["document_type"]
            isOneToOne: false
            referencedRelation: "document_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_city"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          candidate_id: string
          created_at: string | null
          end_date: string | null
          id: string
          is_completed: boolean | null
          is_current: boolean | null
          program_id: string | null
          start_date: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_current?: boolean | null
          program_id?: string | null
          start_date: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_completed?: boolean | null
          is_current?: boolean | null
          program_id?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_candidate"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_education"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_interest: {
        Row: {
          candidate_id: string
          id: string
          interest_id: string
        }
        Insert: {
          candidate_id: string
          id?: string
          interest_id: string
        }
        Update: {
          candidate_id?: string
          id?: string
          interest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_candidate"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_interest"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interest"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_language: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          language_id: string
          level: string | null
        }
        Insert: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          language_id?: string
          level?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          language_id?: string
          level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cand_language_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cand_language_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_process: {
        Row: {
          candidate_id: string
          end_date: string | null
          evaluation_id: string | null
          id: string
          job_position_id: string
          last_score: number | null
          similarity_explanation: string | null
          start_date: string
          status: string | null
        }
        Insert: {
          candidate_id: string
          end_date?: string | null
          evaluation_id?: string | null
          id?: string
          job_position_id: string
          last_score?: number | null
          similarity_explanation?: string | null
          start_date?: string
          status?: string | null
        }
        Update: {
          candidate_id?: string
          end_date?: string | null
          evaluation_id?: string | null
          id?: string
          job_position_id?: string
          last_score?: number | null
          similarity_explanation?: string | null
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_candidate"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_evaluation"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_position"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_position"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_technology: {
        Row: {
          candidate_id: string
          experience_years: number | null
          id: string
          technology_id: string
        }
        Insert: {
          candidate_id: string
          experience_years?: number | null
          id?: string
          technology_id: string
        }
        Update: {
          candidate_id?: string
          experience_years?: number | null
          id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_candidate"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_technology"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technology"
            referencedColumns: ["id"]
          },
        ]
      }
      city: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      company: {
        Row: {
          city_id: string | null
          company_size: string | null
          company_type: string | null
          id: string
          industry_id: string | null
          linkedin_id: string | null
          name: string
          website: string | null
        }
        Insert: {
          city_id?: string | null
          company_size?: string | null
          company_type?: string | null
          id?: string
          industry_id?: string | null
          linkedin_id?: string | null
          name: string
          website?: string | null
        }
        Update: {
          city_id?: string | null
          company_size?: string | null
          company_type?: string | null
          id?: string
          industry_id?: string | null
          linkedin_id?: string | null
          name?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_city"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_industry"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industry"
            referencedColumns: ["id"]
          },
        ]
      }
      document_type: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      evaluation: {
        Row: {
          candidate_process_id: string
          comments: string | null
          evaluation_type_id: string
          id: string
          score: number | null
        }
        Insert: {
          candidate_process_id: string
          comments?: string | null
          evaluation_type_id: string
          id?: string
          score?: number | null
        }
        Update: {
          candidate_process_id?: string
          comments?: string | null
          evaluation_type_id?: string
          id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_candidate_process"
            columns: ["candidate_process_id"]
            isOneToOne: false
            referencedRelation: "candidate_process"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_evaluation_type"
            columns: ["evaluation_type_id"]
            isOneToOne: false
            referencedRelation: "evaluation_type"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_type: {
        Row: {
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      experience: {
        Row: {
          candidate_id: string
          company_id: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          job_title: string
          start_date: string
          weight: number | null
          work_mode: string | null
        }
        Insert: {
          candidate_id: string
          company_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          job_title: string
          start_date: string
          weight?: number | null
          work_mode?: string | null
        }
        Update: {
          candidate_id?: string
          company_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          job_title?: string
          start_date?: string
          weight?: number | null
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_candidate"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      industry: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      interest: {
        Row: {
          description: string | null
          id: string
          interest_type_id: string
          linkedin_url: string
          name: string
        }
        Insert: {
          description?: string | null
          id: string
          interest_type_id: string
          linkedin_url: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          interest_type_id?: string
          linkedin_url?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_interest_type"
            columns: ["interest_type_id"]
            isOneToOne: false
            referencedRelation: "interest_type"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_type: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          job_position_id: string
          linkedin_url: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          job_position_id: string
          linkedin_url?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_position_id?: string
          linkedin_url?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_position_id_fkey"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_position"
            referencedColumns: ["id"]
          },
        ]
      }
      job_calification: {
        Row: {
          created_at: string
          id: string
          job_id: string | null
          score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id?: string | null
          score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_calification_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_position"
            referencedColumns: ["id"]
          },
        ]
      }
      job_position: {
        Row: {
          active: boolean | null
          created_at: string
          department: string | null
          description: string
          evaluation_criteria: string
          id: string
          is_open: boolean
          llm_score_threshold: number
          long_description: string | null
          name: string
          work_mode: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          department?: string | null
          description?: string
          evaluation_criteria: string
          id?: string
          is_open?: boolean
          llm_score_threshold?: number
          long_description?: string | null
          name: string
          work_mode?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          department?: string | null
          description?: string
          evaluation_criteria?: string
          id?: string
          is_open?: boolean
          llm_score_threshold?: number
          long_description?: string | null
          name?: string
          work_mode?: string | null
        }
        Relationships: []
      }
      language: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      language_equivalents: {
        Row: {
          id: string
          language_id: string
          name: string
        }
        Insert: {
          id?: string
          language_id: string
          name: string
        }
        Update: {
          id?: string
          language_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_language"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
      pg_net_exists: {
        Row: {
          exists: boolean | null
        }
        Insert: {
          exists?: boolean | null
        }
        Update: {
          exists?: boolean | null
        }
        Relationships: []
      }
      program: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          is_formal: boolean | null
          name: string | null
          program_level: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_formal?: boolean | null
          name?: string | null
          program_level?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_formal?: boolean | null
          name?: string | null
          program_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect: {
        Row: {
          agent_id: string
          created_at: string
          email: string | null
          id: string
          linkedin_url: string | null
          name: string | null
          phone: string | null
          profile_json: Json | null
          profile_text: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          phone?: string | null
          profile_json?: Json | null
          profile_text?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          phone?: string | null
          profile_json?: Json | null
          profile_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_evaluation: {
        Row: {
          created_at: string
          id: string
          job_position_id: string
          llm_evaluation: string | null
          llm_score: number | null
          prospect_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_position_id: string
          llm_evaluation?: string | null
          llm_score?: number | null
          prospect_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_position_id?: string
          llm_evaluation?: string | null
          llm_score?: number | null
          prospect_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_evaluation_job_position_id_fkey"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_evaluation_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospect"
            referencedColumns: ["id"]
          },
        ]
      }
      technology: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typetech"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "technology_type"
            referencedColumns: ["id"]
          },
        ]
      }
      technology_type: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      weight_job_education: {
        Row: {
          id: string
          job_position_id: string
          program_id: string
          weight: number | null
        }
        Insert: {
          id?: string
          job_position_id: string
          program_id: string
          weight?: number | null
        }
        Update: {
          id?: string
          job_position_id?: string
          program_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_job_position"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_program"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_job_evaluation: {
        Row: {
          evaluation_type_id: string
          id: string
          job_position_id: string
          weight: number
        }
        Insert: {
          evaluation_type_id: string
          id?: string
          job_position_id: string
          weight: number
        }
        Update: {
          evaluation_type_id?: string
          id?: string
          job_position_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_evaluation_type"
            columns: ["evaluation_type_id"]
            isOneToOne: false
            referencedRelation: "evaluation_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_position"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_position"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_job_interest: {
        Row: {
          id: string
          interest_id: string
          job_position_id: string
          weight: number
        }
        Insert: {
          id?: string
          interest_id: string
          job_position_id: string
          weight: number
        }
        Update: {
          id?: string
          interest_id?: string
          job_position_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_interest"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interest"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_position"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_position"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_job_tech: {
        Row: {
          id: string
          job_position_id: string
          tecnology_id: string
          weight: number | null
        }
        Insert: {
          id?: string
          job_position_id: string
          tecnology_id: string
          weight?: number | null
        }
        Update: {
          id?: string
          job_position_id?: string
          tecnology_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_job_position"
            columns: ["job_position_id"]
            isOneToOne: false
            referencedRelation: "job_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tecnology"
            columns: ["tecnology_id"]
            isOneToOne: false
            referencedRelation: "technology"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      candidate_vs_job_position_similarities: {
        Args: {
          inputs: Database["public"]["CompositeTypes"]["candidate_job_position"][]
        }
        Returns: {
          job_position_id: string
          similarity: number
        }[]
      }
      get_job_evaluation_data: {
        Args: { prospect_evaluation_id: string }
        Returns: {
          evaluation_criteria: string
          profile_text: string
          llm_score_threshold: number
        }[]
      }
      get_other_job_positions_for_prospect: {
        Args: { p_prospect_id: string }
        Returns: {
          id: string
          name: string
          description: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      insert_prospect_with_agent_and_job_position: {
        Args: {
          agent_id: string
          linkedin_url: string
          name: string
          phone: string
          email: string
          job_position_id: string
        }
        Returns: Json
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { match_count: number; query_embedding: string; filter?: Json }
        Returns: {
          id: string
          content: string
          similarity: number
        }[]
      }
      search_city_by_embedding: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          name: string
          similarity: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      candidate_job_position: {
        candidate_embedding: string | null
        job_position_id: string | null
      }
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
