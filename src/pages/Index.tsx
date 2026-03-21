import { Helmet } from "react-helmet-async";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import HeroSection from "@/components/store/HeroSection";
import CategoriesSection from "@/components/store/CategoriesSection";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import PromoBar from "@/components/store/PromoBar";
import BrandSection from "@/components/store/BrandSection";

const Index = () => {
  const { data: storeConfig } = useStoreConfig();
  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";

  return (
    <>
      <Helmet>
        <title>{storeName} | Loja Online Premium</title>
        <meta name="description" content={`${storeName} — Produtos premium para pets. Compre online com entrega rápida e pagamento seguro.`} />
        <link rel="canonical" href="https://aquaterapia.com.br" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          "name": storeName,
          "description": `${storeName} — Produtos premium para pets.`,
          "address": storeConfig?.street ? {
            "@type": "PostalAddress",
            "streetAddress": `${storeConfig.street}, ${storeConfig.number || ""}`,
            "addressLocality": storeConfig.city || "Assis",
            "addressRegion": storeConfig.state || "SP",
            "postalCode": storeConfig.zip_code || "",
            "addressCountry": "BR"
          } : undefined,
          "telephone": storeConfig?.phone || "(18) 99657-0512",
          "url": "https://aquaterapia.com.br"
        })}</script>
      </Helmet>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts title="Mais Vendidos" subtitle="Os queridinhos dos clientes" filter={p => !!p.isBestSeller} limit={8} />
      <PromoBar />
      <FeaturedProducts title="Lançamentos" subtitle="Novidades" filter={p => !!p.isNew} limit={8} dark />
      <BrandSection />
      <FeaturedProducts title="Promoções" subtitle="Ofertas imperdíveis" filter={p => !!p.promoPrice} limit={4} linkTo="/categoria/promocoes" />
      <FeaturedProducts title="Catálogo Completo" subtitle="Todos os produtos" limit={20} dark />
    </>
  );
};

export default Index;
