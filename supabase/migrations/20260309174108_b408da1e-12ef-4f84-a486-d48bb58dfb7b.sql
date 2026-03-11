
-- Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  min_order_value numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  valid_from timestamp with time zone NOT NULL DEFAULT now(),
  valid_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Allow public read for active coupons (validation)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active coupons" ON public.coupons
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Insert initial coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, max_uses) VALUES
  ('BEMVINDO10', 'percentage', 10, 50, 1000),
  ('DESCONTO15', 'percentage', 15, 100, 500),
  ('PRIMEIRACOMPRA', 'percentage', 20, 150, 200),
  ('FRETE0', 'fixed', 30, 200, 300),
  ('SEDUTOR25', 'percentage', 25, 250, 100);
