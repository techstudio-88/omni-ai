// Generated from the OmniBrain Supabase schema.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          deleted_at: string | null
          document_id: string | null
          id: string
          message_id: string | null
          mime_type: string
          name: string
          size_bytes: number
          status: string
          storage_path: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          message_id?: string | null
          mime_type: string
          name: string
          size_bytes?: number
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          message_id?: string | null
          mime_type?: string
          name?: string
          size_bytes?: number
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      citations: {
        Row: {
          created_at: string
          deleted_at: string | null
          document_id: string | null
          id: string
          message_id: string | null
          page_number: number | null
          retrieved_at: string
          section_title: string | null
          source_type: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          message_id?: string | null
          page_number?: number | null
          retrieved_at?: string
          section_title?: string | null
          source_type: string
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          message_id?: string | null
          page_number?: number | null
          retrieved_at?: string
          section_title?: string | null
          source_type?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "citations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citations_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json
          mode: string
          model: string | null
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          mode?: string
          model?: string | null
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          mode?: string
          model?: string | null
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_assistants: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          instructions: string
          model: string | null
          name: string
          tools: string[]
          updated_at: string
          user_id: string
          visibility: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          instructions?: string
          model?: string | null
          name: string
          tools?: string[]
          updated_at?: string
          user_id: string
          visibility?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          instructions?: string
          model?: string | null
          name?: string
          tools?: string[]
          updated_at?: string
          user_id?: string
          visibility?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_assistants_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          created_at: string
          deleted_at: string | null
          document_id: string
          embedding: string | null
          id: string
          metadata: Json
          page_number: number | null
          section_title: string | null
          text: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          chunk_index: number
          created_at?: string
          deleted_at?: string | null
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json
          page_number?: number | null
          section_title?: string | null
          text: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          chunk_index?: number
          created_at?: string
          deleted_at?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          page_number?: number | null
          section_title?: string | null
          text?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          deleted_at: string | null
          error_message: string | null
          id: string
          metadata: Json
          mime_type: string
          name: string
          page_count: number | null
          project_id: string | null
          size_bytes: number
          status: string
          storage_path: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json
          mime_type: string
          name: string
          page_count?: number | null
          project_id?: string | null
          size_bytes: number
          status?: string
          storage_path: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json
          mime_type?: string
          name?: string
          page_count?: number | null
          project_id?: string | null
          size_bytes?: number
          status?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_runs: {
        Row: {
          conversation_id: string | null
          created_at: string
          deleted_at: string | null
          error_code: string | null
          id: string
          model: string | null
          provider: string | null
          request_time_ms: number | null
          retry_count: number
          status: string
          updated_at: string
          user_id: string
          workflow: string
          workspace_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          deleted_at?: string | null
          error_code?: string | null
          id?: string
          model?: string | null
          provider?: string | null
          request_time_ms?: number | null
          retry_count?: number
          status?: string
          updated_at?: string
          user_id: string
          workflow: string
          workspace_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          deleted_at?: string | null
          error_code?: string | null
          id?: string
          model?: string | null
          provider?: string | null
          request_time_ms?: number | null
          retry_count?: number
          status?: string
          updated_at?: string
          user_id?: string
          workflow?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_runs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_steps: {
        Row: {
          created_at: string
          deleted_at: string | null
          detail: string | null
          duration_ms: number | null
          id: string
          name: string
          run_id: string
          status: string
          step_index: number
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          detail?: string | null
          duration_ms?: number | null
          id?: string
          name: string
          run_id: string
          status: string
          step_index: number
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          detail?: string | null
          duration_ms?: number | null
          id?: string
          name?: string
          run_id?: string
          status?: string
          step_index?: number
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "execution_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_steps_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string | null
          comment: string | null
          created_at: string
          deleted_at: string | null
          id: string
          message_id: string | null
          rating: number | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          category?: string | null
          comment?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          message_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          category?: string | null
          comment?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          message_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          confidence: number
          created_at: string
          deleted_at: string | null
          enabled: boolean
          id: string
          key: string
          source: string
          type: string
          updated_at: string
          user_id: string
          value: string
          workspace_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: string
          key: string
          source?: string
          type?: string
          updated_at?: string
          user_id: string
          value: string
          workspace_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          deleted_at?: string | null
          enabled?: boolean
          id?: string
          key?: string
          source?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      message_versions: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          message_id: string
          updated_at: string
          user_id: string
          version: number
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          message_id: string
          updated_at?: string
          user_id: string
          version: number
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          message_id?: string
          updated_at?: string
          user_id?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_versions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_versions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json
          model: string | null
          parts: Json
          provider: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          model?: string | null
          parts?: Json
          provider?: string | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          model?: string | null
          parts?: Json
          provider?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          context_window: number | null
          created_at: string
          id: string
          input_cost_usd: number | null
          name: string
          output_cost_usd: number | null
          provider_id: string
          status: string
          supports_tools: boolean
          supports_vision: boolean
          updated_at: string
        }
        Insert: {
          context_window?: number | null
          created_at?: string
          id: string
          input_cost_usd?: number | null
          name: string
          output_cost_usd?: number | null
          provider_id: string
          status?: string
          supports_tools?: boolean
          supports_vision?: boolean
          updated_at?: string
        }
        Update: {
          context_window?: number | null
          created_at?: string
          id?: string
          input_cost_usd?: number | null
          name?: string
          output_cost_usd?: number | null
          provider_id?: string
          status?: string
          supports_tools?: boolean
          supports_vision?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_events: {
        Row: {
          action: string
          category: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          action: string
          category: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          deleted_at: string | null
          external_id: string | null
          id: string
          metadata: Json
          provider: string | null
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          deleted_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          provider?: string | null
          status: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          deleted_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          provider?: string | null
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id: string
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          project_id: string
          role: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          project_id: string
          role?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          project_id?: string
          role?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          instructions: string
          name: string
          settings: Json
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          instructions?: string
          name: string
          settings?: Json
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          instructions?: string
          name?: string
          settings?: Json
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          body: string
          category: string
          created_at: string
          deleted_at: string | null
          id: string
          is_shared: boolean
          title: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_shared?: boolean
          title: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_shared?: boolean
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          capabilities: string[]
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          capabilities?: string[]
          created_at?: string
          id: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          capabilities?: string[]
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_links: {
        Row: {
          conversation_id: string
          created_at: string
          deleted_at: string | null
          expires_at: string | null
          id: string
          revoked_at: string | null
          token_hash: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          token_hash: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          token_hash?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_links_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_links_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          deleted_at: string | null
          external_id: string | null
          id: string
          metadata: Json
          period_end: string | null
          period_start: string | null
          plan: string
          provider: string | null
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          period_end?: string | null
          period_start?: string | null
          plan?: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          period_end?: string | null
          period_start?: string | null
          plan?: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_calls: {
        Row: {
          confirmed_at: string | null
          conversation_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          input: Json
          output: Json | null
          status: string
          tool_id: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          confirmed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          input?: Json
          output?: Json | null
          status?: string
          tool_id: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          confirmed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          input?: Json
          output?: Json | null
          status?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_calls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_calls_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_calls_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_definitions: {
        Row: {
          config: Json
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          requires_confirmation: boolean
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description: string
          enabled?: boolean
          id: string
          name: string
          requires_confirmation?: boolean
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          requires_confirmation?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          deleted_at: string | null
          estimated_cost_usd: number | null
          id: string
          input_tokens: number | null
          model: string
          output_tokens: number | null
          provider: string
          request_time_ms: number
          retry_count: number
          status: string
          tool_usage: Json
          total_tokens: number | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          estimated_cost_usd?: number | null
          id?: string
          input_tokens?: number | null
          model: string
          output_tokens?: number | null
          provider: string
          request_time_ms?: number
          retry_count?: number
          status: string
          tool_usage?: Json
          total_tokens?: number | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          estimated_cost_usd?: number | null
          id?: string
          input_tokens?: number | null
          model?: string
          output_tokens?: number | null
          provider?: string
          request_time_ms?: number
          retry_count?: number
          status?: string
          tool_usage?: Json
          total_tokens?: number | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          joined_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          joined_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          joined_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          owner_id: string
          plan: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          owner_id: string
          plan?: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: {
        Args: { target_workspace: string }
        Returns: boolean
      }
      is_workspace_owner: {
        Args: { target_workspace: string }
        Returns: boolean
      }
      match_document_chunks: {
        Args: {
          p_document_ids?: string[]
          p_match_count?: number
          p_query: string
          p_user_id: string
        }
        Returns: {
          document_id: string
          document_name: string
          id: string
          page_number: number
          section_title: string
          similarity: number
          text: string
        }[]
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
