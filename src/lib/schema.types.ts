
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"entity": string,"entity_id": string | null,"event_id": string | null,"id": number,"meta": NonNullable<Json>,"summary": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"entity": string,"entity_id"?: string | null,"event_id"?: string | null,"id"?: never,"meta"?: NonNullable<Json>,"summary"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"entity"?: string,"entity_id"?: string | null,"event_id"?: string | null,"id"?: never,"meta"?: NonNullable<Json>,"summary"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_analytics": {
                  Row: {
                    "created_at": string,"device": string | null,"event_id": string,"id": number,"label": string | null,"name": Database["public"]['Enums']["analytics_event"],"path": string | null,"referrer": string | null,"session_id": string | null,"utm_campaign": string | null,"utm_medium": string | null,"utm_source": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"device"?: string | null,"event_id": string,"id"?: never,"label"?: string | null,"name": Database["public"]['Enums']["analytics_event"],"path"?: string | null,"referrer"?: string | null,"session_id"?: string | null,"utm_campaign"?: string | null,"utm_medium"?: string | null,"utm_source"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"device"?: string | null,"event_id"?: string,"id"?: never,"label"?: string | null,"name"?: Database["public"]['Enums']["analytics_event"],"path"?: string | null,"referrer"?: string | null,"session_id"?: string | null,"utm_campaign"?: string | null,"utm_medium"?: string | null,"utm_source"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_analytics_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_audience": {
                  Row: {
                    "chart_type": Database["public"]['Enums']["chart_type"],"created_at": string,"data": NonNullable<Json>,"dimension": string,"event_id": string,"id": string,"note": string | null,"period": string | null,"position": number,"source": string | null,"title": string,"unit": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "chart_type"?: Database["public"]['Enums']["chart_type"],"created_at"?: string,"data"?: NonNullable<Json>,"dimension"?: string,"event_id": string,"id"?: string,"note"?: string | null,"period"?: string | null,"position"?: number,"source"?: string | null,"title": string,"unit"?: string | null
                  }
                  Update: {
                    "chart_type"?: Database["public"]['Enums']["chart_type"],"created_at"?: string,"data"?: NonNullable<Json>,"dimension"?: string,"event_id"?: string,"id"?: string,"note"?: string | null,"period"?: string | null,"position"?: number,"source"?: string | null,"title"?: string,"unit"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_audience_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_branding": {
                  Row: {
                    "color_accent": string,"color_background": string,"color_primary": string,"color_secondary": string,"color_text": string,"corner_style": string,"event_id": string,"favicon_url": string | null,"font_body": string,"font_heading": string,"grain": boolean,"heading_case": string,"logo_alt_url": string | null,"logo_url": string | null,"texture_opacity": number,"texture_url": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color_accent"?: string,"color_background"?: string,"color_primary"?: string,"color_secondary"?: string,"color_text"?: string,"corner_style"?: string,"event_id": string,"favicon_url"?: string | null,"font_body"?: string,"font_heading"?: string,"grain"?: boolean,"heading_case"?: string,"logo_alt_url"?: string | null,"logo_url"?: string | null,"texture_opacity"?: number,"texture_url"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "color_accent"?: string,"color_background"?: string,"color_primary"?: string,"color_secondary"?: string,"color_text"?: string,"corner_style"?: string,"event_id"?: string,"favicon_url"?: string | null,"font_body"?: string,"font_heading"?: string,"grain"?: boolean,"heading_case"?: string,"logo_alt_url"?: string | null,"logo_url"?: string | null,"texture_opacity"?: number,"texture_url"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_branding_event_id_fkey"
      columns: ["event_id"]
isOneToOne: true
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_integrations": {
                  Row: {
                    "event_id": string,"ga_measurement_id": string | null,"gtm_id": string | null,"meta_pixel_id": string | null,"notify_emails": (string)[],"tracking_enabled": boolean,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "event_id": string,"ga_measurement_id"?: string | null,"gtm_id"?: string | null,"meta_pixel_id"?: string | null,"notify_emails"?: (string)[],"tracking_enabled"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "event_id"?: string,"ga_measurement_id"?: string | null,"gtm_id"?: string | null,"meta_pixel_id"?: string | null,"notify_emails"?: (string)[],"tracking_enabled"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_integrations_event_id_fkey"
      columns: ["event_id"]
isOneToOne: true
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_media": {
                  Row: {
                    "alt": string | null,"caption": string | null,"created_at": string,"created_by": string | null,"credit": string | null,"event_id": string,"featured": boolean,"folder": string,"height": number | null,"id": string,"in_gallery": boolean,"kind": Database["public"]['Enums']["media_kind"],"mime_type": string | null,"position": number,"poster_url": string | null,"size_bytes": number | null,"storage_path": string | null,"url": string,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: string | null,"caption"?: string | null,"created_at"?: string,"created_by"?: string | null,"credit"?: string | null,"event_id": string,"featured"?: boolean,"folder"?: string,"height"?: number | null,"id"?: string,"in_gallery"?: boolean,"kind"?: Database["public"]['Enums']["media_kind"],"mime_type"?: string | null,"position"?: number,"poster_url"?: string | null,"size_bytes"?: number | null,"storage_path"?: string | null,"url": string,"width"?: number | null
                  }
                  Update: {
                    "alt"?: string | null,"caption"?: string | null,"created_at"?: string,"created_by"?: string | null,"credit"?: string | null,"event_id"?: string,"featured"?: boolean,"folder"?: string,"height"?: number | null,"id"?: string,"in_gallery"?: boolean,"kind"?: Database["public"]['Enums']["media_kind"],"mime_type"?: string | null,"position"?: number,"poster_url"?: string | null,"size_bytes"?: number | null,"storage_path"?: string | null,"url"?: string,"width"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_media_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_metrics": {
                  Row: {
                    "animate": boolean,"created_at": string,"description": string | null,"event_id": string,"featured": boolean,"id": string,"kind": Database["public"]['Enums']["metric_kind"],"label": string,"period": string | null,"position": number,"prefix": string | null,"source": string | null,"unit": string | null,"value": number
                  }
                  ComputedFields: never
                  Insert: {
                    "animate"?: boolean,"created_at"?: string,"description"?: string | null,"event_id": string,"featured"?: boolean,"id"?: string,"kind"?: Database["public"]['Enums']["metric_kind"],"label": string,"period"?: string | null,"position"?: number,"prefix"?: string | null,"source"?: string | null,"unit"?: string | null,"value": number
                  }
                  Update: {
                    "animate"?: boolean,"created_at"?: string,"description"?: string | null,"event_id"?: string,"featured"?: boolean,"id"?: string,"kind"?: Database["public"]['Enums']["metric_kind"],"label"?: string,"period"?: string | null,"position"?: number,"prefix"?: string | null,"source"?: string | null,"unit"?: string | null,"value"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_metrics_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_results": {
                  Row: {
                    "category": string,"created_at": string,"description": string | null,"event_id": string,"id": string,"label": string,"period": string | null,"position": number,"prefix": string | null,"previous_value": number | null,"source": string | null,"unit": string | null,"value": number
                  }
                  ComputedFields: never
                  Insert: {
                    "category"?: string,"created_at"?: string,"description"?: string | null,"event_id": string,"id"?: string,"label": string,"period"?: string | null,"position"?: number,"prefix"?: string | null,"previous_value"?: number | null,"source"?: string | null,"unit"?: string | null,"value": number
                  }
                  Update: {
                    "category"?: string,"created_at"?: string,"description"?: string | null,"event_id"?: string,"id"?: string,"label"?: string,"period"?: string | null,"position"?: number,"prefix"?: string | null,"previous_value"?: number | null,"source"?: string | null,"unit"?: string | null,"value"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_results_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_sections": {
                  Row: {
                    "body": string | null,"enabled": boolean,"event_id": string,"eyebrow": string | null,"id": string,"position": number,"settings": NonNullable<Json>,"title": string | null,"type": Database["public"]['Enums']["section_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string | null,"enabled"?: boolean,"event_id": string,"eyebrow"?: string | null,"id"?: string,"position"?: number,"settings"?: NonNullable<Json>,"title"?: string | null,"type": Database["public"]['Enums']["section_type"],"updated_at"?: string
                  }
                  Update: {
                    "body"?: string | null,"enabled"?: boolean,"event_id"?: string,"eyebrow"?: string | null,"id"?: string,"position"?: number,"settings"?: NonNullable<Json>,"title"?: string | null,"type"?: Database["public"]['Enums']["section_type"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_sections_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"event_sponsors": {
                  Row: {
                    "case_body": string | null,"case_title": string | null,"created_at": string,"event_id": string,"id": string,"position": number,"relation": Database["public"]['Enums']["sponsor_relation"],"sponsor_id": string,"tier_label": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "case_body"?: string | null,"case_title"?: string | null,"created_at"?: string,"event_id": string,"id"?: string,"position"?: number,"relation"?: Database["public"]['Enums']["sponsor_relation"],"sponsor_id": string,"tier_label"?: string | null
                  }
                  Update: {
                    "case_body"?: string | null,"case_title"?: string | null,"created_at"?: string,"event_id"?: string,"id"?: string,"position"?: number,"relation"?: Database["public"]['Enums']["sponsor_relation"],"sponsor_id"?: string,"tier_label"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_sponsors_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "event_sponsors_sponsor_id_fkey"
      columns: ["sponsor_id"]
isOneToOne: false
      referencedRelation: "sponsors"
      referencedColumns: ["id"]
    }
                  ]
                },"event_testimonials": {
                  Row: {
                    "author": string,"avatar_url": string | null,"company": string | null,"context": string,"created_at": string,"event_id": string,"id": string,"position": number,"quote": string,"role": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "author": string,"avatar_url"?: string | null,"company"?: string | null,"context"?: string,"created_at"?: string,"event_id": string,"id"?: string,"position"?: number,"quote": string,"role"?: string | null
                  }
                  Update: {
                    "author"?: string,"avatar_url"?: string | null,"company"?: string | null,"context"?: string,"created_at"?: string,"event_id"?: string,"id"?: string,"position"?: number,"quote"?: string,"role"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_testimonials_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "archived_at": string | null,"city": string | null,"contact_email": string | null,"contact_name": string | null,"contact_phone": string | null,"country": string | null,"created_at": string,"created_by": string | null,"date_label": string | null,"deck_enabled": boolean,"description": string | null,"duplicated_from": string | null,"edition_label": string | null,"edition_number": number | null,"ends_on": string | null,"footer_links": NonNullable<Json>,"form_interests": (string)[],"form_success_message": string | null,"id": string,"is_demo": boolean,"name": string,"noindex": boolean,"og_image_url": string | null,"organizer_about": string | null,"organizer_document": string | null,"organizer_name": string | null,"privacy_contact_email": string | null,"published_at": string | null,"seo_description": string | null,"seo_title": string | null,"short_description": string | null,"slug": string,"social_links": NonNullable<Json>,"starts_on": string | null,"state": string | null,"status": Database["public"]['Enums']["event_status"],"tagline": string | null,"updated_at": string,"updated_by": string | null,"venue": string | null,"whatsapp": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "archived_at"?: string | null,"city"?: string | null,"contact_email"?: string | null,"contact_name"?: string | null,"contact_phone"?: string | null,"country"?: string | null,"created_at"?: string,"created_by"?: string | null,"date_label"?: string | null,"deck_enabled"?: boolean,"description"?: string | null,"duplicated_from"?: string | null,"edition_label"?: string | null,"edition_number"?: number | null,"ends_on"?: string | null,"footer_links"?: NonNullable<Json>,"form_interests"?: (string)[],"form_success_message"?: string | null,"id"?: string,"is_demo"?: boolean,"name": string,"noindex"?: boolean,"og_image_url"?: string | null,"organizer_about"?: string | null,"organizer_document"?: string | null,"organizer_name"?: string | null,"privacy_contact_email"?: string | null,"published_at"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null,"slug": string,"social_links"?: NonNullable<Json>,"starts_on"?: string | null,"state"?: string | null,"status"?: Database["public"]['Enums']["event_status"],"tagline"?: string | null,"updated_at"?: string,"updated_by"?: string | null,"venue"?: string | null,"whatsapp"?: string | null
                  }
                  Update: {
                    "archived_at"?: string | null,"city"?: string | null,"contact_email"?: string | null,"contact_name"?: string | null,"contact_phone"?: string | null,"country"?: string | null,"created_at"?: string,"created_by"?: string | null,"date_label"?: string | null,"deck_enabled"?: boolean,"description"?: string | null,"duplicated_from"?: string | null,"edition_label"?: string | null,"edition_number"?: number | null,"ends_on"?: string | null,"footer_links"?: NonNullable<Json>,"form_interests"?: (string)[],"form_success_message"?: string | null,"id"?: string,"is_demo"?: boolean,"name"?: string,"noindex"?: boolean,"og_image_url"?: string | null,"organizer_about"?: string | null,"organizer_document"?: string | null,"organizer_name"?: string | null,"privacy_contact_email"?: string | null,"published_at"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null,"slug"?: string,"social_links"?: NonNullable<Json>,"starts_on"?: string | null,"state"?: string | null,"status"?: Database["public"]['Enums']["event_status"],"tagline"?: string | null,"updated_at"?: string,"updated_by"?: string | null,"venue"?: string | null,"whatsapp"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_duplicated_from_fkey"
      columns: ["duplicated_from"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"lead_interactions": {
                  Row: {
                    "author_id": string | null,"body": string | null,"created_at": string,"from_status": Database["public"]['Enums']["lead_status"] | null,"id": string,"kind": Database["public"]['Enums']["interaction_kind"],"lead_id": string,"to_status": Database["public"]['Enums']["lead_status"] | null
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body"?: string | null,"created_at"?: string,"from_status"?: Database["public"]['Enums']["lead_status"] | null,"id"?: string,"kind"?: Database["public"]['Enums']["interaction_kind"],"lead_id": string,"to_status"?: Database["public"]['Enums']["lead_status"] | null
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string | null,"created_at"?: string,"from_status"?: Database["public"]['Enums']["lead_status"] | null,"id"?: string,"kind"?: Database["public"]['Enums']["interaction_kind"],"lead_id"?: string,"to_status"?: Database["public"]['Enums']["lead_status"] | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "lead_interactions_lead_id_fkey"
      columns: ["lead_id"]
isOneToOne: false
      referencedRelation: "leads"
      referencedColumns: ["id"]
    }
                  ]
                },"leads": {
                  Row: {
                    "assigned_to": string | null,"company": string,"consent": boolean,"consent_at": string,"consent_version": string,"created_at": string,"cta_origin": string | null,"email": string,"estimated_value": number | null,"event_id": string,"full_name": string,"id": string,"interest": string | null,"ip_hash": string | null,"job_title": string | null,"landing_path": string | null,"last_contact_at": string | null,"marketing_opt_in": boolean,"message": string | null,"phone": string | null,"referrer": string | null,"seen_at": string | null,"segment": string | null,"status": Database["public"]['Enums']["lead_status"],"tier_id": string | null,"tier_name": string | null,"updated_at": string,"user_agent": string | null,"utm_campaign": string | null,"utm_content": string | null,"utm_medium": string | null,"utm_source": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_to"?: string | null,"company": string,"consent": boolean,"consent_at"?: string,"consent_version"?: string,"created_at"?: string,"cta_origin"?: string | null,"email": string,"estimated_value"?: number | null,"event_id": string,"full_name": string,"id"?: string,"interest"?: string | null,"ip_hash"?: string | null,"job_title"?: string | null,"landing_path"?: string | null,"last_contact_at"?: string | null,"marketing_opt_in"?: boolean,"message"?: string | null,"phone"?: string | null,"referrer"?: string | null,"seen_at"?: string | null,"segment"?: string | null,"status"?: Database["public"]['Enums']["lead_status"],"tier_id"?: string | null,"tier_name"?: string | null,"updated_at"?: string,"user_agent"?: string | null,"utm_campaign"?: string | null,"utm_content"?: string | null,"utm_medium"?: string | null,"utm_source"?: string | null
                  }
                  Update: {
                    "assigned_to"?: string | null,"company"?: string,"consent"?: boolean,"consent_at"?: string,"consent_version"?: string,"created_at"?: string,"cta_origin"?: string | null,"email"?: string,"estimated_value"?: number | null,"event_id"?: string,"full_name"?: string,"id"?: string,"interest"?: string | null,"ip_hash"?: string | null,"job_title"?: string | null,"landing_path"?: string | null,"last_contact_at"?: string | null,"marketing_opt_in"?: boolean,"message"?: string | null,"phone"?: string | null,"referrer"?: string | null,"seen_at"?: string | null,"segment"?: string | null,"status"?: Database["public"]['Enums']["lead_status"],"tier_id"?: string | null,"tier_name"?: string | null,"updated_at"?: string,"user_agent"?: string | null,"utm_campaign"?: string | null,"utm_content"?: string | null,"utm_medium"?: string | null,"utm_source"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "leads_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "leads_tier_id_fkey"
      columns: ["tier_id"]
isOneToOne: false
      referencedRelation: "sponsorship_tiers"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "active": boolean,"created_at": string,"email": string | null,"full_name": string,"id": string,"role": Database["public"]['Enums']["app_role"] | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"email"?: string | null,"full_name"?: string,"id": string,"role"?: Database["public"]['Enums']["app_role"] | null,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"email"?: string | null,"full_name"?: string,"id"?: string,"role"?: Database["public"]['Enums']["app_role"] | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"role_permissions": {
                  Row: {
                    "permission": string,"role": Database["public"]['Enums']["app_role"]
                  }
                  ComputedFields: never
                  Insert: {
                    "permission": string,"role": Database["public"]['Enums']["app_role"]
                  }
                  Update: {
                    "permission"?: string,"role"?: Database["public"]['Enums']["app_role"]
                  }
                  Relationships: [
                    
                  ]
                },"sponsors": {
                  Row: {
                    "created_at": string,"id": string,"logo_url": string | null,"name": string,"segment": string | null,"updated_at": string,"website": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"logo_url"?: string | null,"name": string,"segment"?: string | null,"updated_at"?: string,"website"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"logo_url"?: string | null,"name"?: string,"segment"?: string | null,"updated_at"?: string,"website"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"sponsorship_opportunities": {
                  Row: {
                    "category": string,"created_at": string,"deliverables": (string)[],"description": string | null,"enabled": boolean,"event_id": string,"id": string,"image_url": string | null,"position": number,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category"?: string,"created_at"?: string,"deliverables"?: (string)[],"description"?: string | null,"enabled"?: boolean,"event_id": string,"id"?: string,"image_url"?: string | null,"position"?: number,"title": string
                  }
                  Update: {
                    "category"?: string,"created_at"?: string,"deliverables"?: (string)[],"description"?: string | null,"enabled"?: boolean,"event_id"?: string,"id"?: string,"image_url"?: string | null,"position"?: number,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sponsorship_opportunities_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                },"sponsorship_tiers": {
                  Row: {
                    "benefits": (string)[],"created_at": string,"currency": string,"deliverables": (string)[],"description": string | null,"enabled": boolean,"event_id": string,"highlight": boolean,"id": string,"image_url": string | null,"name": string,"position": number,"price": number | null,"quantity_sold": number,"quantity_total": number | null,"show_price": boolean,"tagline": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "benefits"?: (string)[],"created_at"?: string,"currency"?: string,"deliverables"?: (string)[],"description"?: string | null,"enabled"?: boolean,"event_id": string,"highlight"?: boolean,"id"?: string,"image_url"?: string | null,"name": string,"position"?: number,"price"?: number | null,"quantity_sold"?: number,"quantity_total"?: number | null,"show_price"?: boolean,"tagline"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "benefits"?: (string)[],"created_at"?: string,"currency"?: string,"deliverables"?: (string)[],"description"?: string | null,"enabled"?: boolean,"event_id"?: string,"highlight"?: boolean,"id"?: string,"image_url"?: string | null,"name"?: string,"position"?: number,"price"?: number | null,"quantity_sold"?: number,"quantity_total"?: number | null,"show_price"?: boolean,"tagline"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sponsorship_tiers_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "public_event_tracking": {
                  Row: {
                    "event_id": string,"ga_measurement_id": string | null,"gtm_id": string | null,"meta_pixel_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "event_integrations_event_id_fkey"
      columns: ["event_id"]
isOneToOne: true
      referencedRelation: "events"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "current_app_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["app_role"]
                           },
"dashboard_overview":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"duplicate_event":
{ Args: { "p_copy_media"?: boolean,"p_copy_tiers"?: boolean,"p_name": string,"p_slug": string,"p_source": string }; Returns: string
                           },
"event_funnel":
{ Args: { "p_days"?: number,"p_event": string }; Returns: Json
                           },
"event_lead_counts":
{ Args: Record<PropertyKey, never>; Returns: {
              "event_id": string,"fresh": number,"total": number
            }[]
                           },
"has_permission":
{ Args: { "p": string }; Returns: boolean
                           },
"is_event_public":
{ Args: { "e": string }; Returns: boolean
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"lead_recent_count":
{ Args: { "p_ip_hash": string,"p_minutes"?: number }; Returns: number
                           }
          }
          Enums: {
            "analytics_event": "page_view"|"cta_click"|"tiers_view"|"form_start"|"form_submit"|"whatsapp_click"|"deck_download","app_role": "admin"|"editor"|"commercial","chart_type": "bar"|"donut"|"stat"|"map","event_status": "draft"|"published"|"archived","interaction_kind": "note"|"call"|"email"|"meeting"|"whatsapp"|"status_change"|"proposal","lead_status": "new"|"contacted"|"negotiating"|"proposal_sent"|"won"|"lost","media_kind": "image"|"video"|"embed","metric_kind": "actual"|"projection","section_type": "hero"|"metrics"|"grandeur"|"audience"|"results"|"opportunities"|"tiers"|"sponsors"|"next_edition"|"cta"|"footer","sponsor_relation": "past"|"current"|"institutional"|"supporter"|"media"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "analytics_event": ["page_view", "cta_click", "tiers_view", "form_start", "form_submit", "whatsapp_click", "deck_download"],"app_role": ["admin", "editor", "commercial"],"chart_type": ["bar", "donut", "stat", "map"],"event_status": ["draft", "published", "archived"],"interaction_kind": ["note", "call", "email", "meeting", "whatsapp", "status_change", "proposal"],"lead_status": ["new", "contacted", "negotiating", "proposal_sent", "won", "lost"],"media_kind": ["image", "video", "embed"],"metric_kind": ["actual", "projection"],"section_type": ["hero", "metrics", "grandeur", "audience", "results", "opportunities", "tiers", "sponsors", "next_edition", "cta", "footer"],"sponsor_relation": ["past", "current", "institutional", "supporter", "media"]
          }
        }
} as const
