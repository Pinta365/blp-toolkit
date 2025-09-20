import { type ExportFormat } from "./ExportFormats.tsx";
import { getPngFilename } from "./PngExporter.tsx";
import { type BlpExportFormat, getBlpFilename } from "./BlpExporter.tsx";

interface PreviewSectionProps {
  pngUrl: string | null;
  file: File | null;
  isPngFile: boolean;
  isGeneratingPreview: boolean;
  previewPngUrl: string | null;
  exportFormats: ExportFormat[];
  selectedFormat: string;
  blpExportFormats: BlpExportFormat[];
  selectedBlpFormat: string;
}

export default function PreviewSection({
  pngUrl,
  file,
  isPngFile,
  isGeneratingPreview,
  previewPngUrl,
  exportFormats,
  selectedFormat,
  blpExportFormats,
  selectedBlpFormat,
}: PreviewSectionProps) {
  if (!pngUrl) return null;

  return (
    <>
      <div class="my-6 flex justify-center">
        <div class="w-full h-px bg-gray-200 rounded"></div>
      </div>
      <div class="flex justify-center gap-4">
        <div class="flex flex-col items-center">
          <img
            src={pngUrl}
            alt={`${isPngFile ? "PNG" : "BLP"} file preview - ${
              file?.name || "uploaded file"
            }`}
            class="max-w-xs border border-gray-200 rounded-xl shadow-md"
            loading="lazy"
          />
          <p class="text-sm text-gray-600 mt-2 font-mono">{file?.name}</p>
        </div>
        <div class="flex flex-col items-center">
          {isGeneratingPreview
            ? (
              <div class="max-w-xs h-48 border border-gray-200 rounded-xl shadow-md bg-gray-50 flex items-center justify-center">
                <div class="text-gray-500">Generating preview...</div>
              </div>
            )
            : previewPngUrl
            ? (
              <img
                src={previewPngUrl}
                alt={`Converted ${isPngFile ? "BLP" : "PNG"} preview - ${
                  file?.name || "uploaded file"
                }`}
                class="max-w-xs border border-gray-200 rounded-xl shadow-md"
                loading="lazy"
              />
            )
            : (
              <div class="max-w-xs h-48 border border-gray-200 rounded-xl shadow-md bg-gray-50 flex items-center justify-center">
                <div class="text-gray-500">No preview</div>
              </div>
            )}
          <p class="text-sm text-gray-600 mt-2 font-mono">
            {file && !isPngFile
              ? getPngFilename(
                file.name,
                exportFormats.find((f) => f.id === selectedFormat) ||
                  exportFormats[0],
              )
              : file && isPngFile
              ? getBlpFilename(
                file.name,
                blpExportFormats.find((f) => f.id === selectedBlpFormat) ||
                  blpExportFormats[0],
              )
              : file?.name || ""}
          </p>
        </div>
      </div>
    </>
  );
}
