
-- Store configuration table for the setup wizard
CREATE TABLE public.store_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  -- Step 1: Company data
  company_name text,
  trade_name text,
  cnpj text,
  phone text,
  whatsapp text,
  email text,
  logo_url text,
  -- Step 2: Address
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  -- Step 3: Fiscal
  tax_regime text,
  issues_invoice boolean DEFAULT false,
  invoice_type text,
  certificate_url text,
  certificate_password text,
  -- Step 4: Products method
  product_import_method text,
  -- Step 5: Stock
  auto_stock_control boolean DEFAULT true,
  min_stock_default integer DEFAULT 5,
  -- Step 6: Payment methods
  payment_methods text[] DEFAULT '{}',
  -- Step 7: Delivery
  has_delivery boolean DEFAULT false,
  delivery_fee numeric DEFAULT 0,
  delivery_radius numeric DEFAULT 0,
  delivery_neighborhoods text[] DEFAULT '{}',
  -- Step 8: Mercado Livre
  has_mercadolivre boolean DEFAULT false,
  ml_email text,
  ml_login text,
  ml_store_name text,
  -- Progress tracking
  completed_steps integer[] DEFAULT '{}',
  current_step integer DEFAULT 1,
  setup_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage store config"
ON public.store_config FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_store_config_updated_at
BEFORE UPDATE ON public.store_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
