import { useRef } from "react";
import BarcodeGenerator from "./BarcodeGenerator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, Tag } from "lucide-react";

interface Product {
  name: string;
  price: number;
  promoPrice?: number | null;
  barcode: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}

export default function ProductLabelPrint({ open, onOpenChange, products }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=600,height=800");
    if (!win || !contentRef.current) return;
    win.document.write(`
      <html><head><title>Etiquetas</title>
      <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px; }
        .label { border: 1px dashed #ccc; padding: 8px; text-align: center; page-break-inside: avoid; }
        .name { font-size: 10px; font-weight: bold; margin-bottom: 4px; line-height: 1.2; max-height: 2.4em; overflow: hidden; }
        .price { font-size: 14px; font-weight: bold; margin: 4px 0; }
        .promo { text-decoration: line-through; font-size: 10px; color: #999; }
        svg { max-width: 100%; height: auto; }
        @media print { .grid { gap: 4px; padding: 4px; } }
      </style></head><body>
      ${contentRef.current.innerHTML}
      <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag size={18} className="text-primary" /> Etiquetas de Produtos
          </DialogTitle>
        </DialogHeader>

        <div ref={contentRef}>
          <div className="grid grid-cols-3 gap-2">
            {products.map((p, i) => (
              <div key={i} className="border border-dashed border-border rounded-lg p-2 text-center bg-white text-black">
                <p className="text-[10px] font-bold leading-tight line-clamp-2">{p.name}</p>
                {p.promoPrice ? (
                  <>
                    <p className="text-[10px] line-through text-gray-400">{formatPrice(p.price)}</p>
                    <p className="text-sm font-bold">{formatPrice(p.promoPrice)}</p>
                  </>
                ) : (
                  <p className="text-sm font-bold mt-1">{formatPrice(p.price)}</p>
                )}
                <BarcodeGenerator value={p.barcode} width={1.5} height={35} displayValue className="mx-auto" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer size={14} /> Imprimir Etiquetas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
