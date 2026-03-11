-- Add fiscal fields to store_products
ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS ncm text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cfop text DEFAULT '5102',
  ADD COLUMN IF NOT EXISTS cst text DEFAULT '00',
  ADD COLUMN IF NOT EXISTS unit_measure text DEFAULT 'UN';

-- Add admin policies for orders (so admin can view/manage all orders)
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policies for coupons management
CREATE POLICY "Admins can insert coupons"
ON public.coupons FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update coupons"
ON public.coupons FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete coupons"
ON public.coupons FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));