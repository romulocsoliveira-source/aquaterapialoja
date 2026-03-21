import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentSettings {
  environment: string;
  is_active: boolean;
  pix_enabled: boolean;
  pix_expiration_minutes: number;
  pix_instructions: string | null;
  credit_card_enabled: boolean;
  max_installments: number;
  min_installment_value: number;
  interest_on_store: boolean;
  boleto_enabled: boolean;
  boleto_due_days: number;
  boleto_instructions: string | null;
  require_buyer_cpf: boolean;
  require_cardholder_name: boolean;
}

async function fetchPaymentSettings(): Promise<PaymentSettings | null> {
  const { data, error } = await supabase
    .from("payment_settings")
    .select("environment, is_active, pix_enabled, pix_expiration_minutes, pix_instructions, credit_card_enabled, max_installments, min_installment_value, interest_on_store, boleto_enabled, boleto_due_days, boleto_instructions, require_buyer_cpf, require_cardholder_name")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching payment settings:", error);
    return null;
  }
  return data as PaymentSettings | null;
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ["payment-settings-public"],
    queryFn: fetchPaymentSettings,
    staleTime: 1000 * 60 * 2,
  });
}

export function getEnabledMethods(settings: PaymentSettings | null | undefined) {
  if (!settings?.is_active) return [];
  const methods: { id: string; label: string; desc: string }[] = [];
  if (settings.pix_enabled) methods.push({ id: "pix", label: "PIX", desc: settings.pix_instructions || "Pagamento instantâneo" });
  if (settings.credit_card_enabled) methods.push({ id: "credit_card", label: "Cartão de Crédito", desc: `Até ${settings.max_installments}x` });
  if (settings.boleto_enabled) methods.push({ id: "boleto", label: "Boleto Bancário", desc: `Vencimento em ${settings.boleto_due_days} dias úteis` });
  return methods;
}
