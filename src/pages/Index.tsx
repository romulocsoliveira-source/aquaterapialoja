import { Helmet } from "react-helmet-async";
import HeroSection from "@/components/store/HeroSection";
import CategoriesSection from "@/components/store/CategoriesSection";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import PromoBar from "@/components/store/PromoBar";
import BrandSection from "@/components/store/BrandSection";
import InspirationSection from "@/components/store/InspirationSection";
import ToolsSection from "@/components/store/ToolsSection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Almoxarifado das Tintas | Tintas, Esmaltes e Acessórios em Assis SP</title>
        <meta name="description" content="Loja de tintas em Assis SP. Tintas residenciais, industriais e automotivas. Simulador de cores, calculadora de tinta e entrega rápida. Frete grátis acima de R$ 299." />
        <link rel="canonical" href="https://almoxarifadodastintas.com.br" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Almoxarifado das Tintas",
          "description": "Loja especializada em tintas residenciais, industriais e automotivas em Assis SP",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Avenida Armando Sales de Oliveira, 173",
            "addressLocality": "Assis",
            "addressRegion": "SP",
            "postalCode": "19800-000",
            "addressCountry": "BR"
          },
          "telephone": "(18) 3323-1220",
          "url": "https://almoxarifadodastintas.com.br"
        })}</script>
      </Helmet>
      <HeroSection />
      <ToolsSection />
      <CategoriesSection />
      <FeaturedProducts title="Mais Vendidos" subtitle="Os queridinhos dos clientes" filter={p => !!p.isBestSeller} limit={8} />
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
