import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
}

export default function BarcodeGenerator({ value, width = 2, height = 60, displayValue = true, className }: BarcodeGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "auto",
          width,
          height,
          displayValue,
          fontSize: 12,
          margin: 5,
          lineColor: "#000",
          background: "#fff",
        });
      } catch {
        // fallback: try CODE128
        try {
          JsBarcode(svgRef.current, value, {
            format: "CODE128",
            width,
            height,
            displayValue,
            fontSize: 12,
            margin: 5,
            lineColor: "#000",
            background: "#fff",
          });
        } catch {
          // can't generate
        }
      }
    }
  }, [value, width, height, displayValue]);

  if (!value) return null;

  return <svg ref={svgRef} className={className} />;
}

export function generateEAN13(): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  // Checksum
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return digits.join("") + check;
}
