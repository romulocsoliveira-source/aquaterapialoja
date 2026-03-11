import { Helmet } from "react-helmet-async";
import HeroSection from "@/components/store/HeroSection";
import CategoriesSection from "@/components/store/CategoriesSection";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import PromoBar from "@/components/store/PromoBar";
import BrandSection from "@/components/store/BrandSection";
import InspirationSection from "@/components/store/InspirationSection";
import ToolsSection from "@/components/store/ToolsSection";
import AquarismSection from "@/components/store/AquarismSection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Aquaterapia Pet Shop | Pet Shop, Aquarismo, Banho e Tosa em Assis SP</title>
        <meta name="description" content="Pet shop e aquarismo em Assis SP. A maior loja de aquários da região. Banho e tosa, hotel pet e produtos premium. Agende online." />
        <link rel="canonical" href="https://aquaterapia.com.br" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Aquaterapia Pet Shop",
          "description": "Pet shop e aquarismo em Assis SP. A maior loja de aquários da região.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Avenida Getúlio Vargas, 339",
            "addressLocality": "Assis",
            "addressRegion": "SP",
            "postalCode": "19807-130",
            "addressCountry": "BR"
          },
          "telephone": "(18) 99657-0512",
          "url": "https://aquaterapia.com.br"
        })}</script>
      </Helmet>
      <HeroSection />
      <ToolsSection />
      <CategoriesSection />
      <FeaturedProducts title="Mais Vendidos" subtitle="Os queridinhos dos clientes" filter={p => !!p.isBestSeller} limit={8} />
      <AquarismSection />
      <PromoBar />
      <InspirationSection />
      <FeaturedProducts title="Lançamentos" subtitle="Novidades que acabaram de chegar" filter={p => !!p.isNew} limit={8} />
      <FeaturedProducts title="Promoções da Semana" subtitle="Descontos imperdíveis" filter={p => !!p.promoPrice} limit={4} />
      <FeaturedProducts title="Toda a Coleção" subtitle="Catálogo completo" limit={8} />
      <BrandSection />
    </>
  );
};

export default Index;
