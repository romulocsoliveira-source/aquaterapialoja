import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, Shield, Truck, CreditCard, Lock, Paintbrush } from "lucide-react";
import { useIsAdmin } from "@/hooks/useAdminRole";

export default function Footer() {
  const { data: isAdmin } = useIsAdmin();
  return (
    <footer className="bg-secondary border-t border-border mt-20">
      <div className="border-b border-border">
        <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Truck, title: "Entrega Rápida", desc: "Para todo o Brasil" },
            { icon: Shield, title: "Qualidade Garantida", desc: "Marcas premium" },
            { icon: CreditCard, title: "Parcelamento", desc: "Em até 12x sem juros" },
            { icon: Paintbrush, title: "Consultoria", desc: "Ajuda na escolha" },
          ].map(item => (
            <div key={item.title} className="flex flex-col items-center gap-2">
              <item.icon size={28} className="text-accent" />
              <span className="text-sm font-semibold text-foreground">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold text-gradient-gold mb-2">ALMOXARIFADO</h3>
          <p className="font-display text-sm font-semibold text-accent mb-4">das Tintas</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tintas Residenciais • Industriais • Automotivas. As melhores marcas com os melhores preços.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" className="text-muted-foreground hover:text-accent transition-colors" aria-label="Email"><Mail size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Navegação</h4>
          <ul className="space-y-2">
            {[
              { label: "Tintas Residenciais", href: "/categoria/tintas-residenciais" },
              { label: "Tintas Industriais", href: "/categoria/tintas-industriais" },
              { label: "Tintas Automotivas", href: "/categoria/tintas-automotivas" },
              { label: "Acessórios", href: "/categoria/acessorios-pintura" },
              { label: "Simulador de Cores", href: "/simulador-cores" },
              { label: "Calculadora de Tinta", href: "/calculadora-tinta" },
              { label: "Catálogo de Cores", href: "/catalogo-cores" },
              { label: "Dicas de Pintura", href: "/dicas-pintura" },
              { label: "Promoções", href: "/categoria/promocoes" },
            ].map(l => (
              <li key={l.label}><Link to={l.href} className="text-sm text-muted-foreground hover:text-accent transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Institucional</h4>
          <ul className="space-y-2">
            {["Sobre Nós", "Política de Privacidade", "Trocas e Devoluções", "Termos de Uso", "FAQ"].map(l => (
              <li key={l}><Link to="/" className="text-sm text-muted-foreground hover:text-accent transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Contato</h4>
          <div className="space-y-3">
            <a href="tel:+551833231220" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"><Phone size={16} /> (18) 3323-1220</a>
            <a href="mailto:contato@almoxarifadodastintas.com.br" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"><Mail size={16} /> contato@almoxarifadodastintas.com.br</a>
            <span className="flex items-start gap-2 text-sm text-muted-foreground"><MapPin size={16} className="mt-0.5 flex-shrink-0" /> Av. Armando Sales de Oliveira, 173 – Centro, Assis – SP</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            © 2026 Almoxarifado das Tintas. Todos os direitos reservados.
          </span>
          <span className="text-xs text-muted-foreground">
            Desenvolvido por <span className="font-semibold text-foreground/70">Romulo de Oliveira</span>
          </span>
          {isAdmin && (
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <Lock size={12} /> Administrador
              </Link>
              <Link to="/pdv" className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <CreditCard size={12} /> PDV
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
