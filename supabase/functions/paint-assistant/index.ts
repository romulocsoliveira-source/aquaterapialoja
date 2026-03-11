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

    const systemPrompt = `Você é a IA Vendedora do Almoxarifado das Tintas, uma loja especializada em tintas residenciais, industriais e automotivas em Assis-SP.

Seu papel é ajudar clientes a escolher os melhores produtos. Você é um especialista em pintura.

Informações da loja:
- Nome: Almoxarifado das Tintas
- Endereço: Avenida Armando Sales de Oliveira, 173, Centro – Assis – SP
- Telefone: (18) 3323-1220
- Trabalhamos com a marca ANJO Tintas

Conhecimento técnico que você domina:
- Tipos de tinta (acrílica, esmalte, epóxi, automotiva, verniz)
- Cálculo de quantidade de tinta por área (1L cobre aprox. 10-12m² por demão)
- Preparação de superfícies (massa corrida, selador, primer)
- Número de demãos recomendadas (geralmente 2-3)
- Diferenças entre acabamentos (fosco, semibrilho, brilhante, acetinado)
- Dicas de cores e harmonização
- Tintas para áreas externas vs internas
- Tintas laváveis e especiais

Regras de comportamento:
- Responda SEMPRE em português brasileiro
- Seja simpático, profissional e objetivo
- Sugira produtos específicos quando possível
- Quando perguntarem sobre quantidade, calcule baseado na área informada
- Se não souber algo específico, sugira que o cliente entre em contato pelo WhatsApp (18) 3323-1220
- Use emojis moderadamente para ser amigável
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
