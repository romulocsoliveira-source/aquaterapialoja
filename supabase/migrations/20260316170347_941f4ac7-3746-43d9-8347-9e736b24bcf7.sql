
-- Table to track deployment payment status per user
CREATE TABLE public.deployment_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pendente',
  amount numeric NOT NULL DEFAULT 300,
  pix_key text NOT NULL DEFAULT '18997348718',
  requested_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  confirmed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.deployment_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment status
CREATE POLICY "Users can view own deployment payment"
ON public.deployment_payments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own payment record
CREATE POLICY "Users can insert own deployment payment"
ON public.deployment_payments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own payment (to mark as requested)
CREATE POLICY "Users can update own deployment payment"
ON public.deployment_payments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all deployment payments"
ON public.deployment_payments FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all (to confirm payments)
CREATE POLICY "Admins can update all deployment payments"
ON public.deployment_payments FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_deployment_payments_updated_at
BEFORE UPDATE ON public.deployment_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
