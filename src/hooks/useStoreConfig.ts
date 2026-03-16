import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreConfig {
  id: string;
  company_name: string | null;
  trade_name: string | null;
  cnpj: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  logo_url: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  tax_regime: string | null;
  issues_invoice: boolean | null;
  invoice_type: string | null;
  certificate_url: string | null;
  certificate_password: string | null;
  auto_stock_control: boolean | null;
  min_stock_default: number | null;
  payment_methods: string[] | null;
  has_delivery: boolean | null;
  delivery_fee: number | null;
  delivery_radius: number | null;
  delivery_neighborhoods: string[] | null;
  has_mercadolivre: boolean | null;
  ml_email: string | null;
  ml_login: string | null;
  ml_store_name: string | null;
  product_import_method: string | null;
  setup_completed: boolean | null;
  current_step: number | null;
  completed_steps: number[] | null;
}

async function fetchStoreConfig(): Promise<StoreConfig | null> {
  const { data, error } = await supabase
    .from("store_config")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching store config:", error);
    return null;
  }
  return data as StoreConfig | null;
}

export function useStoreConfig() {
  return useQuery({
    queryKey: ["store-config"],
    queryFn: fetchStoreConfig,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}

// Helper to get full address string
export function getStoreAddress(config: StoreConfig | null | undefined): string {
  if (!config) return "";
  const parts = [
    config.street,
    config.number ? `, ${config.number}` : "",
    config.complement ? ` - ${config.complement}` : "",
    config.neighborhood ? ` · ${config.neighborhood}` : "",
    config.city && config.state ? ` - ${config.city}/${config.state}` : "",
    config.zip_code ? ` · CEP ${config.zip_code}` : "",
  ];
  return parts.join("");
}

// Map stored payment method names to system IDs
const PAYMENT_MAP: Record<string, string> = {
  "Dinheiro": "dinheiro",
  "PIX": "pix",
  "Cartão débito": "debit_card",
  "Cartão crédito": "credit_card",
  "Boleto": "boleto",
  "Outros": "outros",
};

export function getPaymentMethodIds(config: StoreConfig | null | undefined): string[] {
  if (!config?.payment_methods?.length) return ["pix", "credit_card", "debit_card", "dinheiro"];
  return config.payment_methods.map(m => PAYMENT_MAP[m] || m.toLowerCase());
}
