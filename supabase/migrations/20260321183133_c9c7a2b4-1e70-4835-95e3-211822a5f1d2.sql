
-- Payment settings table
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  environment text NOT NULL DEFAULT 'sandbox',
  is_active boolean NOT NULL DEFAULT false,
  sandbox_token text,
  production_token text,
  webhook_url text,
  public_key text,
  account_reference text,
  pix_enabled boolean NOT NULL DEFAULT true,
  pix_expiration_minutes integer NOT NULL DEFAULT 30,
  pix_instructions text DEFAULT 'Pague via PIX para confirmar seu pedido.',
  credit_card_enabled boolean NOT NULL DEFAULT false,
  max_installments integer NOT NULL DEFAULT 12,
  min_installment_value numeric NOT NULL DEFAULT 10,
  interest_on_store boolean NOT NULL DEFAULT true,
  require_cardholder_name boolean NOT NULL DEFAULT true,
  require_buyer_cpf boolean NOT NULL DEFAULT true,
  boleto_enabled boolean NOT NULL DEFAULT false,
  boleto_due_days integer NOT NULL DEFAULT 3,
  boleto_instructions text DEFAULT 'Pague o boleto até o vencimento para confirmar seu pedido.',
  last_test_at timestamp with time zone,
  last_test_status text,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment settings"
  ON public.payment_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Payment webhook logs
CREATE TABLE public.payment_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text,
  payload jsonb,
  order_id uuid REFERENCES public.orders(id),
  transaction_id text,
  status text,
  processed boolean NOT NULL DEFAULT false,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read webhook logs"
  ON public.payment_webhook_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payment gateway logs (for debugging)
CREATE TABLE public.payment_gateway_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  request_data jsonb,
  response_data jsonb,
  status_code integer,
  success boolean NOT NULL DEFAULT false,
  error_message text,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_gateway_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read gateway logs"
  ON public.payment_gateway_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert gateway logs"
  ON public.payment_gateway_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add payment transaction fields to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gateway_transaction_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gateway_status text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gateway_paid_at timestamp with time zone;
