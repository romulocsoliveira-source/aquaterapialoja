
-- Fix: Change RESTRICTIVE policies to PERMISSIVE for orders table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix order_items policies too
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;

CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Fix profiles policies (admin needs to read all profiles for order names)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix financial_transactions policies
DROP POLICY IF EXISTS "Admins can read financial data" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins can insert financial data" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins can update financial data" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins can delete financial data" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can insert own financial transactions" ON public.financial_transactions;

CREATE POLICY "Admins can read financial data" ON public.financial_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert financial data" ON public.financial_transactions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update financial data" ON public.financial_transactions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete financial data" ON public.financial_transactions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own financial transactions" ON public.financial_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Fix agendamentos policies
DROP POLICY IF EXISTS "Admins can view all agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can view own agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can insert own agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Admins can update agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Admins can delete agendamentos" ON public.agendamentos;

CREATE POLICY "Admins can view all agendamentos" ON public.agendamentos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own agendamentos" ON public.agendamentos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agendamentos" ON public.agendamentos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update agendamentos" ON public.agendamentos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete agendamentos" ON public.agendamentos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix reservas_hotel policies
DROP POLICY IF EXISTS "Admins can view all reservas" ON public.reservas_hotel;
DROP POLICY IF EXISTS "Users can view own reservas" ON public.reservas_hotel;
DROP POLICY IF EXISTS "Users can insert own reservas" ON public.reservas_hotel;
DROP POLICY IF EXISTS "Admins can update reservas" ON public.reservas_hotel;
DROP POLICY IF EXISTS "Admins can delete reservas" ON public.reservas_hotel;

CREATE POLICY "Admins can view all reservas" ON public.reservas_hotel FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own reservas" ON public.reservas_hotel FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reservas" ON public.reservas_hotel FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update reservas" ON public.reservas_hotel FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reservas" ON public.reservas_hotel FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Reattach the handle_new_user trigger (it was missing)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
