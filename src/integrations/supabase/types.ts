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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      acomodacoes_hotel: {
        Row: {
          ativo: boolean
          capacidade: number
          created_at: string
          descricao: string | null
          id: string
          nome: string
          preco_diaria: number
        }
        Insert: {
          ativo?: boolean
          capacidade?: number
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          preco_diaria?: number
        }
        Update: {
          ativo?: boolean
          capacidade?: number
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          preco_diaria?: number
        }
        Relationships: []
      }
      addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          id: string
          is_default: boolean | null
          label: string | null
          neighborhood: string
          number: string
          state: string
          street: string
          updated_at: string
          user_id: string
          zip_code: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          neighborhood: string
          number: string
          state: string
          street: string
          updated_at?: string
          user_id: string
          zip_code: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          neighborhood?: string
          number?: string
          state?: string
          street?: string
          updated_at?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      agendamentos: {
        Row: {
          created_at: string
          data: string
          forma_pagamento: string | null
          horario: string
          id: string
          observacoes: string | null
          pet_id: string
          servico_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          forma_pagamento?: string | null
          horario: string
          id?: string
          observacoes?: string | null
          pet_id: string
          servico_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          forma_pagamento?: string | null
          horario?: string
          id?: string
          observacoes?: string | null
          pet_id?: string
          servico_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          bank_name: string | null
          created_at: string
          created_by: string
          current_balance: number
          id: string
          initial_balance: number
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          bank_name?: string | null
          created_at?: string
          created_by: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          bank_name?: string | null
          created_at?: string
          created_by?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_value: number | null
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_value?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_value?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      deployment_payments: {
        Row: {
          amount: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          pix_key: string
          requested_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          pix_key?: string
          requested_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          pix_key?: string
          requested_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          category: string
          created_at: string
          created_by: string
          description: string
          due_date: string | null
          id: string
          is_paid: boolean
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          reference_id: string | null
          reference_type: string | null
          sales_channel: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category?: string
          created_at?: string
          created_by: string
          description: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sales_channel?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sales_channel?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      fiscal_invoices: {
        Row: {
          access_key: string | null
          authorized_at: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string
          customer_address: Json | null
          customer_cnpj: string | null
          customer_cpf: string | null
          customer_name: string | null
          discount_amount: number | null
          id: string
          invoice_number: string | null
          invoice_type: string
          notes: string | null
          order_id: string | null
          payment_method: string | null
          series: string | null
          shipping_amount: number | null
          status: string
          tax_cofins: number | null
          tax_icms: number | null
          tax_pis: number | null
          total_amount: number
          updated_at: string
          xml_content: string | null
        }
        Insert: {
          access_key?: string | null
          authorized_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by: string
          customer_address?: Json | null
          customer_cnpj?: string | null
          customer_cpf?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          id?: string
          invoice_number?: string | null
          invoice_type?: string
          notes?: string | null
          order_id?: string | null
          payment_method?: string | null
          series?: string | null
          shipping_amount?: number | null
          status?: string
          tax_cofins?: number | null
          tax_icms?: number | null
          tax_pis?: number | null
          total_amount?: number
          updated_at?: string
          xml_content?: string | null
        }
        Update: {
          access_key?: string | null
          authorized_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string
          customer_address?: Json | null
          customer_cnpj?: string | null
          customer_cpf?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          id?: string
          invoice_number?: string | null
          invoice_type?: string
          notes?: string | null
          order_id?: string | null
          payment_method?: string | null
          series?: string | null
          shipping_amount?: number | null
          status?: string
          tax_cofins?: number | null
          tax_icms?: number | null
          tax_pis?: number | null
          total_amount?: number
          updated_at?: string
          xml_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          unit_price: number
          variation: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          quantity: number
          unit_price: number
          variation?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          variation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          discount: number | null
          gateway_paid_at: string | null
          gateway_status: string | null
          gateway_transaction_id: string | null
          id: string
          payment_method: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string
          total: number
          tracking_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount?: number | null
          gateway_paid_at?: string | null
          gateway_status?: string | null
          gateway_transaction_id?: string | null
          id?: string
          payment_method?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          total: number
          tracking_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount?: number | null
          gateway_paid_at?: string | null
          gateway_status?: string | null
          gateway_transaction_id?: string | null
          id?: string
          payment_method?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          total?: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_gateway_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          request_data: Json | null
          response_data: Json | null
          status_code: number | null
          success: boolean
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          status_code?: number | null
          success?: boolean
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          status_code?: number | null
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          account_reference: string | null
          boleto_due_days: number
          boleto_enabled: boolean
          boleto_instructions: string | null
          created_at: string
          credit_card_enabled: boolean
          environment: string
          id: string
          interest_on_store: boolean
          is_active: boolean
          last_test_at: string | null
          last_test_status: string | null
          max_installments: number
          min_installment_value: number
          pix_enabled: boolean
          pix_expiration_minutes: number
          pix_instructions: string | null
          production_token: string | null
          public_key: string | null
          require_buyer_cpf: boolean
          require_cardholder_name: boolean
          sandbox_token: string | null
          updated_at: string
          updated_by: string | null
          webhook_url: string | null
        }
        Insert: {
          account_reference?: string | null
          boleto_due_days?: number
          boleto_enabled?: boolean
          boleto_instructions?: string | null
          created_at?: string
          credit_card_enabled?: boolean
          environment?: string
          id?: string
          interest_on_store?: boolean
          is_active?: boolean
          last_test_at?: string | null
          last_test_status?: string | null
          max_installments?: number
          min_installment_value?: number
          pix_enabled?: boolean
          pix_expiration_minutes?: number
          pix_instructions?: string | null
          production_token?: string | null
          public_key?: string | null
          require_buyer_cpf?: boolean
          require_cardholder_name?: boolean
          sandbox_token?: string | null
          updated_at?: string
          updated_by?: string | null
          webhook_url?: string | null
        }
        Update: {
          account_reference?: string | null
          boleto_due_days?: number
          boleto_enabled?: boolean
          boleto_instructions?: string | null
          created_at?: string
          credit_card_enabled?: boolean
          environment?: string
          id?: string
          interest_on_store?: boolean
          is_active?: boolean
          last_test_at?: string | null
          last_test_status?: string | null
          max_installments?: number
          min_installment_value?: number
          pix_enabled?: boolean
          pix_expiration_minutes?: number
          pix_instructions?: string | null
          production_token?: string | null
          public_key?: string | null
          require_buyer_cpf?: boolean
          require_cardholder_name?: boolean
          sandbox_token?: string | null
          updated_at?: string
          updated_by?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      payment_webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string | null
          id: string
          order_id: string | null
          payload: Json | null
          processed: boolean
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          processed?: boolean
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          processed?: boolean
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_webhook_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          created_at: string
          especie: string
          id: string
          idade: string | null
          nome: string
          observacoes: string | null
          peso: string | null
          raca: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          especie?: string
          id?: string
          idade?: string | null
          nome: string
          observacoes?: string | null
          peso?: string | null
          raca?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          especie?: string
          id?: string
          idade?: string | null
          nome?: string
          observacoes?: string | null
          peso?: string | null
          raca?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          first_login: boolean
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          first_login?: boolean
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          first_login?: boolean
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          product_name: string
          purchase_id: string
          quantity: number
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name: string
          purchase_id: string
          quantity?: number
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name?: string
          purchase_id?: string
          quantity?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          purchased_at: string
          received_at: string | null
          status: string
          supplier_id: string | null
          supplier_name: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          purchased_at?: string
          received_at?: string | null
          status?: string
          supplier_id?: string | null
          supplier_name: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          purchased_at?: string
          received_at?: string | null
          status?: string
          supplier_id?: string | null
          supplier_name?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas_hotel: {
        Row: {
          acomodacao_id: string
          checkin: string
          checkout: string
          created_at: string
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          pet_id: string
          servicos_extras: string[] | null
          status: string
          updated_at: string
          user_id: string
          valor_total: number
        }
        Insert: {
          acomodacao_id: string
          checkin: string
          checkout: string
          created_at?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pet_id: string
          servicos_extras?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
          valor_total?: number
        }
        Update: {
          acomodacao_id?: string
          checkin?: string
          checkout?: string
          created_at?: string
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pet_id?: string
          servicos_extras?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservas_hotel_acomodacao_id_fkey"
            columns: ["acomodacao_id"]
            isOneToOne: false
            referencedRelation: "acomodacoes_hotel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_hotel_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          duracao: string | null
          id: string
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao?: string | null
          id?: string
          nome: string
          preco?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao?: string | null
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      store_categories: {
        Row: {
          created_at: string
          id: string
          image: string | null
          name: string
          parent: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          image?: string | null
          name: string
          parent?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          parent?: string | null
          slug?: string
        }
        Relationships: []
      }
      store_config: {
        Row: {
          auto_stock_control: boolean | null
          certificate_password: string | null
          certificate_url: string | null
          city: string | null
          cnpj: string | null
          company_name: string | null
          complement: string | null
          completed_steps: number[] | null
          created_at: string
          created_by: string
          current_step: number | null
          delivery_fee: number | null
          delivery_neighborhoods: string[] | null
          delivery_radius: number | null
          email: string | null
          has_delivery: boolean | null
          has_mercadolivre: boolean | null
          id: string
          invoice_type: string | null
          issues_invoice: boolean | null
          logo_url: string | null
          min_stock_default: number | null
          ml_email: string | null
          ml_login: string | null
          ml_store_name: string | null
          neighborhood: string | null
          number: string | null
          payment_methods: string[] | null
          phone: string | null
          product_import_method: string | null
          setup_completed: boolean | null
          state: string | null
          street: string | null
          tax_regime: string | null
          trade_name: string | null
          updated_at: string
          whatsapp: string | null
          zip_code: string | null
        }
        Insert: {
          auto_stock_control?: boolean | null
          certificate_password?: string | null
          certificate_url?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          complement?: string | null
          completed_steps?: number[] | null
          created_at?: string
          created_by: string
          current_step?: number | null
          delivery_fee?: number | null
          delivery_neighborhoods?: string[] | null
          delivery_radius?: number | null
          email?: string | null
          has_delivery?: boolean | null
          has_mercadolivre?: boolean | null
          id?: string
          invoice_type?: string | null
          issues_invoice?: boolean | null
          logo_url?: string | null
          min_stock_default?: number | null
          ml_email?: string | null
          ml_login?: string | null
          ml_store_name?: string | null
          neighborhood?: string | null
          number?: string | null
          payment_methods?: string[] | null
          phone?: string | null
          product_import_method?: string | null
          setup_completed?: boolean | null
          state?: string | null
          street?: string | null
          tax_regime?: string | null
          trade_name?: string | null
          updated_at?: string
          whatsapp?: string | null
          zip_code?: string | null
        }
        Update: {
          auto_stock_control?: boolean | null
          certificate_password?: string | null
          certificate_url?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          complement?: string | null
          completed_steps?: number[] | null
          created_at?: string
          created_by?: string
          current_step?: number | null
          delivery_fee?: number | null
          delivery_neighborhoods?: string[] | null
          delivery_radius?: number | null
          email?: string | null
          has_delivery?: boolean | null
          has_mercadolivre?: boolean | null
          id?: string
          invoice_type?: string | null
          issues_invoice?: boolean | null
          logo_url?: string | null
          min_stock_default?: number | null
          ml_email?: string | null
          ml_login?: string | null
          ml_store_name?: string | null
          neighborhood?: string | null
          number?: string | null
          payment_methods?: string[] | null
          phone?: string | null
          product_import_method?: string | null
          setup_completed?: boolean | null
          state?: string | null
          street?: string | null
          tax_regime?: string | null
          trade_name?: string | null
          updated_at?: string
          whatsapp?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      store_products: {
        Row: {
          badge: string | null
          barcode: string
          benefits: string[] | null
          category: string
          category_slug: string
          cfop: string | null
          cost_price: number | null
          created_at: string
          cst: string | null
          description: string | null
          id: string
          image: string | null
          images: string[] | null
          instructions: string | null
          is_active: boolean | null
          is_best_seller: boolean | null
          is_new: boolean | null
          name: string
          ncm: string | null
          parent_category: string | null
          price: number
          promo_price: number | null
          rating: number | null
          reviews: number | null
          sales_channel: string | null
          sku: string
          slug: string
          specs: string[] | null
          stock: number
          unit_measure: string | null
          updated_at: string
          variations: string[] | null
        }
        Insert: {
          badge?: string | null
          barcode: string
          benefits?: string[] | null
          category: string
          category_slug: string
          cfop?: string | null
          cost_price?: number | null
          created_at?: string
          cst?: string | null
          description?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          instructions?: string | null
          is_active?: boolean | null
          is_best_seller?: boolean | null
          is_new?: boolean | null
          name: string
          ncm?: string | null
          parent_category?: string | null
          price: number
          promo_price?: number | null
          rating?: number | null
          reviews?: number | null
          sales_channel?: string | null
          sku: string
          slug: string
          specs?: string[] | null
          stock?: number
          unit_measure?: string | null
          updated_at?: string
          variations?: string[] | null
        }
        Update: {
          badge?: string | null
          barcode?: string
          benefits?: string[] | null
          category?: string
          category_slug?: string
          cfop?: string | null
          cost_price?: number | null
          created_at?: string
          cst?: string | null
          description?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          instructions?: string | null
          is_active?: boolean | null
          is_best_seller?: boolean | null
          is_new?: boolean | null
          name?: string
          ncm?: string | null
          parent_category?: string | null
          price?: number
          promo_price?: number | null
          rating?: number | null
          reviews?: number | null
          sales_channel?: string | null
          sku?: string
          slug?: string
          specs?: string[] | null
          stock?: number
          unit_measure?: string | null
          updated_at?: string
          variations?: string[] | null
        }
        Relationships: []
      }
      supplier_products: {
        Row: {
          cost_price: number | null
          created_at: string
          id: string
          product_id: string
          supplier_id: string
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          id?: string
          product_id: string
          supplier_id: string
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          id?: string
          product_id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "store_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
