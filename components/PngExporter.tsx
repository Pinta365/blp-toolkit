import {
  decodeBlpData,
  encodeToGrayscaleAlphaPNG,
  encodeToGrayscalePNG,
  encodeToPalettePNG,
  encodeToPNG,
  encodeToRGBPNG,
} from "@pinta365/blp";
import type { ExportFormat } from "./ExportFormats.tsx";

export async function exportToPng(
  data: Uint8Array,
  format: ExportFormat,
): Promise<Uint8Array> {
  const decoded = decodeBlpData(data);

  switch (format.id) {
    case "grayscale-8":
      return await encodeToGrayscalePNG(decoded, 8);
    case "grayscale-4":
      return await encodeToGrayscalePNG(decoded, 4);
    case "rgb-8":
      return await encodeToRGBPNG(decoded, 8);
    case "palette-8":
      return await encodeToPalettePNG(decoded, 8);
    case "palette-4":
      return await encodeToPalettePNG(decoded, 4);
    case "grayscale-alpha-8":
      return await encodeToGrayscaleAlphaPNG(decoded, 8);
    default:
      return await encodeToPNG(decoded, {
        colorType: format.colorType,
        bitDepth: format.bitDepth,
      });
  }
}

export function downloadPng(
  pngBlob: Blob,
  originalFilename: string,
  format: ExportFormat,
): void {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(pngBlob);
  const extension = format
    ? `.${format.name.split(" ")[0].toLowerCase()}.png`
    : ".png";
  link.download = originalFilename.replace(/\.blp$/i, extension);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getPngFilename(
  originalFilename: string,
  format: ExportFormat,
): string {
  const formatName = format ? format.name.split(" ")[0].toLowerCase() : "png";
  return originalFilename.replace(/\.blp$/i, `.${formatName}.png`);
}
