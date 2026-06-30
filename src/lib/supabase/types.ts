// Hand-written to match supabase/migrations/*.sql.
// Once Docker + `supabase start` are available, this can be regenerated with:
//   supabase gen types typescript --local > src/lib/supabase/types.ts

export type OfferCategory = 'schulung' | 'beratung'
export type CustomerStatus = 'lead' | 'active' | 'past'
export type SentOfferStatus = 'pending' | 'sent' | 'failed'

export interface Database {
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      offer_category: OfferCategory
      customer_status: CustomerStatus
      sent_offer_status: SentOfferStatus
    }
    CompositeTypes: Record<string, never>
    Tables: {
      training_sections: {
        Row: {
          id: string
          name: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['training_sections']['Insert']>
        Relationships: []
      }
      training_topics: {
        Row: {
          id: string
          section_id: string
          name: string
          description: string | null
          pptx_file_path: string | null
          pptx_original_filename: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          name: string
          description?: string | null
          pptx_file_path?: string | null
          pptx_original_filename?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['training_topics']['Insert']>
        Relationships: []
      }
      offers: {
        Row: {
          id: string
          category: OfferCategory
          name: string
          description: string | null
          price_cents: number
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: OfferCategory
          name: string
          description?: string | null
          price_cents?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['offers']['Insert']>
        Relationships: []
      }
      offer_items: {
        Row: {
          id: string
          offer_id: string
          label: string
          topic_id: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          offer_id: string
          label: string
          topic_id?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['offer_items']['Insert']>
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          status: CustomerStatus
          name: string
          company: string | null
          email: string | null
          phone: string | null
          address: string | null
          source: string | null
          status_changed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?: CustomerStatus
          name: string
          company?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          source?: string | null
          status_changed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
        Relationships: []
      }
      customer_notes: {
        Row: {
          id: string
          customer_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          body: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['customer_notes']['Insert']>
        Relationships: []
      }
      sent_offers: {
        Row: {
          id: string
          customer_id: string
          offer_id: string | null
          free_text: string | null
          has_audio: boolean
          webhook_url: string
          status: SentOfferStatus
          response_status_code: number | null
          response_body: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          offer_id?: string | null
          free_text?: string | null
          has_audio?: boolean
          webhook_url: string
          status?: SentOfferStatus
          response_status_code?: number | null
          response_body?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sent_offers']['Insert']>
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['app_settings']['Insert']>
        Relationships: []
      }
    }
  }
}
