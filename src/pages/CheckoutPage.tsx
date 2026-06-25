import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Plus, CreditCard, ShoppingBag, CheckCircle, ArrowLeft, Truck, Loader2, Lock, QrCode, Copy, AlertTriangle, Receipt, Clock, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCepLookup } from "@/hooks/useCepLookup";
import { QRCodeSVG } from "qrcode.react";
import { usePaymentSettings, getEnabledMethods } from "@/hooks/usePaymentSettings";

interface Address {
  id: string;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean | null;
}

type Step = "address" | "payment" | "confirmation";

interface PaymentResult {
  method: string;
  // PIX
  qr_code_text?: string;
  qr_code_image?: string;
  pix_expiration?: string;
  // Card
  charge_status?: string;
  // Boleto
  barcode?: string;
  formatted_barcode?: string;
  boleto_pdf?: string;
  boleto_due_date?: string;
  // Common
  transaction_id?: string;
  order_status?: string;
  error?: string;
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { lookupCep, loading: cepLoading, formatCep } = useCepLookup();
  const { data: paymentSettings, isLoading: settingsLoading } = usePaymentSettings();

  const [step, setStep] = useState<Step>("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [form, setForm] = useState({ label: "Casa", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "" });
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "", installments: "1" });
  const [cpf, setCpf] = useState("");
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Fetch public_key for card encryption
  useEffect(() => {
    if (paymentSettings?.credit_card_enabled && paymentSettings?.is_active) {
      supabase.from("payment_settings")
        .select("public_key")
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.public_key) setPublicKey(data.public_key);
        });
    }
  }, [paymentSettings]);

  // Operação inicial: apenas PIX via chave estática (CNPJ). Sem gateway.
  const pagbankActive = false;
  const displayMethods = [
    { id: "pix", label: "PIX", desc: "Pagamento instantâneo" },
  ];

  // Auto-select first method
  useEffect(() => {
    if (displayMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(displayMethods[0].id);
    }
  }, [displayMethods, paymentMethod]);

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const selectedAddr = addresses.find(a => a.id === selectedAddress);
  const isAssisCity = selectedAddr?.city?.trim().toLowerCase() === "assis";
  const subtotalAfterDiscount = Math.max(0, totalPrice - couponDiscount);
  const shippingCost = subtotalAfterDiscount >= 15 ? 0 : 5;
  const shippingLabel = shippingCost === 0 ? "Frete grátis" : "Taxa de entrega";
  const finalTotal = Math.max(0, subtotalAfterDiscount + shippingCost);

  const maxInstallments = paymentSettings?.max_installments || 12;
  const minInstallmentValue = paymentSettings?.min_installment_value || 10;

  const installmentOptions = Array.from({ length: maxInstallments }, (_, i) => {
    const n = i + 1;
    const installmentValue = finalTotal / n;
    if (n > 1 && installmentValue < minInstallmentValue) return null;
    return { value: String(n), label: n === 1 ? `1x de ${formatPrice(finalTotal)} (à vista)` : `${n}x de ${formatPrice(installmentValue)} sem juros` };
  }).filter(Boolean) as { value: string; label: string }[];

  // CEP auto-fill
  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setForm(f => ({ ...f, zip_code: formatted }));
    const cleanCep = value.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      const data = await lookupCep(cleanCep);
      if (data) {
        setForm(f => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: data.uf || f.state,
          complement: data.complemento || f.complement,
        }));
        toast.success("Endereço preenchido automaticamente!");
      }
    }
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    if (digits.length > 6) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    if (digits.length > 3) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    return digits;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      toast.error("Cupom inválido ou expirado");
      setCouponLoading(false);
      return;
    }

    if (data.min_order_value && totalPrice < Number(data.min_order_value)) {
      toast.error(`Pedido mínimo de ${formatPrice(Number(data.min_order_value))} para este cupom`);
      setCouponLoading(false);
      return;
    }

    if (data.max_uses && data.used_count >= data.max_uses) {
      toast.error("Este cupom atingiu o limite de uso");
      setCouponLoading(false);
      return;
    }

    const discount = data.discount_type === "percentage"
      ? totalPrice * (Number(data.discount_value) / 100)
      : Number(data.discount_value);

    setCouponDiscount(discount);
    setCouponApplied(data.code);
    toast.success(`Cupom ${data.code} aplicado! Desconto de ${formatPrice(discount)}`);
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setCouponApplied(null);
    setCouponCode("");
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/conta");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false })
      .then(({ data }) => {
        setAddresses(data || []);
        const def = data?.find(a => a.is_default);
        if (def) setSelectedAddress(def.id);
        else if (data?.length) setSelectedAddress(data[0].id);
      });
  }, [user]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id });
    if (error) { toast.error("Erro ao salvar endereço"); return; }
    toast.success("Endereço adicionado!");
    setShowAddressForm(false);
    setForm({ label: "Casa", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "" });
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
    setAddresses(data || []);
    if (data?.length) setSelectedAddress(data[data.length - 1].id);
  };

  const validateCardForm = () => {
    const cleanNum = cardForm.number.replace(/\s/g, "");
    if (cleanNum.length < 13 || cleanNum.length > 16) { toast.error("Número do cartão inválido"); return false; }
    if (!cardForm.name.trim()) { toast.error("Nome no cartão é obrigatório"); return false; }
    const expiryParts = cardForm.expiry.split("/");
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) { toast.error("Validade inválida"); return false; }
    const month = parseInt(expiryParts[0]);
    if (month < 1 || month > 12) { toast.error("Mês inválido"); return false; }
    if (cardForm.cvv.length < 3) { toast.error("CVV inválido"); return false; }
    return true;
  };

  const callPagbankApi = async (action: string, body: Record<string, any>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Sessão expirada");

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const resp = await fetch(`https://${projectId}.supabase.co/functions/v1/pagbank-api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ action, ...body }),
    });

    return resp.json();
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) return;
    if (paymentMethod === "credit_card") {
      if (!validateCardForm()) return;
      if (pagbankActive && !publicKey) {
        toast.error("Cartão de crédito não está configurado corretamente. Chave pública ausente.");
        return;
      }
    }
    if (paymentSettings?.require_buyer_cpf && cpf.replace(/\D/g, "").length !== 11) {
      toast.error("CPF é obrigatório");
      return;
    }

    setLoading(true);
    setProcessingPayment(true);
    const addr = addresses.find(a => a.id === selectedAddress);

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        total: finalTotal,
        discount: couponDiscount,
        shipping_cost: shippingCost,
        payment_method: paymentMethod === "credit_card" ? `credit_card_${cardForm.installments}x` : paymentMethod,
        shipping_address: addr ? { street: addr.street, number: addr.number, complement: addr.complement, neighborhood: addr.neighborhood, city: addr.city, state: addr.state, zip_code: addr.zip_code } : null,
        status: "pending_payment",
      }).select("id").single();

      if (orderError || !order) {
        toast.error("Erro ao criar pedido");
        setLoading(false);
        setProcessingPayment(false);
        return;
      }

      // 2. Insert order items
      const orderItems = items.map(i => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        product_image: i.product.image,
        quantity: i.quantity,
        unit_price: i.product.promoPrice || i.product.price,
        variation: i.variation || null,
      }));

      await supabase.from("order_items").insert(orderItems);

      // 3. Get profile for customer data
      const { data: profile } = await supabase.from("profiles").select("full_name, phone, cpf").eq("user_id", user.id).maybeSingle();

      const customer = {
        name: profile?.full_name || user.email?.split("@")[0] || "Cliente",
        email: user.email || "",
        cpf: cpf.replace(/\D/g, "") || profile?.cpf?.replace(/\D/g, "") || "",
      };

      // 4. Process payment via PagBank if active
      if (pagbankActive) {
        let result: any;

        if (paymentMethod === "pix") {
          result = await callPagbankApi("create-pix", {
            order_id: order.id,
            amount: finalTotal,
            customer,
          });

          if (result.success) {
            setPaymentResult({
              method: "pix",
              qr_code_text: result.qr_code_text,
              qr_code_image: result.qr_code,
              pix_expiration: result.expiration,
              transaction_id: result.transaction_id,
            });
          } else {
            setPaymentResult({ method: "pix", error: result.error || "Erro ao gerar PIX" });
          }
        } else if (paymentMethod === "credit_card") {
          // Encrypt card data using PagBank JS SDK - NEVER send raw card data
          const PagSeguro = (window as any).PagSeguro;
          if (!PagSeguro || !publicKey) {
            toast.error("Erro de segurança: SDK de pagamento não carregado. Recarregue a página.");
            setLoading(false);
            setProcessingPayment(false);
            return;
          }

          const expiryParts = cardForm.expiry.split("/");
          const expMonth = expiryParts[0];
          const expYear = `20${expiryParts[1]}`;

          const encryptedResult = PagSeguro.encryptCard({
            publicKey: publicKey,
            holder: cardForm.name,
            number: cardForm.number.replace(/\s/g, ""),
            expMonth: expMonth,
            expYear: expYear,
            securityCode: cardForm.cvv,
          });

          if (encryptedResult.hasErrors) {
            const errorMessages = encryptedResult.errors?.map((e: any) => e.message).join(", ") || "Dados do cartão inválidos";
            toast.error(`Erro na criptografia: ${errorMessages}`);
            setLoading(false);
            setProcessingPayment(false);
            return;
          }

          result = await callPagbankApi("create-card", {
            order_id: order.id,
            amount: finalTotal,
            customer,
            card_token: encryptedResult.encryptedCard,
            installments: parseInt(cardForm.installments),
          });

          if (result.success) {
            setPaymentResult({
              method: "credit_card",
              charge_status: result.charge_status,
              transaction_id: result.transaction_id,
              order_status: result.order_status,
            });
          } else {
            setPaymentResult({ method: "credit_card", error: result.error || "Erro no pagamento" });
          }
        } else if (paymentMethod === "boleto") {
          result = await callPagbankApi("create-boleto", {
            order_id: order.id,
            amount: finalTotal,
            customer,
          });

          if (result.success) {
            setPaymentResult({
              method: "boleto",
              barcode: result.barcode,
              formatted_barcode: result.formatted_barcode,
              boleto_pdf: result.pdf_link,
              boleto_due_date: result.due_date,
              transaction_id: result.transaction_id,
            });
          } else {
            setPaymentResult({ method: "boleto", error: result.error || "Erro ao gerar boleto" });
          }
        }
      } else {
        // No PagBank - just set basic result
        setPaymentResult({ method: paymentMethod });
      }

      setOrderId(order.id);
      setPaidAmount(finalTotal);
      setStep("confirmation");
      clearCart();
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar pedido");
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!orderId) return;
    const { data } = await supabase.from("orders").select("status, gateway_status").eq("id", orderId).single();
    if (data?.gateway_status === "PAID" || data?.status === "paid") {
      toast.success("Pagamento confirmado!");
      setPaymentResult(prev => prev ? { ...prev, order_status: "paid" } : prev);
    } else {
      toast.info("Pagamento ainda pendente. Tente novamente em alguns instantes.");
    }
  };

  if (authLoading) return null;
  if (!user) return null;
  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="container py-24 text-center">
        <ShoppingBag size={64} className="mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Carrinho vazio</h2>
        <p className="text-muted-foreground font-body mb-6">Adicione produtos antes de finalizar.</p>
        <Button onClick={() => navigate("/")} variant="outline" className="gap-2"><ArrowLeft size={16} /> Voltar à Loja</Button>
      </div>
    );
  }

  const inputClass = "w-full bg-secondary text-foreground px-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground";

  // ============ CONFIRMATION VIEWS ============

  const renderPixConfirmation = () => {
    const hasError = paymentResult?.error;
    const qrText = paymentResult?.qr_code_text;

    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <QrCode size={32} className="text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Pagamento via PIX</h2>
        {orderId && <p className="text-xs text-muted-foreground font-body mb-4">Pedido: <span className="font-mono text-foreground">{orderId.slice(0, 8).toUpperCase()}</span></p>}

        {hasError ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 max-w-sm mx-auto mb-6">
            <AlertTriangle size={20} className="text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive font-body">{paymentResult?.error}</p>
            <p className="text-xs text-muted-foreground mt-2">O pedido foi registrado. Você pode tentar o pagamento pela área de pedidos.</p>
          </div>
        ) : (
          <>
            {qrText ? (
              <>
                <p className="text-muted-foreground font-body mb-1 text-sm">Escaneie o QR Code ou copie o código</p>
                <div className="bg-white rounded-2xl p-6 inline-block mx-auto mb-4 shadow-lg">
                  {paymentResult?.qr_code_image ? (
                    <img src={paymentResult.qr_code_image} alt="QR Code PIX" className="w-[220px] h-[220px]" />
                  ) : (
                    <QRCodeSVG value={qrText} size={220} level="M" />
                  )}
                </div>
                <div className="bg-card border border-border rounded-xl p-4 max-w-sm mx-auto mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Código PIX (copia e cola)</p>
                  <div className="bg-secondary rounded-lg p-3 font-mono text-xs break-all text-left max-h-20 overflow-y-auto">
                    {qrText}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1 w-full"
                    onClick={() => { navigator.clipboard.writeText(qrText); toast.success("Código PIX copiado!"); }}
                  >
                    <Copy size={14} /> Copiar código
                  </Button>
                </div>
                {paymentResult?.pix_expiration && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock size={12} />
                    <span>Expira em: {new Date(paymentResult.pix_expiration).toLocaleString("pt-BR")}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-muted-foreground font-body mb-1 text-sm">Escaneie o QR Code abaixo para pagar</p>
                <div className="bg-white rounded-2xl p-6 inline-block mx-auto mb-4 shadow-lg">
                  <QRCodeSVG
                    value={generateLocalPixPayload()}
                    size={220}
                    level="M"
                  />
                </div>
                <div className="bg-card border border-border rounded-xl p-4 max-w-sm mx-auto mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Valor total</p>
                  <p className="text-2xl font-display font-bold text-accent">{formatPrice(paidAmount || finalTotal)}</p>
                </div>
              </>
            )}
          </>
        )}

        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 max-w-sm mx-auto mb-4">
          <p className="text-sm text-foreground font-body flex items-center justify-center gap-2">
            <Clock size={14} /> Aguardando confirmação do pagamento
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-1 mb-6" onClick={handleCheckPaymentStatus}>
          <RefreshCw size={14} /> Verificar pagamento
        </Button>

        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/conta")} variant="outline" className="gap-2">Meus Pedidos</Button>
          <Button onClick={() => navigate("/")} className="gradient-gold text-primary-foreground font-body font-semibold gap-2">Continuar Comprando</Button>
        </div>
      </div>
    );
  };

  const renderCardConfirmation = () => {
    const hasError = paymentResult?.error;
    const status = paymentResult?.charge_status;
    const isPaid = status === "PAID" || status === "AUTHORIZED";
    const isAnalysis = status === "IN_ANALYSIS";

    return (
      <div className="text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${hasError ? "bg-destructive/20" : isPaid ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
          {hasError ? <AlertTriangle size={40} className="text-destructive" /> : isPaid ? <CheckCircle size={40} className="text-green-500" /> : <Clock size={40} className="text-yellow-500" />}
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">
          {hasError ? "Erro no Pagamento" : isPaid ? "Pagamento Aprovado!" : isAnalysis ? "Pagamento em Análise" : "Pedido Recebido"}
        </h2>
        <p className="text-muted-foreground font-body mb-2">
          {hasError
            ? paymentResult?.error
            : isPaid
              ? "Seu pagamento foi aprovado e o pedido está sendo preparado."
              : isAnalysis
                ? "Seu pagamento está sendo analisado. Você receberá uma atualização em breve."
                : "Seu pedido foi criado com sucesso."}
        </p>
        {orderId && <p className="text-xs text-muted-foreground font-body mb-6">Pedido: <span className="font-mono text-foreground">{orderId.slice(0, 8).toUpperCase()}</span></p>}
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/conta")} variant="outline" className="gap-2">Meus Pedidos</Button>
          <Button onClick={() => navigate("/")} className="gradient-gold text-primary-foreground font-body font-semibold gap-2">Continuar Comprando</Button>
        </div>
      </div>
    );
  };

  const renderBoletoConfirmation = () => {
    const hasError = paymentResult?.error;

    return (
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${hasError ? "bg-destructive/20" : "bg-accent/20"}`}>
          {hasError ? <AlertTriangle size={32} className="text-destructive" /> : <Receipt size={32} className="text-accent" />}
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">{hasError ? "Erro ao Gerar Boleto" : "Boleto Gerado"}</h2>
        {orderId && <p className="text-xs text-muted-foreground font-body mb-4">Pedido: <span className="font-mono text-foreground">{orderId.slice(0, 8).toUpperCase()}</span></p>}

        {hasError ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 max-w-sm mx-auto mb-6">
            <p className="text-sm text-destructive font-body">{paymentResult?.error}</p>
          </div>
        ) : (
          <>
            {paymentResult?.formatted_barcode && (
              <div className="bg-card border border-border rounded-xl p-4 max-w-md mx-auto mb-4">
                <p className="text-xs text-muted-foreground mb-2">Linha digitável</p>
                <div className="bg-secondary rounded-lg p-3 font-mono text-xs break-all">
                  {paymentResult.formatted_barcode}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-1 w-full"
                  onClick={() => { navigator.clipboard.writeText(paymentResult.formatted_barcode!); toast.success("Código copiado!"); }}
                >
                  <Copy size={14} /> Copiar linha digitável
                </Button>
              </div>
            )}
            {paymentResult?.boleto_pdf && (
              <Button asChild variant="outline" className="gap-2 mb-4">
                <a href={paymentResult.boleto_pdf} target="_blank" rel="noopener noreferrer">
                  <Receipt size={16} /> Visualizar Boleto (PDF)
                </a>
              </Button>
            )}
            {paymentResult?.boleto_due_date && (
              <p className="text-xs text-muted-foreground mb-4">Vencimento: {new Date(paymentResult.boleto_due_date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
            )}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 max-w-sm mx-auto mb-6">
              <p className="text-sm text-foreground font-body">
                {paymentSettings?.boleto_instructions || "Pague o boleto até o vencimento para confirmar seu pedido."}
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/conta")} variant="outline" className="gap-2">Meus Pedidos</Button>
          <Button onClick={() => navigate("/")} className="gradient-gold text-primary-foreground font-body font-semibold gap-2">Continuar Comprando</Button>
        </div>
      </div>
    );
  };

  const renderDefaultConfirmation = () => (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="font-display text-2xl font-bold mb-2">Pedido Confirmado!</h2>
      <p className="text-muted-foreground font-body mb-2">Seu pedido foi criado com sucesso.</p>
      {orderId && <p className="text-xs text-muted-foreground font-body mb-6">Código: <span className="font-mono text-foreground">{orderId.slice(0, 8).toUpperCase()}</span></p>}
      <div className="flex gap-3 justify-center">
        <Button onClick={() => navigate("/conta")} variant="outline" className="gap-2">Meus Pedidos</Button>
        <Button onClick={() => navigate("/")} className="gradient-gold text-primary-foreground font-body font-semibold gap-2">Continuar Comprando</Button>
      </div>
    </div>
  );

  // Generates a valid EMV PIX (BR Code) payload — static QR with amount
  function generateLocalPixPayload() {
    // Sanitiza para ASCII maiúsculo sem acentos/símbolos (exigido pelo padrão BR Code)
    const sanitize = (s: string, max: number) =>
      s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z0-9 ]/g, "").toUpperCase().trim().slice(0, max);

    const pixKey = "42157598000177"; // CNPJ (apenas dígitos)
    const merchantName = sanitize("AQUATERAPIA AQUARIOS", 25);
    const merchantCity = sanitize("ASSIS", 15);
    const amount = Number(paidAmount || finalTotal || 0).toFixed(2);

    // TXID: apenas alfanumérico, 1-25 chars
    const rawTx = (orderId || "COMPRA").toString().replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const txid = (rawTx || "COMPRA").slice(0, 25);

    const tlv = (id: string, val: string) =>
      `${id}${String(val.length).padStart(2, "0")}${val}`;

    // ID 26 — Merchant Account Information (PIX)
    const mai = tlv("00", "br.gov.bcb.pix") + tlv("01", pixKey);

    // ID 62 — Additional Data Field (TXID em 05)
    const addData = tlv("05", txid);

    const payloadNoCrc =
      tlv("00", "01") +          // Payload Format Indicator
      tlv("01", "11") +          // Point of Initiation Method (11 = estático)
      tlv("26", mai) +           // Merchant Account Info
      tlv("52", "0000") +        // Merchant Category Code
      tlv("53", "986") +         // Moeda BRL
      tlv("54", amount) +        // Valor
      tlv("58", "BR") +          // País
      tlv("59", merchantName) +  // Nome do recebedor
      tlv("60", merchantCity) +  // Cidade
      tlv("62", addData) +       // Dados adicionais
      "6304";                    // Placeholder do CRC

    // CRC16-CCITT (poly 0x1021, init 0xFFFF), calculado sobre o payload + "6304"
    let crc = 0xFFFF;
    for (let i = 0; i < payloadNoCrc.length; i++) {
      crc ^= payloadNoCrc.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xFFFF;
      }
    }
    return payloadNoCrc + crc.toString(16).toUpperCase().padStart(4, "0");
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Aquaterapia</title>
      </Helmet>
      <div className="container py-12 md:py-20 max-w-4xl">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[
            { key: "address", label: "Endereço", icon: MapPin },
            { key: "payment", label: "Pagamento", icon: CreditCard },
            { key: "confirmation", label: "Confirmação", icon: CheckCircle },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-px ${["payment", "confirmation"].indexOf(step) >= i ? "bg-accent" : "bg-border"}`} />}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-colors ${step === s.key ? "bg-accent text-accent-foreground" : ["payment", "confirmation"].indexOf(step) > ["address", "payment", "confirmation"].indexOf(s.key) ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"}`}>
                <s.icon size={14} />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {step === "address" && (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2"><MapPin size={20} className="text-accent" /> Endereço de Entrega</h2>

                  {addresses.length === 0 && !showAddressForm ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                      <MapPin size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground font-body mb-4">Nenhum endereço cadastrado</p>
                      <Button onClick={() => setShowAddressForm(true)} className="gradient-gold text-primary-foreground gap-2"><Plus size={16} /> Adicionar Endereço</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map(addr => (
                        <button key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                          className={`w-full text-left bg-card rounded-xl border p-4 transition-all ${selectedAddress === addr.id ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-accent/30"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddress === addr.id ? "border-accent" : "border-muted-foreground"}`}>
                              {selectedAddress === addr.id && <div className="w-2 h-2 rounded-full bg-accent" />}
                            </div>
                            <span className="font-body text-sm font-semibold">{addr.label || "Endereço"}</span>
                          </div>
                          <p className="text-sm text-muted-foreground font-body ml-6">{addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ""} · {addr.neighborhood} - {addr.city}/{addr.state}</p>
                        </button>
                      ))}
                      {!showAddressForm && (
                        <button onClick={() => setShowAddressForm(true)} className="w-full border border-dashed border-border rounded-xl p-4 text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors flex items-center justify-center gap-2 font-body text-sm">
                          <Plus size={16} /> Novo endereço
                        </button>
                      )}
                    </div>
                  )}

                  {showAddressForm && (
                    <form onSubmit={handleSaveAddress} className="bg-card rounded-xl border border-border p-6 mt-4 space-y-4">
                      <h3 className="font-display text-lg font-bold">Novo Endereço</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-body font-medium block mb-1">Rótulo</label>
                          <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className={inputClass} placeholder="Casa, Trabalho..." />
                        </div>
                        <div>
                          <label className="text-sm font-body font-medium block mb-1">CEP</label>
                          <div className="relative">
                            <input required value={form.zip_code} onChange={e => handleCepChange(e.target.value)} className={inputClass} placeholder="00000-000" maxLength={9} />
                            {cepLoading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-accent" />}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="text-sm font-body font-medium block mb-1">Rua</label>
                          <input required value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} className={inputClass} />
                        </div>
                        <div>
                          <label className="text-sm font-body font-medium block mb-1">Número</label>
                          <input required value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-body font-medium block mb-1">Complemento</label>
                        <input value={form.complement} onChange={e => setForm(f => ({ ...f, complement: e.target.value }))} className={inputClass} placeholder="Apto, Bloco..." />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-body font-medium block mb-1">Bairro</label>
                          <input required value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} className={inputClass} />
                        </div>
                        <div>
                          <label className="text-sm font-body font-medium block mb-1">Cidade</label>
                          <input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputClass} />
                        </div>
                        <div>
                          <label className="text-sm font-body font-medium block mb-1">UF</label>
                          <input required maxLength={2} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} className={inputClass} placeholder="SP" />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" className="gradient-gold text-primary-foreground font-body font-semibold h-11">Salvar</Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>Cancelar</Button>
                      </div>
                    </form>
                  )}

                  {selectedAddress && !isAssisCity && (
                    <div className="mt-6 p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm font-body flex items-start gap-2">
                      <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                      <span>No momento realizamos entregas apenas para a cidade de <strong>Assis-SP</strong>. Selecione um endereço em Assis para continuar.</span>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={() => navigate("/")} className="gap-2"><ArrowLeft size={16} /> Voltar</Button>
                    <Button disabled={!selectedAddress || !isAssisCity} onClick={() => setStep("payment")} className="gradient-gold text-primary-foreground font-body font-semibold h-11 px-8">Continuar</Button>
                  </div>
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2"><CreditCard size={20} className="text-accent" /> Forma de Pagamento</h2>

                  {settingsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-accent" size={24} />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {displayMethods.map(pm => (
                          <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                            className={`w-full text-left bg-card rounded-xl border p-4 transition-all ${paymentMethod === pm.id ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-accent/30"}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === pm.id ? "border-accent" : "border-muted-foreground"}`}>
                                {paymentMethod === pm.id && <div className="w-2 h-2 rounded-full bg-accent" />}
                              </div>
                              <div>
                                <span className="font-body text-sm font-semibold">{pm.label}</span>
                                <p className="text-xs text-muted-foreground">{pm.desc}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* CPF field when required */}
                      {paymentSettings?.require_buyer_cpf && (
                        <div className="mt-4">
                          <label className="text-sm font-body font-medium block mb-1">CPF do comprador</label>
                          <input
                            value={cpf}
                            onChange={e => setCpf(formatCpf(e.target.value))}
                            className={inputClass}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            inputMode="numeric"
                          />
                        </div>
                      )}

                      {/* Credit card form */}
                      <AnimatePresence>
                        {paymentMethod === "credit_card" && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                             <div className="bg-card rounded-xl border border-border p-6 mt-4 space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Lock size={14} className="text-accent" />
                                <span className="text-xs text-muted-foreground font-body">Dados criptografados com SDK PagBank — nenhum dado sensível é enviado ao servidor</span>
                              </div>
                              {pagbankActive && !publicKey && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                                  <AlertTriangle size={16} className="text-destructive shrink-0" />
                                  <p className="text-xs text-destructive font-body">Chave pública não configurada. Teste a conexão no painel administrativo para gerar a chave.</p>
                                </div>
                              )}
                              <div>
                                <label className="text-sm font-body font-medium block mb-1">Número do Cartão</label>
                                <input value={cardForm.number} onChange={e => setCardForm(f => ({ ...f, number: formatCardNumber(e.target.value) }))} className={inputClass} placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric" />
                              </div>
                              <div>
                                <label className="text-sm font-body font-medium block mb-1">Nome no Cartão</label>
                                <input value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value.toUpperCase() }))} className={inputClass} placeholder="COMO IMPRESSO NO CARTÃO" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-body font-medium block mb-1">Validade</label>
                                  <input value={cardForm.expiry} onChange={e => setCardForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))} className={inputClass} placeholder="MM/AA" maxLength={5} inputMode="numeric" />
                                </div>
                                <div>
                                  <label className="text-sm font-body font-medium block mb-1">CVV</label>
                                  <input value={cardForm.cvv} onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} className={inputClass} placeholder="000" maxLength={4} inputMode="numeric" type="password" />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-body font-medium block mb-1">Parcelas</label>
                                <select value={cardForm.installments} onChange={e => setCardForm(f => ({ ...f, installments: e.target.value }))} className={`${inputClass} cursor-pointer`}>
                                  {installmentOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={() => setStep("address")} className="gap-2"><ArrowLeft size={16} /> Voltar</Button>
                    <Button onClick={handlePlaceOrder} disabled={loading || processingPayment} className="gradient-gold text-primary-foreground font-body font-semibold h-11 px-8 glow-gold">
                      {processingPayment ? <><Loader2 size={16} className="animate-spin mr-2" /> Processando...</> : "Confirmar Pedido"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "confirmation" && (
                <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
                  {paymentResult?.method === "pix" ? renderPixConfirmation()
                    : paymentResult?.method === "credit_card" ? renderCardConfirmation()
                      : paymentResult?.method === "boleto" ? renderBoletoConfirmation()
                        : renderDefaultConfirmation()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          {step !== "confirmation" && (
            <div className="md:col-span-2">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><ShoppingBag size={16} className="text-accent" /> Resumo</h3>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-14 object-cover rounded-md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body font-medium text-foreground truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity}x {formatPrice(item.product.promoPrice || item.product.price)}</p>
                      </div>
                      <span className="text-sm font-bold text-accent whitespace-nowrap">{formatPrice((item.product.promoPrice || item.product.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="mb-3">
                    {couponApplied ? (
                      <div className="flex items-center justify-between bg-green-500/10 rounded-lg px-3 py-2">
                        <span className="text-xs font-mono font-bold text-green-500">{couponApplied}</span>
                        <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-foreground">Remover</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Cupom de desconto" className="flex-1 bg-secondary text-foreground px-3 py-2 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground" />
                        <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={couponLoading} className="text-xs">
                          {couponLoading ? "..." : "Aplicar"}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-green-500">Desconto</span>
                      <span className="text-green-500 font-semibold">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground flex items-center gap-1"><Truck size={14} /> Frete</span>
                    <span className={shippingCost === 0 ? "text-green-500 font-semibold" : ""}>
                      {shippingLabel || (shippingCost === 0 ? "Grátis" : formatPrice(shippingCost))}
                    </span>
                  </div>
                  <div className="flex justify-between font-display text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-gradient-gold">{formatPrice(finalTotal)}</span>
                  </div>
                  {paymentMethod === "credit_card" && parseInt(cardForm.installments) > 1 && (
                    <p className="text-xs text-muted-foreground text-right">
                      {cardForm.installments}x de {formatPrice(finalTotal / parseInt(cardForm.installments))}
                    </p>
                  )}
                </div>
                {selectedAddr && step === "payment" && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground font-body mb-1">Entregar em:</p>
                    <p className="text-sm font-body">{selectedAddr.street}, {selectedAddr.number} - {selectedAddr.city}/{selectedAddr.state}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
