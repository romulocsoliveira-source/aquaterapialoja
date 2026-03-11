import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, X, Flashlight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => void;
  title?: string;
  continuous?: boolean;
}

export default function BarcodeScanner({ open, onOpenChange, onScan, title = "Escanear Código de Barras", continuous = false }: BarcodeScannerProps) {
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>("");
  const containerId = "barcode-scanner-container";
  const autoStartedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState?.();
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
    setLastScanned(null);
  }, []);

  const handleDetection = useCallback((code: string) => {
    const now = Date.now();
    if (code === lastScannedCodeRef.current && now - lastScannedTimeRef.current < 2000) return;
    lastScannedTimeRef.current = now;
    lastScannedCodeRef.current = code;
    setLastScanned(code);
    onScan(code);
    if (!continuous) {
      stopScanner();
      onOpenChange(false);
    }
  }, [continuous, onScan, onOpenChange, stopScanner]);

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      await new Promise(r => setTimeout(r, 400));

      const el = document.getElementById(containerId);
      if (!el) {
        setError("Não foi possível inicializar o scanner.");
        return;
      }

      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch {}
        try { scannerRef.current.clear(); } catch {}
      }

      const scanner = new Html5Qrcode(containerId, {
        verbose: false,
        formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      } as any);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 280, height: 120 },
          aspectRatio: 1.7778,
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
            advanced: [
              { focusMode: "continuous" } as any,
              { exposureMode: "continuous" } as any,
              { whiteBalanceMode: "continuous" } as any,
            ],
          } as any,
        },
        (decodedText: string) => {
          handleDetection(decodedText);
        },
        () => {},
      );
      setScanning(true);

      // Try to apply advanced constraints for better image quality
      try {
        const videoElem = el.querySelector("video");
        if (videoElem && videoElem.srcObject) {
          const track = (videoElem.srcObject as MediaStream).getVideoTracks()[0];
          if (track) {
            const caps = track.getCapabilities?.() as any;
            const constraints: any = {};
            if (caps?.focusMode?.includes("continuous")) constraints.focusMode = "continuous";
            if (caps?.exposureMode?.includes("continuous")) constraints.exposureMode = "continuous";
            if (caps?.torch) constraints.torch = true;
            if (Object.keys(constraints).length > 0) {
              await track.applyConstraints({ advanced: [constraints] });
            }
          }
        }
      } catch {}
    } catch (err: any) {
      console.error("Scanner error:", err);
      if (err?.message?.includes("NotAllowed") || err?.name === "NotAllowedError") {
        setError("Permissão de câmera negada. Habilite nas configurações do navegador.");
      } else if (err?.message?.includes("NotFound") || err?.name === "NotFoundError") {
        setError("Nenhuma câmera encontrada neste dispositivo.");
      } else {
        setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
      }
    }
  }, [handleDetection]);

  const handleClose = useCallback(async () => {
    await stopScanner();
    autoStartedRef.current = false;
    onOpenChange(false);
  }, [stopScanner, onOpenChange]);

  // Auto-start camera when dialog opens
  useEffect(() => {
    if (open && !autoStartedRef.current) {
      autoStartedRef.current = true;
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => startScanner(), 600);
      return () => clearTimeout(timer);
    }
    if (!open) {
      autoStartedRef.current = false;
      stopScanner();
    }
  }, [open, startScanner, stopScanner]);

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Camera size={18} className="text-primary" />
            {title}
            {continuous && (
              <span className="ml-auto text-[10px] font-normal bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                Contínuo
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black" style={{ minHeight: 260 }}>
            <div id={containerId} className="w-full" style={{ minHeight: 260 }} />

            {scanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border-2 border-primary/60 rounded-lg w-[280px] h-[120px] relative">
                  <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  <div className="absolute top-0 left-2 right-2 h-0.5 bg-primary animate-pulse" 
                       style={{ animation: 'scanLine 2s ease-in-out infinite' }} />
                </div>
              </div>
            )}

            {!scanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center space-y-3">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-white/70 text-xs">Iniciando câmera...</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {scanning 
              ? "Posicione o código de barras dentro da área marcada. Mantenha o celular firme." 
              : error ? "" : "Aguarde a câmera iniciar..."}
          </p>

          {continuous && lastScanned && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-2 text-xs text-center text-accent font-mono">
              ✓ Último lido: {lastScanned}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-xs text-destructive text-center">
              {error}
              <Button variant="outline" size="sm" className="mt-2 w-full text-xs" onClick={startScanner}>
                Tentar Novamente
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            {scanning && (
              <Button variant="outline" className="flex-1 text-xs" onClick={() => { stopScanner(); startScanner(); }}>
                <Camera size={14} className="mr-1" /> Reiniciar Câmera
              </Button>
            )}
            <Button variant="outline" className="flex-1 text-xs" onClick={handleClose}>
              <X size={14} className="mr-1" /> {continuous ? "Fechar Scanner" : "Cancelar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
