import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const USER_AGENT = "AquaterapiaPetShop/1.0";
const PRODUCT_IMAGE_BUCKET = "product-images";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const adminClient = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

interface ProductResult {
  name: string | null;
  brand: string | null;
  description: string | null;
  image: string | null;
  category: string | null;
  barcode: string;
  sourceUrl?: string | null;
}

function normalizeBarcode(value: string) {
  return value.replace(/\D/g, "");
}

function getBarcodeVariants(barcode: string) {
  const normalized = normalizeBarcode(barcode);
  const variants = new Set<string>([normalized]);

  if (normalized.length <= 14) {
    [8, 12, 13, 14].forEach((length) => {
      if (normalized.length <= length) variants.add(normalized.padStart(length, "0"));
    });
  }

  if (normalized.startsWith("0")) {
    variants.add(normalized.replace(/^0+/, ""));
  }

  return [...variants].filter((variant) => variant.length >= 8 && variant.length <= 14);
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        ...(init?.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractMetaTag(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return null;
}

function stripHtml(value: string | null) {
  if (!value) return null;
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || null;
}

function cleanProductName(value: string | null, barcode: string) {
  if (!value) return null;

  return value
    .replace(new RegExp(barcode, "g"), "")
    .replace(/\s+[\-|–|—|·|•]\s+.+$/, "")
    .replace(/^(comprar|preço|oferta|produto)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim() || null;
}

function inferBrand(name: string | null, description: string | null) {
  const text = `${name || ""} ${description || ""}`.trim();
  if (!text) return null;

  const match = text.match(/marca[:\s-]+([^,|\-]+)/i);
  if (match?.[1]) return match[1].trim();

  const firstWord = text.split(/\s+/)[0];
  return firstWord && firstWord.length > 2 ? firstWord : null;
}

async function uploadImageToStorage(imageUrl: string, barcode: string) {
  if (!adminClient) return imageUrl;

  try {
    const response = await fetchWithTimeout(imageUrl, undefined, 7000);
    if (!response.ok) return imageUrl;

    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) return imageUrl;

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength === 0) return imageUrl;

    const extension = (contentType.split("/")[1] || "jpg").split(";")[0].replace("jpeg", "jpg");
    const path = `products/barcode-${barcode}-${Date.now()}.${extension}`;

    const { error } = await adminClient.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, bytes, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.log("Storage upload failed, keeping external image:", error.message);
      return imageUrl;
    }

    const { data } = adminClient.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl || imageUrl;
  } catch (error) {
    console.log("Image upload skipped:", error);
    return imageUrl;
  }
}

function mapOpenFactProduct(product: any, barcode: string): ProductResult | null {
  const name = product.product_name_pt || product.product_name || product.product_name_en;
  if (!name) return null;

  return {
    name,
    brand: product.brands || null,
    description: product.generic_name_pt || product.generic_name || null,
    image: product.image_front_url || product.image_url || null,
    category: product.categories_tags?.[0]?.replace(/^(en|pt):/, "") || null,
    barcode,
    sourceUrl: product.url || null,
  };
}

async function lookupOpenFacts(host: string, barcode: string): Promise<ProductResult | null> {
  try {
    const response = await fetchWithTimeout(`https://${host}/api/v2/product/${barcode}.json`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 1 || !data.product) return null;
    return mapOpenFactProduct(data.product, barcode);
  } catch (error) {
    console.log(`${host} lookup failed:`, error);
    return null;
  }
}

async function tryUPCitemDB(barcode: string): Promise<ProductResult | null> {
  try {
    const response = await fetchWithTimeout(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
    if (!response.ok) return null;
    const data = await response.json();
    const item = data.items?.[0];
    if (!item?.title) return null;

    return {
      name: item.title,
      brand: item.brand || null,
      description: item.description || null,
      image: item.images?.[0] || null,
      category: item.category || null,
      barcode,
      sourceUrl: item.offers?.[0]?.link || null,
    };
  } catch (error) {
    console.log("UPC Item DB failed:", error);
    return null;
  }
}

async function tryEANSearch(barcode: string): Promise<ProductResult | null> {
  try {
    const response = await fetchWithTimeout(`https://www.ean-search.org/perl/ean-search.pl?q=${barcode}&format=json`);
    if (!response.ok) return null;
    const text = await response.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data) || !data[0]?.name) return null;

    return {
      name: data[0].name,
      brand: null,
      description: null,
      image: null,
      category: data[0].categoryName || null,
      barcode,
      sourceUrl: null,
    };
  } catch (error) {
    console.log("EAN Search failed:", error);
    return null;
  }
}

async function tryCosmosAPI(barcode: string): Promise<ProductResult | null> {
  try {
    const response = await fetchWithTimeout(`https://api.cosmos.bluesoft.com.br/gtins/${barcode}`, {
      headers: {
        "X-Cosmos-Token": "n/a",
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (!data.description) return null;

    return {
      name: data.description,
      brand: data.brand?.name || null,
      description: data.commercial_unit?.type_packaging || data.ncm?.description || null,
      image: data.thumbnail || null,
      category: data.ncm?.full_description || null,
      barcode,
      sourceUrl: null,
    };
  } catch (error) {
    console.log("Cosmos API failed:", error);
    return null;
  }
}

async function fetchPageMetadata(url: string, barcode: string): Promise<ProductResult | null> {
  try {
    const response = await fetchWithTimeout(url, undefined, 6000);
    if (!response.ok) return null;

    const html = await response.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = stripHtml(titleMatch?.[1] || null);
    const description = stripHtml(extractMetaTag(html, "description") || extractMetaTag(html, "og:description"));
    const image = extractMetaTag(html, "og:image") || extractMetaTag(html, "twitter:image");
    const name = cleanProductName(extractMetaTag(html, "og:title") || title, barcode);

    if (!name && !description && !image) return null;

    return {
      name: name || cleanProductName(title, barcode),
      brand: inferBrand(name || title, description),
      description,
      image,
      category: null,
      barcode,
      sourceUrl: url,
    };
  } catch (error) {
    console.log("Metadata fetch failed:", error);
    return null;
  }
}

async function tryWebSearch(barcode: string): Promise<ProductResult | null> {
  try {
    const query = encodeURIComponent(`"${barcode}" produto`);
    const response = await fetchWithTimeout(`https://html.duckduckgo.com/html/?q=${query}`, undefined, 7000);
    if (!response.ok) return null;

    const html = await response.text();
    const matches = [...html.matchAll(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi)].slice(0, 5);
    if (matches.length === 0) return null;

    for (const [, rawHref, rawTitle] of matches) {
      const href = rawHref.includes("uddg=")
        ? decodeURIComponent(rawHref.split("uddg=")[1].split("&")[0])
        : rawHref;
      const fallbackTitle = stripHtml(rawTitle);
      const metadata = await fetchPageMetadata(href, barcode);
      const name = metadata?.name || cleanProductName(fallbackTitle, barcode);

      if (name || metadata?.image || metadata?.description) {
        return {
          name,
          brand: metadata?.brand || inferBrand(name, metadata?.description || fallbackTitle),
          description: metadata?.description || fallbackTitle || null,
          image: metadata?.image || null,
          category: metadata?.category || null,
          barcode,
          sourceUrl: metadata?.sourceUrl || href,
        };
      }
    }

    return null;
  } catch (error) {
    console.log("Web search failed:", error);
    return null;
  }
}

async function runLookupAcrossVariants(
  barcode: string,
  sourceName: string,
  lookup: (variant: string) => Promise<ProductResult | null>,
): Promise<{ source: string; data: ProductResult } | null> {
  for (const variant of getBarcodeVariants(barcode)) {
    console.log(`Trying ${sourceName} with variant ${variant}...`);
    const result = await lookup(variant);
    if (result) {
      return {
        source: variant === barcode ? sourceName : `${sourceName} (${variant})`,
        data: { ...result, barcode },
      };
    }
  }

  return null;
}

async function enrichResult(result: ProductResult): Promise<ProductResult> {
  const uploadedImage = result.image ? await uploadImageToStorage(result.image, result.barcode) : null;
  return {
    ...result,
    image: uploadedImage || result.image,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();
    const normalizedBarcode = normalizeBarcode(barcode || "");

    if (!normalizedBarcode || normalizedBarcode.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: "Barcode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Looking up barcode:", normalizedBarcode);

    const lookups: Array<{ name: string; fn: (barcode: string) => Promise<ProductResult | null> }> = [
      { name: "Open Food Facts", fn: (code) => lookupOpenFacts("world.openfoodfacts.org", code) },
      { name: "Open Pet Food Facts", fn: (code) => lookupOpenFacts("world.openpetfoodfacts.org", code) },
      { name: "Open Beauty Facts", fn: (code) => lookupOpenFacts("world.openbeautyfacts.org", code) },
      { name: "UPC Item DB", fn: tryUPCitemDB },
      { name: "Cosmos (BR)", fn: tryCosmosAPI },
      { name: "EAN Search", fn: tryEANSearch },
      { name: "Busca Web", fn: tryWebSearch },
    ];

    for (const source of lookups) {
      const found = await runLookupAcrossVariants(normalizedBarcode, source.name, source.fn);
      if (found) {
        const enriched = await enrichResult(found.data);
        console.log(`Found product on ${found.source}: ${enriched.name}`);

        return new Response(
          JSON.stringify({ success: true, source: found.source, data: enriched }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    console.log("Product not found in any database for barcode:", normalizedBarcode);
    return new Response(
      JSON.stringify({ success: false, error: "Produto não encontrado nas bases públicas", barcode: normalizedBarcode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in barcode lookup:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno ao buscar produto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
