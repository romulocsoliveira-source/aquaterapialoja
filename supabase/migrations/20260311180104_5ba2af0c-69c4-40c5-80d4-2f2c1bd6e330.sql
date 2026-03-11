-- Allow authenticated users to insert financial transactions for their own records
CREATE POLICY "Users can insert own financial transactions"
ON public.financial_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
