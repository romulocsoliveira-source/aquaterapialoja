import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useDeploymentPayment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["deployment-payment", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("deployment_payments" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user,
  });

  const createPayment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("deployment_payments" as any)
        .insert({ user_id: user.id, status: "pendente", amount: 300, pix_key: "18997348718" } as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deployment-payment"] }),
  });

  const markAsRequested = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("deployment_payments" as any)
        .update({ requested_at: new Date().toISOString() } as any)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deployment-payment"] }),
  });

  const isPaid = query.data?.status === "pago";
  const isPending = !query.data || query.data?.status === "pendente";
  const hasRequested = !!query.data?.requested_at;

  return { payment: query.data, isPaid, isPending, hasRequested, isLoading: query.isLoading, createPayment, markAsRequested };
}
