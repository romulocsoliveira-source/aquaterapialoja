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
  sales_channel: string | null;
  bank_account_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  bank_name: string | null;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
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

export function useBankAccounts() {
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data || []) as BankAccount[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tx: Omit<FinancialTransaction, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("financial_transactions").insert(tx as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-transactions"] }),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FinancialTransaction> & { id: string }) => {
      const { error } = await supabase.from("financial_transactions").update(data as any).eq("id", id);
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

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: Omit<BankAccount, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("bank_accounts").insert(account as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bank-accounts"] }),
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BankAccount> & { id: string }) => {
      const { error } = await supabase.from("bank_accounts").update(data as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bank-accounts"] }),
  });
}
