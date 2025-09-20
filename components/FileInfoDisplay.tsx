import { PNGColorType, ResizeMode } from "@pinta365/blp";
import { type BlpHeader, getBlpInfo } from "./BlpAnalyzer.tsx";
import { type ExportFormat } from "./ExportFormats.tsx";
import { getPngFilename } from "./PngExporter.tsx";
import { type BlpExportFormat, getBlpFilename } from "./BlpExporter.tsx";

interface FileInfoDisplayProps {
  file: File;
  isPngFile: boolean;
  header: BlpHeader | null;
  exportFormats: ExportFormat[];
  selectedFormat: string;
  previewSize: number | null;
  blpExportFormats: BlpExportFormat[];
  selectedBlpFormat: string;
  previewBlpSize: number | null;
}

export default function FileInfoDisplay({
  file,
  isPngFile,
  header,
  exportFormats,
  selectedFormat,
  previewSize,
  blpExportFormats,
  selectedBlpFormat,
  previewBlpSize,
}: FileInfoDisplayProps) {
  return (
    <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4 text-blue-700">
          {isPngFile ? "PNG File Information:" : "BLP File Information:"}
        </h3>
        <ul class="space-y-1 text-gray-800">
          <li>
            <span class="font-bold">Name:</span> {file.name}
          </li>
          <li>
            <span class="font-bold">Type:</span>{" "}
            {file.type || (isPngFile ? "image/png" : "image/blp")}
          </li>
          <li>
            <span class="font-bold">Size:</span> {(file.size / 1024).toFixed(2)}
            {" "}
            KB
          </li>
          {!isPngFile && header && (() => {
            const info = getBlpInfo(header);
            return (
              <>
                <li>
                  <span class="font-bold">BLP Type:</span> {info.magic}
                </li>
                <li>
                  <span class="font-bold">Compression:</span> {info.compression}
                </li>
                <li>
                  <span class="font-bold">DXT Type:</span> {info.dxtType}
                </li>
                <li>
                  <span class="font-bold">Alpha:</span> {info.alpha}
                </li>
                <li>
                  <span class="font-bold">Mipmaps:</span> {info.mipmaps}
                </li>
                <li>
                  <span class="font-bold">Width:</span> {info.width}
                </li>
                <li>
                  <span class="font-bold">Height:</span> {info.height}
                </li>
              </>
            );
          })()}
        </ul>
      </div>
      {!isPngFile && exportFormats.length > 0 && (() => {
        const format = exportFormats.find((f) => f.id === selectedFormat);
        if (!format) return null;

        return (
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4 text-green-700">
              PNG Export Information:
            </h3>
            <ul class="space-y-1 text-gray-800">
              <li>
                <span class="font-bold">Output Name:</span>{" "}
                {getPngFilename(file.name, format)}
              </li>
              <li>
                <span class="font-bold">Format:</span> {format.name}
              </li>
              {previewSize && (
                <li>
                  <span class="font-bold">Expected file Size:</span>{" "}
                  {(previewSize / 1024).toFixed(2)} KB
                </li>
              )}
              <li>
                <span class="font-bold">Color Type:</span> {(() => {
                  switch (format.colorType) {
                    case PNGColorType.RGBA:
                      return "RGBA (RGB + Alpha)";
                    case PNGColorType.RGB:
                      return "RGB (RGB only)";
                    case PNGColorType.GRAYSCALE:
                      return "Grayscale";
                    case PNGColorType.PALETTE:
                      return "Indexed (Palette)";
                    case PNGColorType.GRAYSCALE_ALPHA:
                      return "Grayscale + Alpha";
                    default:
                      return `Unknown (${format.colorType})`;
                  }
                })()}
              </li>
              <li>
                <span class="font-bold">Bit Depth:</span> {format.bitDepth}-bit
              </li>
              <li>
                <span class="font-bold">Max Colors:</span> {(() => {
                  switch (format.colorType) {
                    case PNGColorType.RGBA:
                      return "16.7M + Alpha";
                    case PNGColorType.RGB:
                      return "16.7M";
                    case PNGColorType.GRAYSCALE:
                      return format.bitDepth === 4 ? "16 shades" : "256 shades";
                    case PNGColorType.PALETTE:
                      return format.bitDepth === 4 ? "16 colors" : "256 colors";
                    case PNGColorType.GRAYSCALE_ALPHA:
                      return "256 shades + Alpha";
                    default:
                      return "Unknown";
                  }
                })()}
              </li>
              <li>
                <span class="font-bold">Transparency:</span> {(() => {
                  switch (format.colorType) {
                    case PNGColorType.RGBA:
                      return "Full alpha channel";
                    case PNGColorType.RGB:
                      return "None";
                    case PNGColorType.GRAYSCALE:
                      return "None";
                    case PNGColorType.PALETTE:
                      return "Palette-based";
                    case PNGColorType.GRAYSCALE_ALPHA:
                      return "Grayscale alpha";
                    default:
                      return "Unknown";
                  }
                })()}
              </li>
              {format.recommended && (
                <li class="pt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ⭐ Recommended: {format.reason}
                  </span>
                </li>
              )}
            </ul>
          </div>
        );
      })()}
      {isPngFile && blpExportFormats.length > 0 && (() => {
        const format = blpExportFormats.find((f) => f.id === selectedBlpFormat);
        if (!format) return null;

        return (
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold mb-4 text-green-700">
              BLP Export Information:
            </h3>
            <ul class="space-y-1 text-gray-800">
              <li>
                <span class="font-bold">Output Name:</span>{" "}
                {getBlpFilename(file.name, format)}
              </li>
              <li>
                <span class="font-bold">Format:</span> {format.name}
              </li>
              {previewBlpSize && (
                <li>
                  <span class="font-bold">Expected file Size:</span>{" "}
                  {(previewBlpSize / 1024).toFixed(2)} KB
                </li>
              )}
              <li>
                <span class="font-bold">Compression:</span> {(() => {
                  switch (format.compression) {
                    case 1:
                      return "Palettized (RAW1)";
                    case 2:
                      return "DXT-compressed";
                    case 3:
                      return "Uncompressed (ARGB8888)";
                    default:
                      return `Unknown (${format.compression})`;
                  }
                })()}
              </li>
              <li>
                <span class="font-bold">Alpha Size:</span>{" "}
                {format.alphaSize}-bit
              </li>
              <li>
                <span class="font-bold">Mipmaps:</span>{" "}
                {format.generateMipmaps ? "Yes" : "No"}
              </li>
              <li>
                <span class="font-bold">Auto Resize:</span>{" "}
                {format.autoResize ? "Yes" : "No"}
              </li>
              <li>
                <span class="font-bold">Resize Mode:</span> {(() => {
                  switch (format.resizeMode) {
                    case ResizeMode.FORCE:
                      return "Force resize";
                    case ResizeMode.PAD:
                      return "Pad to power of 2";
                    case ResizeMode.PAD_CENTER:
                      return "Center pad to power of 2";
                    default:
                      return `Unknown (${format.resizeMode})`;
                  }
                })()}
              </li>
              {format.recommended && (
                <li class="pt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ⭐ Recommended: {format.reason}
                  </span>
                </li>
              )}
            </ul>
          </div>
        );
      })()}
    </div>
  );
}
