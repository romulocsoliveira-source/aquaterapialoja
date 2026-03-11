import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é o Assistente Pet da Aquaterapia, um pet shop e loja de aquarismo em Assis-SP.

Seu papel é ajudar clientes a encontrar os melhores produtos e serviços para seus pets e aquários.

Informações da loja:
- Nome: Aquaterapia Pet Shop
- Endereço: Avenida Getúlio Vargas, 339, Vila Nova Santana – Assis – SP
- Telefone/WhatsApp: (18) 99657-0512
- Especialidades: Pet Shop, Aquarismo, Banho & Tosa, Hotel Pet

Conhecimento que você domina:
- Produtos pet: rações, brinquedos, acessórios, shampoos, petiscos
- Aquarismo: aquários, peixes ornamentais, filtros, bombas, iluminação LED, substratos, plantas aquáticas, decoração, condicionadores de água
- Serviços de Banho & Tosa: banho completo, banho medicinal, tosa higiênica, tosa completa, hidratação de pelagem
- Hotel Pet: hospedagem com acomodações Standard, VIP e Suíte Premium
- Cuidados com cães, gatos e peixes
- Montagem e manutenção de aquários
- Nutrição animal
- Dicas de bem-estar pet

Regras de comportamento:
- Responda SEMPRE em português brasileiro
- Seja simpático, profissional e objetivo
- Sugira produtos e serviços específicos quando possível
- Se não souber algo específico, sugira que o cliente entre em contato pelo WhatsApp (18) 99657-0512
- Use emojis moderadamente para ser amigável 🐾🐟
- Mantenha respostas concisas (máximo 3-4 parágrafos)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações, tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato pelo WhatsApp." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao conectar com o assistente." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
