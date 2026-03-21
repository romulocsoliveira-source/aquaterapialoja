import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload = await req.json();

    // Log the webhook
    const logEntry: any = {
      event_type: payload.notificationType || payload.event || "unknown",
      payload,
      transaction_id: payload.id || payload.charges?.[0]?.id || null,
      status: payload.charges?.[0]?.status || payload.status || null,
      processed: false,
    };

    // Try to find associated order
    const referenceId = payload.reference_id;
    if (referenceId) {
      const { data: order } = await supabaseAdmin.from("orders").select("id").eq("id", referenceId).maybeSingle();
      if (order) logEntry.order_id = order.id;
    }

    // Also try to match by gateway_transaction_id
    if (payload.id) {
      const { data: order } = await supabaseAdmin.from("orders").select("id").eq("gateway_transaction_id", payload.id).maybeSingle();
      if (order) logEntry.order_id = order.id;
    }

    await supabaseAdmin.from("payment_webhook_logs").insert(logEntry);

    // Process charge status updates
    const charges = payload.charges || [];
    for (const charge of charges) {
      const chargeStatus = charge.status;
      const orderId = logEntry.order_id || charge.reference_id;
      if (!orderId) continue;

      let orderStatus = "awaiting_payment";
      switch (chargeStatus) {
        case "PAID": orderStatus = "paid"; break;
        case "AUTHORIZED": orderStatus = "paid"; break;
        case "IN_ANALYSIS": orderStatus = "under_review"; break;
        case "DECLINED": orderStatus = "failed"; break;
        case "CANCELED": orderStatus = "canceled"; break;
        case "REFUNDED": orderStatus = "refunded"; break;
        default: orderStatus = "awaiting_payment";
      }

      const updateData: any = {
        gateway_status: chargeStatus,
        status: orderStatus,
      };
      if (chargeStatus === "PAID") {
        updateData.gateway_paid_at = new Date().toISOString();
      }

      await supabaseAdmin.from("orders").update(updateData).eq("id", orderId);

      // Mark log as processed
      if (logEntry.order_id) {
        await supabaseAdmin.from("payment_webhook_logs").update({ processed: true }).eq("transaction_id", logEntry.transaction_id).eq("order_id", logEntry.order_id);
      }
    }

    // Process QR code (PIX) status updates
    if (payload.qr_codes) {
      for (const qr of payload.qr_codes) {
        if (qr.status === "PAID" && logEntry.order_id) {
          await supabaseAdmin.from("orders").update({
            gateway_status: "PAID",
            status: "paid",
            gateway_paid_at: new Date().toISOString(),
          }).eq("id", logEntry.order_id);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Webhook error:", error);
    // Log error but still return 200 to avoid PagBank retries for malformed data
    await supabaseAdmin.from("payment_webhook_logs").insert({
      event_type: "error",
      payload: { error: error.message },
      status: "error",
      error_message: error.message,
      processed: false,
    });
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
