import {
  BLPColorEncoding,
  BLPPixelFormat,
  decodePNGData,
  encodeToBLP,
  ResizeMode,
} from "@pinta365/blp";

export interface BlpExportFormat {
  id: string;
  name: string;
  description: string;
  compression: BLPColorEncoding;
  preferredFormat: BLPPixelFormat;
  alphaSize: number;
  generateMipmaps: boolean;
  resizeMode: ResizeMode;
  autoResize: boolean;
  recommended?: boolean;
  reason?: string;
}

export const BLP_EXPORT_FORMATS: BlpExportFormat[] = [
  {
    id: "dxt1",
    name: "DXT1 (No Alpha)",
    description:
      "DXT1 compression without alpha channel. Best for opaque textures.",
    compression: BLPColorEncoding.DXT,
    preferredFormat: BLPPixelFormat.DXT1,
    alphaSize: 0,
    generateMipmaps: true,
    resizeMode: ResizeMode.PAD_CENTER,
    autoResize: true,
    recommended: true,
    reason: "Most common format for opaque textures",
  },
  {
    id: "dxt3",
    name: "DXT3 (Sharp Alpha)",
    description:
      "DXT3 compression with sharp alpha channel. Good for textures with binary transparency.",
    compression: BLPColorEncoding.DXT,
    preferredFormat: BLPPixelFormat.DXT3,
    alphaSize: 4,
    generateMipmaps: true,
    resizeMode: ResizeMode.PAD_CENTER,
    autoResize: true,
    recommended: false,
    reason: "Good for textures with sharp alpha edges",
  },
  {
    id: "dxt5",
    name: "DXT5 (Smooth Alpha)",
    description:
      "DXT5 compression with smooth alpha channel. Best for textures with gradient transparency.",
    compression: BLPColorEncoding.DXT,
    preferredFormat: BLPPixelFormat.DXT5,
    alphaSize: 8,
    generateMipmaps: true,
    resizeMode: ResizeMode.PAD_CENTER,
    autoResize: true,
    recommended: true,
    reason: "Best for textures with smooth alpha gradients",
  },
  {
    id: "palette-8",
    name: "Palette (8-bit Alpha)",
    description:
      "Palettized compression with 8-bit alpha. Good for textures with limited colors.",
    compression: BLPColorEncoding.PALETTE,
    preferredFormat: BLPPixelFormat.DXT1,
    alphaSize: 8,
    generateMipmaps: true,
    resizeMode: ResizeMode.PAD_CENTER,
    autoResize: true,
    recommended: false,
    reason: "Good for textures with limited color palette",
  },
  {
    id: "palette-1",
    name: "Palette (1-bit Alpha)",
    description:
      "Palettized compression with 1-bit alpha. Good for textures with binary transparency.",
    compression: BLPColorEncoding.PALETTE,
    preferredFormat: BLPPixelFormat.DXT1,
    alphaSize: 1,
    generateMipmaps: true,
    resizeMode: ResizeMode.PAD_CENTER,
    autoResize: true,
    recommended: false,
    reason: "Good for textures with binary transparency",
  },
  {
    id: "uncompressed",
    name: "Uncompressed (ARGB8888)",
    description:
      "Uncompressed ARGB8888 format. Largest file size but highest quality.",
    compression: BLPColorEncoding.ARGB8888,
    preferredFormat: BLPPixelFormat.ARGB8888,
    alphaSize: 8,
    generateMipmaps: true,
    resizeMode: ResizeMode.PAD_CENTER,
    autoResize: true,
    recommended: false,
    reason: "Highest quality but largest file size",
  },
];

export async function exportToBlp(
  pngData: Uint8Array,
  format: BlpExportFormat,
): Promise<Uint8Array> {
  const decodedImage = await decodePNGData(pngData);

  return encodeToBLP(decodedImage, {
    compression: format.compression,
    alphaSize: format.alphaSize,
    preferredFormat: format.preferredFormat,
    generateMipmaps: format.generateMipmaps,
    resizeMode: format.resizeMode,
    autoResize: format.autoResize,
  });
}

export function downloadBlp(
  blpBlob: Blob,
  originalFilename: string,
  format: BlpExportFormat,
): void {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blpBlob);
  const extension = `.${format.id}.blp`;
  link.download = originalFilename.replace(/\.png$/i, extension);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getBlpFilename(
  originalFilename: string,
  format: BlpExportFormat,
): string {
  return originalFilename.replace(/\.png$/i, `.${format.id}.blp`);
}

export function getRecommendedFormats(): BlpExportFormat[] {
  return BLP_EXPORT_FORMATS.filter((f) => f.recommended);
}

export async function getSmartRecommendedFormats(
  pngData: Uint8Array,
): Promise<BlpExportFormat[]> {
  try {
    const decodedImage = await decodePNGData(pngData);

    let hasAlpha = false;
    let hasPartialAlpha = false;
    let alphaPixelCount = 0;

    const pixels = decodedImage.pixels;
    for (let i = 3; i < pixels.length; i += 4) {
      const alpha = pixels[i];
      if (alpha < 255) {
        hasAlpha = true;
        alphaPixelCount++;
        if (alpha > 0 && alpha < 255) {
          hasPartialAlpha = true;
        }
      }
    }

    const smartFormats = BLP_EXPORT_FORMATS.map((format) => {
      let recommended = false;
      let reason = "";

      if (hasAlpha) {
        if (format.id === "dxt5") {
          recommended = true;
          reason = hasPartialAlpha
            ? "Image has smooth alpha gradients - DXT5 provides best quality"
            : "Image has transparency - DXT5 recommended for alpha support";
        } else if (format.id === "dxt3" && !hasPartialAlpha) {
          recommended = true;
          reason = "Image has binary transparency - DXT3 is more efficient";
        } else if (format.id === "dxt1") {
          recommended = false;
          reason =
            "DXT1 doesn't support alpha - not suitable for transparent images";
        }
      } else {
        if (format.id === "dxt1") {
          recommended = true;
          reason = "Opaque image - DXT1 provides best compression";
        } else if (format.id === "dxt5") {
          recommended = false;
          reason = "No alpha needed - DXT1 would be more efficient";
        }
      }

      return {
        ...format,
        recommended,
        reason: recommended ? reason : format.reason,
      };
    });

    return smartFormats.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return 0;
    });
  } catch (error) {
    console.error("Error analyzing PNG for smart recommendations:", error);
    return getRecommendedFormats();
  }
}
