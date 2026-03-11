
-- Categories table
CREATE TABLE public.store_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image text,
  parent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON public.store_categories
  FOR SELECT TO anon, authenticated USING (true);

-- Products table
CREATE TABLE public.store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price numeric NOT NULL,
  promo_price numeric,
  category text NOT NULL,
  category_slug text NOT NULL,
  parent_category text,
  image text,
  images text[] DEFAULT '{}',
  description text,
  benefits text[] DEFAULT '{}',
  specs text[] DEFAULT '{}',
  instructions text,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  badge text,
  variations text[] DEFAULT '{}',
  is_new boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  sku text NOT NULL UNIQUE,
  barcode text NOT NULL UNIQUE,
  stock integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  sales_channel text DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products" ON public.store_products
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_store_products_updated_at
  BEFORE UPDATE ON public.store_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
