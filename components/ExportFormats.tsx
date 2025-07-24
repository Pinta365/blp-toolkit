import { PNGColorType } from "@pinta365/blp";
import type { BlpHeader } from "./BlpAnalyzer.tsx";
import type { AnalysisData } from "./ImageAnalyzer.tsx";

export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  colorType: PNGColorType;
  bitDepth: number;
  recommended: boolean;
  reason?: string;
}

export function getExportFormats(): ExportFormat[] {
  return [
    {
      id: "rgba-8",
      name: "RGBA (8-bit)",
      description: "Full color with alpha channel",
      colorType: PNGColorType.RGBA,
      bitDepth: 8,
      recommended: false,
    },
    {
      id: "rgb-8",
      name: "RGB (8-bit)",
      description: "Full color without alpha",
      colorType: PNGColorType.RGB,
      bitDepth: 8,
      recommended: false,
    },
    {
      id: "grayscale-8",
      name: "Grayscale (8-bit)",
      description: "Black and white",
      colorType: PNGColorType.GRAYSCALE,
      bitDepth: 8,
      recommended: false,
    },
    {
      id: "grayscale-4",
      name: "Grayscale (4-bit)",
      description: "16 shades of gray",
      colorType: PNGColorType.GRAYSCALE,
      bitDepth: 4,
      recommended: false,
    },
    {
      id: "palette-8",
      name: "Palette (8-bit)",
      description: "256 colors with automatic reduction",
      colorType: PNGColorType.PALETTE,
      bitDepth: 8,
      recommended: false,
    },
    {
      id: "palette-4",
      name: "Palette (4-bit)",
      description: "16 colors with automatic reduction",
      colorType: PNGColorType.PALETTE,
      bitDepth: 4,
      recommended: false,
    },
    {
      id: "grayscale-alpha-8",
      name: "Grayscale + Alpha (8-bit)",
      description: "Grayscale with transparency",
      colorType: PNGColorType.GRAYSCALE_ALPHA,
      bitDepth: 8,
      recommended: false,
    },
  ];
}

export function getRecommendedFormats(
  header: BlpHeader,
  analysisData?: AnalysisData,
): ExportFormat[] {
  const formats = getExportFormats();

  if (analysisData) {
    formats.forEach((f) => {
      f.recommended = false;
      f.reason = undefined;
    });

    const alphaCoverage = (analysisData.alphaStats.alphaPixels /
      analysisData.alphaStats.totalPixels) * 100;
    const hasAlpha = alphaCoverage > 0;

    const { histogram } = analysisData;
    const hasColor = (() => {
      const rSum = histogram.r.reduce((sum, count) => sum + count, 0);
      const gSum = histogram.g.reduce((sum, count) => sum + count, 0);
      const bSum = histogram.b.reduce((sum, count) => sum + count, 0);

      if (rSum === gSum && gSum === bSum) {
        for (let i = 0; i < 256; i++) {
          if (
            histogram.r[i] !== histogram.g[i] ||
            histogram.g[i] !== histogram.b[i]
          ) {
            return true;
          }
        }
        return false;
      }
      return true;
    })();

    if (hasAlpha) {
      const rgbaFormat = formats.find((f) => f.id === "rgba-8");
      if (rgbaFormat) {
        rgbaFormat.recommended = true;
        rgbaFormat.reason = `Alpha coverage: ${
          alphaCoverage.toFixed(1)
        }% (preserving transparency)`;
      }
    } else {
      const rgbFormat = formats.find((f) => f.id === "rgb-8");
      if (rgbFormat) {
        rgbFormat.recommended = true;
        rgbFormat.reason = `No alpha content (RGB recommended)`;
      }
    }

    if (header.width <= 32 && header.height <= 32 && !hasAlpha && !hasColor) {
      const grayscale4Format = formats.find((f) => f.id === "grayscale-4");
      if (grayscale4Format) {
        grayscale4Format.recommended = true;
        grayscale4Format.reason =
          "Very small grayscale image - 4-bit grayscale recommended";
      }
    } else if (
      header.width <= 48 && header.height <= 48 && !hasAlpha && hasColor
    ) {
      const palette4Format = formats.find((f) => f.id === "palette-4");
      if (palette4Format) {
        palette4Format.recommended = true;
        palette4Format.reason =
          "Small colored image - palette compression recommended";
      }
    }
  } else {
    if (header.alphaSize === 0) {
      const rgbFormat = formats.find((f) => f.id === "rgb-8");
      if (rgbFormat) {
        rgbFormat.recommended = true;
        rgbFormat.reason = "No alpha channel in source";
      }
    } else {
      const rgbaFormat = formats.find((f) => f.id === "rgba-8");
      if (rgbaFormat) {
        rgbaFormat.recommended = true;
        rgbaFormat.reason = "Source has alpha channel";
      }
    }
  }

  return formats;
}
