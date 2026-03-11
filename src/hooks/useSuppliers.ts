import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Purchase {
  id: string;
  supplier_id: string | null;
  supplier_name: string;
  total: number;
  status: "pending" | "received" | "cancelled";
  notes: string | null;
  purchased_at: string;
  received_at: string | null;
  created_by: string;
  created_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_cost: number;
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      return (data || []) as Supplier[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: Omit<Supplier, "id" | "created_at">) => {
      const { error } = await supabase.from("suppliers").insert(s);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Supplier> & { id: string }) => {
      const { error } = await supabase.from("suppliers").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("purchases").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Purchase[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<Purchase, "id" | "created_at">) => {
      const { data, error } = await supabase.from("purchases").insert(p).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchases"] }),
  });
}

export function useCreatePurchaseItems() {
  return useMutation({
    mutationFn: async (items: Omit<PurchaseItem, "id">[]) => {
      const { error } = await supabase.from("purchase_items").insert(items);
      if (error) throw error;
    },
  });
}

export function useReceivePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (purchaseId: string) => {
      // Get purchase items
      const { data: items, error: itemsErr } = await supabase
        .from("purchase_items")
        .select("*")
        .eq("purchase_id", purchaseId);
      if (itemsErr) throw itemsErr;

      // Update stock for each product
      for (const item of (items || []) as PurchaseItem[]) {
        if (item.product_id) {
          const { data: product } = await supabase
            .from("store_products")
            .select("stock, cost_price")
            .eq("id", item.product_id)
            .single();
          if (product) {
            await supabase.from("store_products").update({
              stock: (product.stock || 0) + item.quantity,
              cost_price: item.unit_cost,
            }).eq("id", item.product_id);
          }
        }
      }

      // Mark purchase as received
      const { error } = await supabase.from("purchases").update({
        status: "received",
        received_at: new Date().toISOString(),
      }).eq("id", purchaseId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["store-products"] });
    },
  });
}
