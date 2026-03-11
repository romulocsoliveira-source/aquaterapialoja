import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useStoreData";
import { toast } from "sonner";
import { Camera, Wand2, Loader2, Search } from "lucide-react";
import ImageUpload from "./ImageUpload";
import BarcodeScanner from "@/components/shared/BarcodeScanner";
import BarcodeGenerator, { generateEAN13 } from "@/components/shared/BarcodeGenerator";
import type { Product } from "@/data/products";


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSaved: () => void;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductFormDialog({ open, onOpenChange, product, onSaved }: Props) {
  const { data: categories = [] } = useCategories();
  const isEditing = !!product;

  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: "",
    promo_price: "",
    category: "",
    category_slug: "",
    parent_category: "",
    image: "",
    images: "",
    description: "",
    benefits: "",
    specs: "",
    instructions: "",
    badge: "",
    variations: "",
    is_new: false,
    is_best_seller: false,
    is_active: true,
    sku: "",
    barcode: "",
    stock: "0",
    cost_price: "",
    sales_channel: "all",
    ncm: "",
    cfop: "5102",
    cst: "00",
    unit_measure: "UN",
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        slug: product.slug,
        price: String(product.price),
        promo_price: product.promoPrice ? String(product.promoPrice) : "",
        category: product.category,
        category_slug: product.categorySlug,
        parent_category: product.parentCategory || "",
        image: product.image,
        images: (product.images || []).join("\n"),
        description: product.description,
        benefits: (product.benefits || []).join("\n"),
        specs: (product.specs || []).join("\n"),
        instructions: product.instructions || "",
        badge: product.badge || "",
        variations: (product.variations || []).join(", "),
        is_new: product.isNew || false,
        is_best_seller: product.isBestSeller || false,
        is_active: true,
        sku: product.sku,
        barcode: product.barcode,
        stock: String(product.stock),
        cost_price: product.costPrice ? String(product.costPrice) : "",
        sales_channel: "all",
        ncm: (product as any).ncm || "",
        cfop: (product as any).cfop || "5102",
        cst: (product as any).cst || "00",
        unit_measure: (product as any).unit_measure || "UN",
      });
    } else {
      setForm({
        name: "", slug: "", price: "", promo_price: "", category: "", category_slug: "",
        parent_category: "", image: "", images: "", description: "", benefits: "", specs: "",
        instructions: "", badge: "", variations: "", is_new: false, is_best_seller: false,
        is_active: true, sku: "", barcode: "", stock: "0", cost_price: "", sales_channel: "all",
        ncm: "", cfop: "5102", cst: "00", unit_measure: "UN",
      });
    }
  }, [product, open]);

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: isEditing ? f.slug : slugify(name) }));
  };

  const lookupBarcode = async (code: string) => {
    if (!code || code.length < 8) {
      toast.error("Código de barras deve ter pelo menos 8 dígitos");
      return;
    }
    setLookingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke("barcode-lookup", {
        body: { barcode: code },
      });
      if (error) throw error;
      if (data?.success && data?.data) {
        const info = data.data;
        setForm(f => ({
          ...f,
          barcode: code,
          name: info.name && !f.name ? info.name : f.name,
          slug: info.name && !f.name ? slugify(info.name) : f.slug,
          description: info.description && !f.description ? info.description : f.description,
          image: info.image && !f.image ? info.image : f.image,
        }));
        toast.success(`Produto encontrado: ${info.name || code} (${data.source})`);
      } else {
        toast.info("Produto não encontrado nas bases públicas. Preencha manualmente.");
      }
    } catch (err: any) {
      console.error("Barcode lookup error:", err);
      toast.info("Não foi possível consultar bases de dados. Preencha manualmente.");
    } finally {
      setLookingUp(false);
    }
  };

  const handleBarcodeScan = (code: string) => {
    setForm(f => ({ ...f, barcode: code }));
    toast.success("Código lido: " + code);
    lookupBarcode(code);
  };

  const handleCategorySelect = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    if (cat) {
      setForm(f => ({ ...f, category: cat.name, category_slug: cat.slug, parent_category: cat.parent || "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.barcode || !form.price || !form.category_slug) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setLoading(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      price: Number(form.price),
      promo_price: form.promo_price ? Number(form.promo_price) : null,
      category: form.category.trim(),
      category_slug: form.category_slug.trim(),
      parent_category: form.parent_category || null,
      image: form.image.trim() || null,
      images: form.images.split("\n").map(s => s.trim()).filter(Boolean),
      description: form.description.trim() || null,
      benefits: form.benefits.split("\n").map(s => s.trim()).filter(Boolean),
      specs: form.specs.split("\n").map(s => s.trim()).filter(Boolean),
      instructions: form.instructions.trim() || null,
      badge: form.badge.trim() || null,
      variations: form.variations.split(",").map(s => s.trim()).filter(Boolean),
      is_new: form.is_new,
      is_best_seller: form.is_best_seller,
      is_active: form.is_active,
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      stock: Number(form.stock) || 0,
      cost_price: form.cost_price ? Number(form.cost_price) : 0,
      sales_channel: form.sales_channel,
      ncm: form.ncm.trim(),
      cfop: form.cfop.trim(),
      cst: form.cst.trim(),
      unit_measure: form.unit_measure.trim(),
    };

    try {
      if (isEditing && product) {
        const { error } = await supabase.from("store_products").update(payload).eq("id", product.id);
        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase.from("store_products").insert(payload);
        if (error) throw error;
        toast.success("Produto criado!");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  const parentCategories = categories.filter(c => !c.parent);
  const subCategories = categories.filter(c => !!c.parent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Nome do produto" required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="slug-do-produto" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>SKU *</Label>
              <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU001" required />
            </div>
            <div className="space-y-2">
              <Label>Código de Barras *</Label>
              <div className="flex gap-1">
                <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="7891234567890" required className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={() => setShowBarcodeScanner(true)} title="Escanear câmera">
                  <Camera size={16} />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => lookupBarcode(form.barcode)} title="Buscar produto pelo código" disabled={lookingUp || !form.barcode}>
                  <Search size={16} />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => setForm(f => ({ ...f, barcode: generateEAN13() }))} title="Gerar EAN-13">
                  <Wand2 size={16} />
                </Button>
              </div>
              {form.barcode && (
                <div className="bg-white rounded p-2 flex justify-center">
                  <BarcodeGenerator value={form.barcode} height={40} width={1.5} />
                </div>
              )}
            </div>
            <BarcodeScanner
              open={showBarcodeScanner}
              onOpenChange={setShowBarcodeScanner}
              onScan={handleBarcodeScan}
              title="Ler Código de Barras"
            />

            {lookingUp && (
              <div className="col-span-full flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-lg p-2">
                <Loader2 size={14} className="animate-spin" />
                Consultando bases de dados públicas...
              </div>
            )}

            <div className="space-y-2">
              <Label>Estoque</Label>
              <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Preço de Custo</Label>
              <Input type="number" step="0.01" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} placeholder="50.00" />
            </div>
            <div className="space-y-2">
              <Label>Preço de Venda *</Label>
              <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="99.90" required />
            </div>
            <div className="space-y-2">
              <Label>Preço Promocional</Label>
              <Input type="number" step="0.01" value={form.promo_price} onChange={e => setForm(f => ({ ...f, promo_price: e.target.value }))} placeholder="79.90" />
            </div>
          </div>
          {/* Margin indicator */}
          {form.cost_price && form.price && (
            <div className="bg-secondary rounded-lg p-3 flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Lucro: </span>
                <span className="font-bold text-green-400">
                  R$ {(Number(form.promo_price || form.price) - Number(form.cost_price)).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Margem: </span>
                <span className="font-bold text-accent">
                  {((1 - Number(form.cost_price) / Number(form.promo_price || form.price)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={form.category_slug} onValueChange={handleCategorySelect}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {subCategories.length > 0 ? subCategories.map(c => (
                    <SelectItem key={c.slug} value={c.slug}>{c.parent ? `${c.parent} › ` : ""}{c.name}</SelectItem>
                  )) : parentCategories.map(c => (
                    <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Novo, Oferta, etc." />
            </div>
          </div>

          {/* Image Upload */}
          <ImageUpload
            value={form.image}
            onChange={url => setForm(f => ({ ...f, image: url }))}
            label="Imagem Principal"
          />
          <div className="space-y-2">
            <Label>Ou cole uma URL de imagem</Label>
            <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Imagens Adicionais (uma URL por linha)</Label>
            <Textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} rows={3} placeholder="https://img1.jpg&#10;https://img2.jpg" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>

          {/* Benefits / Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Benefícios (um por linha)</Label>
              <Textarea value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Especificações (um por linha)</Label>
              <Textarea value={form.specs} onChange={e => setForm(f => ({ ...f, specs: e.target.value }))} rows={3} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instruções de Uso</Label>
            <Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Variações (separadas por vírgula)</Label>
            <Input value={form.variations} onChange={e => setForm(f => ({ ...f, variations: e.target.value }))} placeholder="P, M, G, GG" />
          </div>

          {/* Fiscal Fields */}
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dados Fiscais</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>NCM</Label>
                <Input value={form.ncm} onChange={e => setForm(f => ({ ...f, ncm: e.target.value }))} placeholder="6108.21.00" />
              </div>
              <div className="space-y-2">
                <Label>CFOP</Label>
                <Input value={form.cfop} onChange={e => setForm(f => ({ ...f, cfop: e.target.value }))} placeholder="5102" />
              </div>
              <div className="space-y-2">
                <Label>CST/CSOSN</Label>
                <Input value={form.cst} onChange={e => setForm(f => ({ ...f, cst: e.target.value }))} placeholder="00" />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input value={form.unit_measure} onChange={e => setForm(f => ({ ...f, unit_measure: e.target.value }))} placeholder="UN" />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_new} onCheckedChange={v => setForm(f => ({ ...f, is_new: v }))} />
              <Label>Novo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_best_seller} onCheckedChange={v => setForm(f => ({ ...f, is_best_seller: v }))} />
              <Label>Mais Vendido</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="gradient-purple-pink text-primary-foreground">
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {isEditing ? "Atualizar" : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
