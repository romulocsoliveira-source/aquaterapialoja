import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FinancialTransaction {
  id: string;
  type: "income" | "expense" | "payable" | "receivable";
  category: string;
  description: string;
  amount: number;
  due_date: string | null;
  paid_date: string | null;
  is_paid: boolean;
  payment_method: string | null;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useFinancialTransactions() {
  return useQuery({
    queryKey: ["financial-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FinancialTransaction[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tx: Omit<FinancialTransaction, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("financial_transactions").insert(tx);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-transactions"] }),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FinancialTransaction> & { id: string }) => {
      const { error } = await supabase.from("financial_transactions").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-transactions"] }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-transactions"] }),
  });
}
