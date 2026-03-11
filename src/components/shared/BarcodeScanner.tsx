import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => void;
  title?: string;
}

export default function BarcodeScanner({ open, onOpenChange, onScan, title = "Escanear Código de Barras" }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const containerId = "barcode-scanner-container";

  const stopScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current?.clear();
    } catch {
      // ignore
    }
    scannerRef.current = null;
    setScanning(false);
  };

  const startScanner = async () => {
    setError(null);
    try {
      await stopScanner();

      // Small delay to ensure DOM is ready
      await new Promise((r) => setTimeout(r, 300));

      const el = document.getElementById(containerId);
      if (!el) return;

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
          onOpenChange(false);
        },
        () => {
          // ignore errors during scanning
        },
      );
      setScanning(true);
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(
        err?.message?.includes("NotAllowedError") || err?.message?.includes("Permission")
          ? "Permissão de câmera negada. Habilite nas configurações do navegador."
          : "Não foi possível acessar a câmera. Verifique se há uma câmera disponível.",
      );
    }
  };

  useEffect(() => {
    if (open) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) stopScanner();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Camera size={18} className="text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-3">
          {/* Scanner viewport */}
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <div id={containerId} className="w-full h-full" />

            {/* Overlay guide */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border-2 border-primary/60 rounded-lg w-[280px] h-[160px] relative">
                  <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  {/* Scanning line animation */}
                  <div className="absolute inset-x-4 h-0.5 bg-primary/80 animate-[scanline_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Posicione o código de barras dentro da área de leitura
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-xs text-destructive text-center">
              {error}
              <Button variant="outline" size="sm" className="mt-2 w-full text-xs" onClick={startScanner}>
                Tentar Novamente
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => onOpenChange(false)}>
              <X size={14} className="mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
