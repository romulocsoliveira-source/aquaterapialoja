const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ProductResult {
  name: string | null;
  brand: string | null;
  description: string | null;
  image: string | null;
  category: string | null;
  barcode: string;
}

async function tryOpenFoodFacts(barcode: string): Promise<ProductResult | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: { 'User-Agent': 'AquaterapiaPetShop/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const name = p.product_name_pt || p.product_name || p.product_name_en;
    if (!name) return null;
    return {
      name,
      brand: p.brands || null,
      description: p.generic_name_pt || p.generic_name || null,
      image: p.image_front_url || p.image_url || null,
      category: p.categories_tags?.[0]?.replace(/^(en|pt):/, '') || null,
      barcode,
    };
  } catch (e) {
    console.log('Open Food Facts failed:', e);
    return null;
  }
}

async function tryOpenBeautyFacts(barcode: string): Promise<ProductResult | null> {
  try {
    const res = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${barcode}.json`, {
      headers: { 'User-Agent': 'AquaterapiaPetShop/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const name = p.product_name_pt || p.product_name || p.product_name_en;
    if (!name) return null;
    return {
      name,
      brand: p.brands || null,
      description: p.generic_name_pt || p.generic_name || null,
      image: p.image_front_url || p.image_url || null,
      category: p.categories_tags?.[0]?.replace(/^(en|pt):/, '') || null,
      barcode,
    };
  } catch (e) {
    console.log('Open Beauty Facts failed:', e);
    return null;
  }
}

async function tryOpenPetFoodFacts(barcode: string): Promise<ProductResult | null> {
  try {
    const res = await fetch(`https://world.openpetfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: { 'User-Agent': 'AquaterapiaPetShop/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const name = p.product_name_pt || p.product_name || p.product_name_en;
    if (!name) return null;
    return {
      name,
      brand: p.brands || null,
      description: p.generic_name_pt || p.generic_name || null,
      image: p.image_front_url || p.image_url || null,
      category: p.categories_tags?.[0]?.replace(/^(en|pt):/, '') || null,
      barcode,
    };
  } catch (e) {
    console.log('Open Pet Food Facts failed:', e);
    return null;
  }
}

async function tryUPCitemDB(barcode: string): Promise<ProductResult | null> {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
      headers: { 'User-Agent': 'AquaterapiaPetShop/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;
    const item = data.items[0];
    if (!item.title) return null;
    return {
      name: item.title,
      brand: item.brand || null,
      description: item.description || null,
      image: item.images?.[0] || null,
      category: item.category || null,
      barcode,
    };
  } catch (e) {
    console.log('UPC Item DB failed:', e);
    return null;
  }
}

async function tryBarcodeLookupOrg(barcode: string): Promise<ProductResult | null> {
  try {
    // go-upc.com free tier
    const res = await fetch(`https://www.ean-search.org/perl/ean-search.pl?q=${barcode}&format=json`, {
      headers: { 'User-Agent': 'AquaterapiaPetShop/1.0' },
    });
    if (!res.ok) return null;
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0 && data[0]?.name) {
        return {
          name: data[0].name,
          brand: null,
          description: null,
          image: null,
          category: data[0].categoryName || null,
          barcode,
        };
      }
    } catch { /* not json */ }
    return null;
  } catch (e) {
    console.log('EAN Search failed:', e);
    return null;
  }
}

async function tryCosmosAPI(barcode: string): Promise<ProductResult | null> {
  try {
    // Cosmos is a Brazilian product database
    const res = await fetch(`https://api.cosmos.bluesoft.com.br/gtins/${barcode}`, {
      headers: {
        'User-Agent': 'AquaterapiaPetShop/1.0',
        'X-Cosmos-Token': 'n/a', // free tier returns some data
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.description) return null;
    return {
      name: data.description,
      brand: data.brand?.name || null,
      description: data.commercial_unit?.ballast_quantity ? `Quantidade: ${data.commercial_unit.ballast_quantity}` : null,
      image: data.thumbnail || null,
      category: data.ncm?.full_description || null,
      barcode,
    };
  } catch (e) {
    console.log('Cosmos API failed:', e);
    return null;
  }
}

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

    // Try multiple databases sequentially with fallback
    const sources: { name: string; fn: (b: string) => Promise<ProductResult | null> }[] = [
      { name: 'Open Food Facts', fn: tryOpenFoodFacts },
      { name: 'Open Pet Food Facts', fn: tryOpenPetFoodFacts },
      { name: 'Open Beauty Facts', fn: tryOpenBeautyFacts },
      { name: 'UPC Item DB', fn: tryUPCitemDB },
      { name: 'Cosmos (BR)', fn: tryCosmosAPI },
      { name: 'EAN Search', fn: tryBarcodeLookupOrg },
    ];

    for (const source of sources) {
      console.log(`Trying ${source.name}...`);
      const result = await source.fn(barcode);
      if (result) {
        console.log(`Found product on ${source.name}: ${result.name}`);
        return new Response(
          JSON.stringify({ success: true, source: source.name, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Also try parallel requests to maximize chances
    // (the sequential approach above may have failed due to timeouts, try batch)
    console.log('Sequential search exhausted, trying parallel batch...');
    const parallelResults = await Promise.allSettled([
      tryOpenFoodFacts(barcode),
      tryUPCitemDB(barcode),
      tryOpenPetFoodFacts(barcode),
    ]);

    for (const r of parallelResults) {
      if (r.status === 'fulfilled' && r.value) {
        console.log(`Found product in parallel batch: ${r.value.name}`);
        return new Response(
          JSON.stringify({ success: true, source: 'Parallel Batch', data: r.value }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

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
