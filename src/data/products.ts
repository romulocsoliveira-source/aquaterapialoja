export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice?: number;
  category: string;
  categorySlug: string;
  parentCategory?: string;
  image: string;
  images: string[];
  description: string;
  benefits?: string[];
  specs?: string[];
  instructions?: string;
  rating: number;
  reviews: number;
  badge?: string;
  variations?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  sku: string;
  barcode: string;
  stock: number;
  costPrice?: number;
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  count: number;
  parent?: string;
}

export const categories: Category[] = [
  { name: "Tintas Residenciais", slug: "tintas-residenciais", image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=500&fit=crop", count: 0, parent: "Tintas" },
  { name: "Tintas Industriais", slug: "tintas-industriais", image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&h=500&fit=crop", count: 0, parent: "Tintas" },
  { name: "Tintas Automotivas", slug: "tintas-automotivas", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=500&fit=crop", count: 0, parent: "Tintas" },
  { name: "Esmaltes", slug: "esmaltes", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=500&fit=crop", count: 0, parent: "Tintas" },
  { name: "Vernizes", slug: "vernizes", image: "https://images.unsplash.com/photo-1558882224-dda166ffe594?w=400&h=500&fit=crop", count: 0, parent: "Acabamentos" },
  { name: "Complementos", slug: "complementos", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=500&fit=crop", count: 0, parent: "Acabamentos" },
  { name: "Acessórios de Pintura", slug: "acessorios-pintura", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=500&fit=crop", count: 0 },
  { name: "Promoções", slug: "promocoes", image: "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=400&h=500&fit=crop", count: 0 },
  { name: "Lançamentos", slug: "lancamentos", image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=500&fit=crop", count: 0 },
];

// Products are loaded from the database via useStoreData hook
export const products: Product[] = [];
