const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();

    if (!barcode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Barcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Looking up barcode:', barcode);

    // Try Open Food Facts first (works for food and many other products)
    try {
      const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
        headers: { 'User-Agent': 'AquaterapiaPetShop/1.0' },
      });

      if (offRes.ok) {
        const offData = await offRes.json();
        if (offData.status === 1 && offData.product) {
          const p = offData.product;
          const result = {
            success: true,
            source: 'Open Food Facts',
            data: {
              name: p.product_name || p.product_name_pt || p.product_name_en || null,
              brand: p.brands || null,
              description: p.generic_name || p.generic_name_pt || null,
              image: p.image_front_url || p.image_url || null,
              category: p.categories_tags?.[0]?.replace('en:', '')?.replace('pt:', '') || null,
              barcode,
            },
          };
          console.log('Found product on Open Food Facts:', result.data.name);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    } catch (e) {
      console.log('Open Food Facts lookup failed:', e);
    }

    // Try Open EAN Database
    try {
      const eanRes = await fetch(`https://opengtindb.org/api/v0/search?ean=${barcode}&format=json`, {
        headers: { 'User-Agent': 'AquaterapiaPetShop/1.0' },
      });

      if (eanRes.ok) {
        const eanText = await eanRes.text();
        try {
          const eanData = JSON.parse(eanText);
          if (eanData && eanData.name) {
            const result = {
              success: true,
              source: 'Open EAN DB',
              data: {
                name: eanData.name || null,
                brand: eanData.brand || null,
                description: eanData.description || null,
                image: eanData.image || null,
                category: eanData.category || null,
                barcode,
              },
            };
            console.log('Found product on Open EAN DB:', result.data.name);
            return new Response(JSON.stringify(result), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch {
          // Not valid JSON, skip
        }
      }
    } catch (e) {
      console.log('Open EAN DB lookup failed:', e);
    }

    // Try UPC Item DB
    try {
      const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
        headers: { 'User-Agent': 'AquaterapiaPetShop/1.0' },
      });

      if (upcRes.ok) {
        const upcData = await upcRes.json();
        if (upcData.items && upcData.items.length > 0) {
          const item = upcData.items[0];
          const result = {
            success: true,
            source: 'UPC Item DB',
            data: {
              name: item.title || null,
              brand: item.brand || null,
              description: item.description || null,
              image: item.images?.[0] || null,
              category: item.category || null,
              barcode,
            },
          };
          console.log('Found product on UPC Item DB:', result.data.name);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    } catch (e) {
      console.log('UPC Item DB lookup failed:', e);
    }

    // Not found in any database
    console.log('Product not found in any database for barcode:', barcode);
    return new Response(
      JSON.stringify({ success: false, error: 'Produto não encontrado nas bases de dados públicas', barcode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in barcode lookup:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno ao buscar produto' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
