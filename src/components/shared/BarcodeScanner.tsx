import { useRef, useState, useCallback } from "react";
import { Camera, X } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>("");
  const barcodeDetectorRef = useRef<any>(null);

  const stopScanner = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
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

  // Called directly from user click — preserves gesture context
  const startScanner = useCallback(async () => {
    setError(null);
    try {
      // CRITICAL: getUserMedia called directly in click handler
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanning(true);

      // Use BarcodeDetector API if available (Chrome, Edge, Android)
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
        });
        barcodeDetectorRef.current = detector;

        const scanFrame = async () => {
          if (!videoRef.current || !streamRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              handleDetection(barcodes[0].rawValue);
              if (continuous) {
                animFrameRef.current = requestAnimationFrame(scanFrame);
              }
              return;
            }
          } catch {
            // frame not ready
          }
          animFrameRef.current = requestAnimationFrame(scanFrame);
        };
        animFrameRef.current = requestAnimationFrame(scanFrame);
      } else {
        // Fallback: use html5-qrcode library
        try {
          const { Html5Qrcode } = await import("html5-qrcode");
          
          // We already have the stream, stop it and let html5-qrcode manage its own
          stream.getTracks().forEach(t => t.stop());
          streamRef.current = null;
          
          const containerId = "barcode-fallback-container";
          // Wait for DOM element
          await new Promise(r => setTimeout(r, 200));
          
          const el = document.getElementById(containerId);
          if (!el) {
            setError("Não foi possível inicializar o scanner.");
            return;
          }
          
          const scanner = new Html5Qrcode(containerId);
          (barcodeDetectorRef.current as any) = scanner;
          
          await scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 280, height: 160 }, aspectRatio: 1.5 },
            (decodedText: string) => {
              handleDetection(decodedText);
              if (!continuous) {
                try { scanner.stop(); } catch {}
              }
            },
            () => {},
          );
        } catch (fallbackErr) {
          console.error("Fallback scanner error:", fallbackErr);
          setError("Seu navegador não suporta leitura de código de barras. Use Chrome ou Edge.");
        }
      }
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(
        err?.name === "NotAllowedError"
          ? "Permissão de câmera negada. Habilite nas configurações do navegador."
          : "Não foi possível acessar a câmera. Verifique se há uma câmera disponível."
      );
    }
  }, [handleDetection, continuous]);

  const handleClose = () => {
    stopScanner();
    // Also stop html5-qrcode if it was used as fallback
    if (barcodeDetectorRef.current && typeof barcodeDetectorRef.current.stop === "function") {
      try { barcodeDetectorRef.current.stop(); } catch {}
    }
    barcodeDetectorRef.current = null;
    onOpenChange(false);
  };

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
          {/* Scanner viewport */}
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            {/* Native BarcodeDetector uses video element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              style={{ display: scanning && "BarcodeDetector" in window ? "block" : "none" }}
            />
            {/* Fallback container for html5-qrcode */}
            <div
              id="barcode-fallback-container"
              className="w-full h-full"
              style={{ display: !("BarcodeDetector" in window) ? "block" : "none" }}
            />

            {/* Overlay guide */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border-2 border-primary/60 rounded-lg w-[280px] h-[160px] relative">
                  <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  <div className="absolute inset-x-4 h-0.5 bg-primary/80 animate-[scanline_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {/* Start button overlay when not scanning */}
            {!scanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={startScanner} className="gap-2">
                  <Camera size={18} /> Iniciar Câmera
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {scanning ? "Posicione o código de barras dentro da área de leitura" : "Clique em 'Iniciar Câmera' para começar"}
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
            <Button variant="outline" className="flex-1 text-xs" onClick={handleClose}>
              <X size={14} className="mr-1" /> {continuous ? "Fechar Scanner" : "Cancelar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
