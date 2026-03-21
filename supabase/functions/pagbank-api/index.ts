import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGBANK_SANDBOX_URL = "https://sandbox.api.pagseguro.com";
const PAGBANK_PROD_URL = "https://api.pagseguro.com";

async function getPaymentSettings(supabaseAdmin: any) {
  const { data, error } = await supabaseAdmin
    .from("payment_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Erro ao buscar configurações: " + error.message);
  return data;
}

function getBaseUrl(settings: any) {
  return settings.environment === "production" ? PAGBANK_PROD_URL : PAGBANK_SANDBOX_URL;
}

function getToken(settings: any) {
  return settings.environment === "production" ? settings.production_token : settings.sandbox_token;
}

async function logGateway(supabaseAdmin: any, action: string, request_data: any, response_data: any, status_code: number, success: boolean, error_message?: string, user_id?: string) {
  await supabaseAdmin.from("payment_gateway_logs").insert({
    action,
    request_data,
    response_data,
    status_code,
    success,
    error_message: error_message || null,
    user_id: user_id || null,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.user.id;

    // Admin client for DB operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check admin role
    const { data: roleData } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();

    const body = await req.json();
    const { action } = body;

    // Actions that require admin
    const adminActions = ["test-connection", "save-settings", "get-settings", "get-logs"];
    if (adminActions.includes(action) && !roleData) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get-settings") {
      const settings = await getPaymentSettings(supabaseAdmin);
      // Never return tokens to frontend - mask them
      if (settings) {
        settings.sandbox_token = settings.sandbox_token ? "••••" + settings.sandbox_token.slice(-4) : null;
        settings.production_token = settings.production_token ? "••••" + settings.production_token.slice(-4) : null;
      }
      return new Response(JSON.stringify({ settings }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "save-settings") {
      const { settings: newSettings } = body;
      const existing = await getPaymentSettings(supabaseAdmin);

      const payload: any = {
        environment: newSettings.environment || "sandbox",
        is_active: newSettings.is_active ?? false,
        webhook_url: newSettings.webhook_url || null,
        public_key: newSettings.public_key || null,
        account_reference: newSettings.account_reference || null,
        pix_enabled: newSettings.pix_enabled ?? true,
        pix_expiration_minutes: newSettings.pix_expiration_minutes || 30,
        pix_instructions: newSettings.pix_instructions || null,
        credit_card_enabled: newSettings.credit_card_enabled ?? false,
        max_installments: newSettings.max_installments || 12,
        min_installment_value: newSettings.min_installment_value || 10,
        interest_on_store: newSettings.interest_on_store ?? true,
        require_cardholder_name: newSettings.require_cardholder_name ?? true,
        require_buyer_cpf: newSettings.require_buyer_cpf ?? true,
        boleto_enabled: newSettings.boleto_enabled ?? false,
        boleto_due_days: newSettings.boleto_due_days || 3,
        boleto_instructions: newSettings.boleto_instructions || null,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };

      // Only update tokens if provided (not masked)
      if (newSettings.sandbox_token && !newSettings.sandbox_token.startsWith("••••")) {
        payload.sandbox_token = newSettings.sandbox_token;
      }
      if (newSettings.production_token && !newSettings.production_token.startsWith("••••")) {
        payload.production_token = newSettings.production_token;
      }

      let result;
      if (existing) {
        result = await supabaseAdmin.from("payment_settings").update(payload).eq("id", existing.id);
      } else {
        result = await supabaseAdmin.from("payment_settings").insert(payload);
      }

      if (result.error) throw new Error(result.error.message);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "test-connection") {
      const settings = await getPaymentSettings(supabaseAdmin);
      if (!settings) {
        return new Response(JSON.stringify({ error: "Configurações não encontradas. Salve as credenciais primeiro." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const apiToken = getToken(settings);
      if (!apiToken) {
        return new Response(JSON.stringify({ error: `Token ${settings.environment} não configurado.` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const baseUrl = getBaseUrl(settings);
      const testUrl = `${baseUrl}/public-keys`;

      try {
        const resp = await fetch(testUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "card" }),
        });

        const respData = await resp.json();
        const success = resp.ok;

        await logGateway(supabaseAdmin, "test-connection", { url: testUrl, environment: settings.environment }, respData, resp.status, success, success ? undefined : JSON.stringify(respData), userId);

        // Update last test
        await supabaseAdmin.from("payment_settings").update({
          last_test_at: new Date().toISOString(),
          last_test_status: success ? "success" : "error",
        }).eq("id", settings.id);

        if (success) {
          return new Response(JSON.stringify({ success: true, message: "Conexão com PagBank estabelecida com sucesso!", environment: settings.environment, public_key: respData.public_key }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } else {
          return new Response(JSON.stringify({ success: false, message: "Falha na conexão: " + (respData.error_messages?.[0]?.description || JSON.stringify(respData)) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (e: any) {
        await logGateway(supabaseAdmin, "test-connection", { url: testUrl }, { error: e.message }, 0, false, e.message, userId);
        return new Response(JSON.stringify({ success: false, message: "Erro de rede: " + e.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (action === "create-pix") {
      const settings = await getPaymentSettings(supabaseAdmin);
      if (!settings?.is_active || !settings.pix_enabled) {
        return new Response(JSON.stringify({ error: "PIX não está habilitado" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const apiToken = getToken(settings);
      const baseUrl = getBaseUrl(settings);
      const { order_id, amount, customer } = body;

      const pixPayload = {
        reference_id: order_id,
        customer: {
          name: customer.name,
          email: customer.email,
          tax_id: customer.cpf?.replace(/\D/g, "") || undefined,
        },
        qr_codes: [{
          amount: { value: Math.round(amount * 100) },
          expiration_date: new Date(Date.now() + settings.pix_expiration_minutes * 60 * 1000).toISOString(),
        }],
        notification_urls: settings.webhook_url ? [settings.webhook_url] : [],
      };

      const resp = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pixPayload),
      });

      const respData = await resp.json();
      await logGateway(supabaseAdmin, "create-pix", pixPayload, respData, resp.status, resp.ok, resp.ok ? undefined : JSON.stringify(respData), userId);

      if (resp.ok) {
        const qrCode = respData.qr_codes?.[0];
        // Update order with gateway info
        await supabaseAdmin.from("orders").update({
          gateway_transaction_id: respData.id,
          gateway_status: "WAITING",
          status: "awaiting_payment",
        }).eq("id", order_id);

        return new Response(JSON.stringify({
          success: true,
          transaction_id: respData.id,
          qr_code: qrCode?.links?.find((l: any) => l.media === "image/png")?.href,
          qr_code_text: qrCode?.text,
          expiration: qrCode?.expiration_date,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        return new Response(JSON.stringify({ error: "Erro ao gerar PIX: " + (respData.error_messages?.[0]?.description || "Erro desconhecido") }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (action === "create-boleto") {
      const settings = await getPaymentSettings(supabaseAdmin);
      if (!settings?.is_active || !settings.boleto_enabled) {
        return new Response(JSON.stringify({ error: "Boleto não está habilitado" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const apiToken = getToken(settings);
      const baseUrl = getBaseUrl(settings);
      const { order_id, amount, customer } = body;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (settings.boleto_due_days || 3));

      const boletoPayload = {
        reference_id: order_id,
        customer: {
          name: customer.name,
          email: customer.email,
          tax_id: customer.cpf?.replace(/\D/g, ""),
        },
        charges: [{
          reference_id: order_id,
          description: settings.boleto_instructions || "Pagamento do pedido",
          amount: { value: Math.round(amount * 100), currency: "BRL" },
          payment_method: {
            type: "BOLETO",
            boleto: {
              due_date: dueDate.toISOString().split("T")[0],
              instruction_lines: {
                line_1: settings.boleto_instructions || "Pagamento referente ao pedido",
                line_2: `Vencimento: ${dueDate.toLocaleDateString("pt-BR")}`,
              },
              holder: {
                name: customer.name,
                tax_id: customer.cpf?.replace(/\D/g, ""),
                email: customer.email,
              },
            },
          },
        }],
        notification_urls: settings.webhook_url ? [settings.webhook_url] : [],
      };

      const resp = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(boletoPayload),
      });

      const respData = await resp.json();
      await logGateway(supabaseAdmin, "create-boleto", boletoPayload, respData, resp.status, resp.ok, resp.ok ? undefined : JSON.stringify(respData), userId);

      if (resp.ok) {
        const charge = respData.charges?.[0];
        await supabaseAdmin.from("orders").update({
          gateway_transaction_id: respData.id,
          gateway_status: "WAITING",
          status: "awaiting_payment",
        }).eq("id", order_id);

        return new Response(JSON.stringify({
          success: true,
          transaction_id: respData.id,
          barcode: charge?.payment_method?.boleto?.barcode,
          formatted_barcode: charge?.payment_method?.boleto?.formatted_barcode,
          due_date: charge?.payment_method?.boleto?.due_date,
          pdf_link: charge?.links?.find((l: any) => l.media === "application/pdf")?.href,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        return new Response(JSON.stringify({ error: "Erro ao gerar boleto: " + (respData.error_messages?.[0]?.description || "Erro desconhecido") }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (action === "create-card") {
      const settings = await getPaymentSettings(supabaseAdmin);
      if (!settings?.is_active || !settings.credit_card_enabled) {
        return new Response(JSON.stringify({ error: "Cartão de crédito não está habilitado" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const apiToken = getToken(settings);
      const baseUrl = getBaseUrl(settings);
      const { order_id, amount, customer, card_token, installments } = body;

      const maxInstallments = settings.max_installments || 12;
      const requestedInstallments = Math.min(installments || 1, maxInstallments);
      const minValue = settings.min_installment_value || 10;
      if (amount / requestedInstallments < minValue && requestedInstallments > 1) {
        return new Response(JSON.stringify({ error: `Parcela mínima de R$ ${minValue.toFixed(2)}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const cardPayload = {
        reference_id: order_id,
        customer: {
          name: customer.name,
          email: customer.email,
          tax_id: customer.cpf?.replace(/\D/g, ""),
        },
        charges: [{
          reference_id: order_id,
          description: "Pagamento do pedido",
          amount: { value: Math.round(amount * 100), currency: "BRL" },
          payment_method: {
            type: "CREDIT_CARD",
            installments: requestedInstallments,
            capture: true,
            card: {
              encrypted: card_token,
            },
            soft_descriptor: "AQUATERAPIA",
          },
        }],
        notification_urls: settings.webhook_url ? [settings.webhook_url] : [],
      };

      const resp = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardPayload),
      });

      const respData = await resp.json();
      await logGateway(supabaseAdmin, "create-card", { ...cardPayload, charges: [{ ...cardPayload.charges[0], payment_method: { ...cardPayload.charges[0].payment_method, card: { encrypted: "[REDACTED]" } } }] }, respData, resp.status, resp.ok, resp.ok ? undefined : JSON.stringify(respData), userId);

      if (resp.ok) {
        const charge = respData.charges?.[0];
        const chargeStatus = charge?.status;
        let orderStatus = "awaiting_payment";
        if (chargeStatus === "PAID") orderStatus = "paid";
        else if (chargeStatus === "AUTHORIZED") orderStatus = "paid";
        else if (chargeStatus === "IN_ANALYSIS") orderStatus = "under_review";

        await supabaseAdmin.from("orders").update({
          gateway_transaction_id: respData.id,
          gateway_status: chargeStatus,
          gateway_paid_at: chargeStatus === "PAID" ? new Date().toISOString() : null,
          status: orderStatus,
        }).eq("id", order_id);

        return new Response(JSON.stringify({
          success: true,
          transaction_id: respData.id,
          charge_status: chargeStatus,
          order_status: orderStatus,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        return new Response(JSON.stringify({ error: "Erro no pagamento: " + (respData.error_messages?.[0]?.description || "Erro desconhecido") }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (action === "get-logs") {
      const { data: webhookLogs } = await supabaseAdmin
        .from("payment_webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: gatewayLogs } = await supabaseAdmin
        .from("payment_gateway_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      return new Response(JSON.stringify({ webhookLogs: webhookLogs || [], gatewayLogs: gatewayLogs || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida: " + action }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("PagBank API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Erro interno" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
