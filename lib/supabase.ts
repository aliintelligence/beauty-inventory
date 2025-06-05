import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          cost: number
          customs_cost: number | null
          inventory_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          cost: number
          customs_cost?: number | null
          inventory_quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          cost?: number
          customs_cost?: number | null
          inventory_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string | null
          customer_phone: string | null
          customer_address: string | null
          total_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          total_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          total_amount?: number
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
    }
  }
}