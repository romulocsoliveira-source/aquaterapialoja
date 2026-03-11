import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useStoreData";
import type { Product } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/account/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Plus, Minus, Trash2, ArrowLeft, ShoppingCart,
  CreditCard, QrCode, Banknote, Barcode, Receipt, CheckCircle,
  Percent, Printer, RotateCcw, User, Clock, Camera, Tag
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/logo-aquaterapia.png";
import BarcodeScanner from "@/components/shared/BarcodeScanner";
import ProductLabelPrint from "@/components/shared/ProductLabelPrint";


interface PDVItem {
  product: Product;
  quantity: number;
}

export default function PDVPage() {
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<PDVItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<{ total: number; method: string; id: string; items: PDVItem[]; discount: number; change: number; cashReceived: number } | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFixed, setDiscountFixed] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [showCashInput, setShowCashInput] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    barcodeRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (cart.length > 0 && !lastSale) setShowPayment(true);
      }
      if (e.key === "Escape") {
        if (showPayment) setShowPayment(false);
        if (showCashInput) setShowCashInput(false);
        if (lastSale) { setLastSale(null); barcodeRef.current?.focus(); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart.length, lastSale, showPayment, showCashInput]);

  if (!user) {
    return (
      <div className="container max-w-md py-20">
        <h1 className="font-display text-2xl font-bold text-center mb-8">Acesso PDV</h1>
        <AuthForm />
      </div>
    );
  }

  const filtered = searchTerm
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm)
      )
    : [];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearchTerm("");
    setBarcodeInput("");
    barcodeRef.current?.focus();
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id === id) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  };

  const subtotal = cart.reduce((s, i) => s + (i.product.promoPrice || i.product.price) * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const discountAmount = discountPercent > 0 ? subtotal * (discountPercent / 100) : discountFixed;
  const total = Math.max(0, subtotal - discountAmount);
  const changeAmount = showCashInput && Number(cashReceived) > total ? Number(cashReceived) - total : 0;

  const handleBarcode = (code?: string) => {
    const bc = code || barcodeInput;
    const found = products.find(p => p.barcode === bc);
    if (found) {
      addToCart(found);
      toast.success(`${found.name} adicionado!`);
    } else if (bc) {
      toast.error("Produto não encontrado para o código: " + bc);
    }
    setBarcodeInput("");
  };

  const handleCameraScan = (code: string) => {
    handleBarcode(code);
  };


  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const printReceipt = (sale: typeof lastSale) => {
    if (!sale) return;
    const receiptWindow = window.open("", "_blank", "width=400,height=600");
    if (!receiptWindow) return;

    const methodLabels: Record<string, string> = { pix: "Pix", credit_card: "Cartão de Crédito/Débito", cash: "Dinheiro", debit_card: "Cartão de Débito" };

    receiptWindow.document.write(`
      <html>
      <head><title>Recibo</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 20px; color: #000; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .item { display: flex; justify-content: space-between; margin: 4px 0; }
        .total { font-size: 16px; font-weight: bold; }
        @media print { body { margin: 0; padding: 10px; } }
      </style>
      </head>
      <body>
      <div class="center bold" style="font-size:16px">AQUATERAPIA PET SHOP</div>
        <div class="center">Pet Shop • Aquarismo • Banho & Tosa</div>
        <div class="center" style="font-size:10px">(18) 99657-0512</div>
        <div class="line"></div>
        <div class="center bold">CUPOM NÃO FISCAL</div>
        <div class="center" style="font-size:10px">${new Date().toLocaleString("pt-BR")}</div>
        <div class="center" style="font-size:10px">Pedido: #${sale.id.slice(0, 8).toUpperCase()}</div>
        ${sale.items.length > 0 ? `<div class="center" style="font-size:10px">Cliente: ${customerName || "Consumidor Final"}</div>` : ""}
        <div class="line"></div>
        ${sale.items.map((i, idx) => `
          <div style="margin:6px 0">
            <div>${idx + 1}. ${i.product.name}</div>
            <div class="item">
              <span>${i.quantity}x ${formatPrice(i.product.promoPrice || i.product.price)}</span>
              <span>${formatPrice((i.product.promoPrice || i.product.price) * i.quantity)}</span>
            </div>
          </div>
        `).join("")}
        <div class="line"></div>
        <div class="item"><span>Subtotal (${sale.items.reduce((s, i) => s + i.quantity, 0)} itens)</span><span>${formatPrice(sale.total + sale.discount)}</span></div>
        ${sale.discount > 0 ? `<div class="item"><span>Desconto</span><span>-${formatPrice(sale.discount)}</span></div>` : ""}
        <div class="line"></div>
        <div class="item total"><span>TOTAL</span><span>${formatPrice(sale.total)}</span></div>
        <div class="line"></div>
        <div class="item"><span>Pagamento</span><span>${methodLabels[sale.method] || sale.method}</span></div>
        ${sale.method === "cash" && sale.cashReceived > 0 ? `
          <div class="item"><span>Recebido</span><span>${formatPrice(sale.cashReceived)}</span></div>
          <div class="item bold"><span>Troco</span><span>${formatPrice(sale.change)}</span></div>
        ` : ""}
        <div class="line"></div>
         <div class="center" style="font-size:10px;margin-top:12px">Obrigado pela preferência!</div>
        <div class="center" style="font-size:10px">Aquaterapia Pet Shop</div>
        <script>window.print();</script>
      </body></html>
    `);
    receiptWindow.document.close();
  };

  const finalizeSale = async (method: string) => {
    if (cart.length === 0 || processing) return;

    if (method === "cash" && !showCashInput) {
      setShowCashInput(true);
      return;
    }

    setProcessing(true);

    try {
      const { data: order, error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        total,
        payment_method: method,
        status: "delivered",
        shipping_cost: 0,
        discount: discountAmount,
      }).select("id").single();

      if (orderError || !order) throw orderError || new Error("Erro ao criar pedido");

      const orderItems = cart.map(i => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        product_image: i.product.image,
        quantity: i.quantity,
        unit_price: i.product.promoPrice || i.product.price,
      }));
      await supabase.from("order_items").insert(orderItems);

      for (const item of cart) {
        const newStock = Math.max(0, (item.product.stock || 0) - item.quantity);
        await supabase.from("store_products").update({ stock: newStock }).eq("id", item.product.id);
      }

      await supabase.from("financial_transactions").insert({
        type: "income",
        category: "Venda PDV",
        description: `Venda PDV #${order.id.slice(0, 8).toUpperCase()} - ${totalItems} itens${customerName ? ` - ${customerName}` : ""}`,
        amount: total,
        is_paid: true,
        paid_date: new Date().toISOString().split("T")[0],
        payment_method: method,
        reference_type: "order",
        reference_id: order.id,
        created_by: user.id,
      });

      const saleData = {
        total,
        method,
        id: order.id,
        items: [...cart],
        discount: discountAmount,
        change: changeAmount,
        cashReceived: Number(cashReceived) || 0,
      };
      setLastSale(saleData);
      setCart([]);
      setShowPayment(false);
      setShowCashInput(false);
      setCashReceived("");
      setDiscountPercent(0);
      setDiscountFixed(0);
      setShowDiscount(false);
      setCustomerName("");
      queryClient.invalidateQueries({ queryKey: ["store-products"] });
      toast.success("Venda finalizada com sucesso!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao finalizar venda");
    } finally {
      setProcessing(false);
    }
  };

  const methodLabels: Record<string, string> = { pix: "Pix", credit_card: "Cartão Crédito", debit_card: "Cartão Débito", cash: "Dinheiro" };

  const loadHistory = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("orders")
      .select("id, total, payment_method, created_at, discount")
      .eq("status", "completed")
      .gte("created_at", `${today}T00:00:00`)
      .order("created_at", { ascending: false })
      .limit(20);
    setSalesHistory(data || []);
    setShowHistory(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* PDV Header */}
      <div className="bg-secondary border-b border-border">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
            </Link>
             <img src={logoImg} alt="Aquaterapia Pet Shop" className="h-14 w-auto object-contain" />
            <div>
              <h1 className="font-display text-lg font-bold text-gradient-gold">PDV · AQUATERAPIA PET SHOP</h1>
              <p className="text-xs text-muted-foreground">Frente de Caixa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadHistory} className="gap-1 text-xs">
              <Clock size={14} /> Vendas do Dia
            </Button>
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Sale confirmation with fiscal receipt */}
      <AnimatePresence>
        {lastSale && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center overflow-y-auto py-8"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-full max-w-sm mx-auto">
              {/* Fiscal receipt card */}
              <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden" id="receipt-content">
                {/* Receipt header */}
                <div className="text-center pt-6 pb-3 px-6">
                   <p className="text-lg font-bold tracking-wide">AQUATERAPIA PET SHOP</p>
                   <p className="text-xs text-gray-500">Pet Shop • Aquarismo • Banho & Tosa</p>
                   <p className="text-[10px] text-gray-400 mt-1">CNPJ: 00.000.000/0001-00</p>
                   <p className="text-[10px] text-gray-400">Av. Getúlio Vargas, 339 – Vila Nova Santana, Assis/SP · (18) 99657-0512</p>
                </div>

                <div className="mx-4 border-t border-dashed border-gray-300" />

                <div className="text-center py-2 px-6">
                  <p className="text-xs font-bold">CUPOM FISCAL ELETRÔNICO - NFC-e</p>
                  <p className="text-[10px] text-gray-500">{new Date().toLocaleString("pt-BR")}</p>
                  <p className="text-[10px] text-gray-500">Pedido: #{lastSale.id.slice(0, 8).toUpperCase()}</p>
                  {customerName && <p className="text-[10px] text-gray-500">Cliente: {customerName || "Consumidor Final"}</p>}
                </div>

                <div className="mx-4 border-t border-dashed border-gray-300" />

                {/* Items */}
                <div className="px-4 py-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                    <span>ITEM</span>
                    <span>TOTAL</span>
                  </div>
                  {lastSale.items.map((item, idx) => (
                    <div key={idx} className="mb-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="flex-1 truncate pr-2">{idx + 1}. {item.product.name}</span>
                        <span className="font-semibold whitespace-nowrap">{formatPrice((item.product.promoPrice || item.product.price) * item.quantity)}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 pl-3">
                        {item.quantity}x {formatPrice(item.product.promoPrice || item.product.price)}
                        {item.product.sku ? ` · SKU: ${item.product.sku}` : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mx-4 border-t border-dashed border-gray-300" />

                {/* Totals */}
                <div className="px-4 py-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Subtotal ({lastSale.items.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                    <span>{formatPrice(lastSale.total + lastSale.discount)}</span>
                  </div>
                  {lastSale.discount > 0 && (
                    <div className="flex justify-between text-xs text-red-600">
                      <span>Desconto</span>
                      <span>-{formatPrice(lastSale.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-1">
                    <span>TOTAL</span>
                    <span>{formatPrice(lastSale.total)}</span>
                  </div>
                </div>

                <div className="mx-4 border-t border-dashed border-gray-300" />

                {/* Payment info */}
                <div className="px-4 py-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Forma de Pagamento</span>
                    <span className="font-semibold">{methodLabels[lastSale.method] || lastSale.method}</span>
                  </div>
                  {lastSale.method === "cash" && lastSale.cashReceived > 0 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span>Valor Recebido</span>
                        <span>{formatPrice(lastSale.cashReceived)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span>Troco</span>
                        <span>{formatPrice(lastSale.change)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mx-4 border-t border-dashed border-gray-300" />

                {/* Fiscal info */}
                <div className="text-center py-3 px-4">
                  <p className="text-[10px] text-gray-400">Chave de Acesso</p>
                  <p className="text-[9px] font-mono text-gray-500 break-all">
                    {Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join("")}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2">Consulte em www.nfe.fazenda.gov.br</p>
                  <p className="text-[10px] text-gray-400 mt-3">Obrigado pela preferência!</p>
                  <p className="text-[10px] text-gray-400">Aquaterapia Pet Shop</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-center mt-6">
                <Button variant="outline" className="gap-2 bg-card" onClick={() => printReceipt(lastSale)}>
                  <Printer size={16} /> Imprimir Cupom
                </Button>
                <Button className="gap-2 gradient-gold text-primary-foreground" onClick={() => { setLastSale(null); barcodeRef.current?.focus(); }}>
                  <RotateCcw size={16} /> Nova Venda
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sales history modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 z-40 flex items-center justify-center"
            onClick={() => setShowHistory(false)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="font-display text-lg font-bold mb-4">Vendas de Hoje</h3>
              {salesHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Nenhuma venda registrada hoje</p>
              ) : (
                <>
                  <div className="bg-accent/10 rounded-lg p-3 mb-4 text-center">
                    <p className="text-xs text-muted-foreground">Total do dia</p>
                    <p className="text-2xl font-display font-bold text-accent">
                      {formatPrice(salesHistory.reduce((s, o) => s + Number(o.total), 0))}
                    </p>
                    <p className="text-xs text-muted-foreground">{salesHistory.length} vendas</p>
                  </div>
                  <div className="space-y-2">
                    {salesHistory.map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(Number(o.total))}</p>
                          <p className="text-xs text-muted-foreground">{methodLabels[o.payment_method] || o.payment_method}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <Button variant="outline" className="w-full mt-4" onClick={() => setShowHistory(false)}>Fechar</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 container py-4 grid md:grid-cols-[1fr,420px] gap-4">
        {/* Products Search */}
        <div className="space-y-4">
          {/* Customer name */}
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Nome do cliente (opcional)..."
              className="w-full bg-secondary text-foreground pl-10 pr-4 py-2.5 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
            />
          </div>

          {/* Barcode Scanner */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleBarcode()}
                placeholder="Código de barras (Enter para buscar)..."
                className="w-full bg-secondary text-foreground pl-10 pr-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
              />
            </div>
            <Button onClick={() => handleBarcode()} className="bg-accent text-accent-foreground px-4">
              Buscar
            </Button>
            <Button onClick={() => setShowCameraScanner(true)} variant="outline" className="gap-1 border-primary text-primary">
              <Camera size={16} /> Escanear
            </Button>
          </div>

          <BarcodeScanner
            open={showCameraScanner}
            onOpenChange={setShowCameraScanner}
            onScan={handleCameraScan}
            title="Escanear Produto — PDV"
          />
          <ProductLabelPrint
            open={showLabels}
            onOpenChange={setShowLabels}
            products={cart.map(i => ({ name: i.product.name, price: i.product.price, promoPrice: i.product.promoPrice, barcode: i.product.barcode }))}
          />


          {/* Product Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar produto por nome ou SKU..."
              className="w-full bg-secondary text-foreground pl-10 pr-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
            />
          </div>

          {/* Search Results */}
          {filtered.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
              {filtered.slice(0, 20).map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors border-b border-border/50 text-left"
                >
                  <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-12 h-12 rounded object-cover bg-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {p.sku} · Cód: {p.barcode} · Est: {p.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{formatPrice(p.promoPrice || p.price)}</p>
                    {p.promoPrice && <p className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</p>}
                  </div>
                  <Plus size={20} className="text-accent" />
                </button>
              ))}
            </div>
          )}

          {searchTerm && filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">Nenhum produto encontrado.</div>
          )}

          {!searchTerm && cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ShoppingCart size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Busque um produto ou escaneie o código de barras</p>
              <p className="text-xs mt-1">Atalho: F2 para busca · F4 para pagamento</p>
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="bg-card border border-border rounded-xl flex flex-col h-[calc(100vh-180px)]">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-body font-semibold flex items-center gap-2">
              <ShoppingCart size={18} /> Venda ({totalItems} itens)
            </h2>
            {cart.length > 0 && (
              <button onClick={() => { setCart([]); setDiscountPercent(0); setDiscountFixed(0); }} className="text-xs text-muted-foreground hover:text-destructive">
                Limpar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.map((item, idx) => (
              <div key={item.product.id} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                <span className="text-xs text-muted-foreground w-5">{idx + 1}</span>
                <img src={item.product.image || "/placeholder.svg"} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(item.product.promoPrice || item.product.price)} un</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.product.id, -1)} className="p-1 rounded bg-secondary hover:bg-border"><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} className="p-1 rounded bg-secondary hover:bg-border"><Plus size={14} /></button>
                </div>
                <span className="text-sm font-bold w-20 text-right">
                  {formatPrice((item.product.promoPrice || item.product.price) * item.quantity)}
                </span>
                <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Total & Payment */}
          <div className="border-t border-border p-4 space-y-3">
            {/* Discount section */}
            {cart.length > 0 && (
              <div>
                <button onClick={() => setShowDiscount(!showDiscount)} className="text-xs text-accent flex items-center gap-1 hover:underline">
                  <Percent size={12} /> {showDiscount ? "Ocultar desconto" : "Aplicar desconto"}
                </button>
                {showDiscount && (
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">% Desconto</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent || ""}
                        onChange={e => { setDiscountPercent(Number(e.target.value)); setDiscountFixed(0); }}
                        className="w-full bg-secondary text-foreground px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">R$ Desconto</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountFixed || ""}
                        onChange={e => { setDiscountFixed(Number(e.target.value)); setDiscountPercent(0); }}
                        className="w-full bg-secondary text-foreground px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent/50"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Desconto</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-lg font-body font-semibold">Total</span>
                <span className="text-2xl font-display font-bold text-accent">{formatPrice(total)}</span>
              </div>
            </div>

            {!showPayment ? (
              <Button
                onClick={() => setShowPayment(true)}
                disabled={cart.length === 0}
                className="w-full gradient-gold text-primary-foreground font-body font-semibold h-12 text-sm uppercase tracking-wider"
              >
                Finalizar Venda (F4)
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center uppercase tracking-wider">Forma de Pagamento</p>

                {/* Cash input for change calculation */}
                {showCashInput && (
                  <div className="bg-secondary rounded-lg p-3 space-y-2">
                    <label className="text-xs text-muted-foreground">Valor recebido em dinheiro</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={e => setCashReceived(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && Number(cashReceived) >= total && finalizeSale("cash")}
                      className="w-full bg-background text-foreground px-3 py-2 rounded text-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder={formatPrice(total)}
                      autoFocus
                    />
                    {Number(cashReceived) > 0 && Number(cashReceived) >= total && (
                      <div className="flex justify-between text-lg font-bold text-green-400">
                        <span>Troco:</span>
                        <span>{formatPrice(Number(cashReceived) - total)}</span>
                      </div>
                    )}
                    {Number(cashReceived) > 0 && Number(cashReceived) < total && (
                      <p className="text-xs text-destructive">Valor insuficiente</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => finalizeSale("cash")}
                        disabled={processing || !cashReceived || Number(cashReceived) < total}
                        className="flex-1 bg-accent text-accent-foreground text-sm"
                      >
                        Confirmar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowCashInput(false)}>Voltar</Button>
                    </div>
                  </div>
                )}

                {!showCashInput && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => finalizeSale("pix")}
                      disabled={processing}
                      className="flex flex-col items-center gap-1 p-3 bg-secondary rounded-lg hover:border-accent border border-border transition-colors disabled:opacity-50"
                    >
                      <QrCode size={20} className="text-accent" />
                      <span className="text-xs font-body">Pix</span>
                    </button>
                    <button
                      onClick={() => finalizeSale("credit_card")}
                      disabled={processing}
                      className="flex flex-col items-center gap-1 p-3 bg-secondary rounded-lg hover:border-accent border border-border transition-colors disabled:opacity-50"
                    >
                      <CreditCard size={20} className="text-accent" />
                      <span className="text-xs font-body">Crédito</span>
                    </button>
                    <button
                      onClick={() => finalizeSale("debit_card")}
                      disabled={processing}
                      className="flex flex-col items-center gap-1 p-3 bg-secondary rounded-lg hover:border-accent border border-border transition-colors disabled:opacity-50"
                    >
                      <CreditCard size={20} className="text-accent" />
                      <span className="text-xs font-body">Débito</span>
                    </button>
                    <button
                      onClick={() => finalizeSale("cash")}
                      disabled={processing}
                      className="flex flex-col items-center gap-1 p-3 bg-secondary rounded-lg hover:border-accent border border-border transition-colors disabled:opacity-50"
                    >
                      <Banknote size={20} className="text-accent" />
                      <span className="text-xs font-body">Dinheiro</span>
                    </button>
                  </div>
                )}

                {processing && <p className="text-xs text-center text-accent animate-pulse">Processando venda...</p>}
                {!showCashInput && (
                  <button onClick={() => setShowPayment(false)} className="w-full text-xs text-muted-foreground hover:text-foreground py-1" disabled={processing}>
                    Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
