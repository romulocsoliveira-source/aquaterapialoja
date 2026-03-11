
-- Create fiscal invoices table
CREATE TABLE public.fiscal_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  invoice_type text NOT NULL DEFAULT 'nfce', -- 'nfe' or 'nfce'
  invoice_number text,
  series text DEFAULT '1',
  access_key text,
  status text NOT NULL DEFAULT 'pending', -- pending, authorized, cancelled, rejected
  xml_content text,
  customer_name text,
  customer_cpf text,
  customer_cnpj text,
  customer_address jsonb,
  total_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  shipping_amount numeric DEFAULT 0,
  tax_icms numeric DEFAULT 0,
  tax_pis numeric DEFAULT 0,
  tax_cofins numeric DEFAULT 0,
  payment_method text,
  notes text,
  cancelled_at timestamptz,
  cancellation_reason text,
  authorized_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fiscal_invoices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can read invoices" ON public.fiscal_invoices FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert invoices" ON public.fiscal_invoices FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update invoices" ON public.fiscal_invoices FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete invoices" ON public.fiscal_invoices FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_fiscal_invoices_updated_at BEFORE UPDATE ON public.fiscal_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
