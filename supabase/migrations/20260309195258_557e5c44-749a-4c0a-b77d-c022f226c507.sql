
-- Add cost_price to store_products for profit calculation
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;

-- Financial transactions table (accounts payable, receivable, cash flow)
CREATE TABLE public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense', 'payable', 'receivable')),
  category text NOT NULL DEFAULT 'Geral',
  description text NOT NULL,
  amount numeric NOT NULL,
  due_date date,
  paid_date date,
  is_paid boolean NOT NULL DEFAULT false,
  payment_method text,
  reference_id text,
  reference_type text,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage financial data
CREATE POLICY "Admins can read financial data"
  ON public.financial_transactions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert financial data"
  ON public.financial_transactions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update financial data"
  ON public.financial_transactions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete financial data"
  ON public.financial_transactions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
