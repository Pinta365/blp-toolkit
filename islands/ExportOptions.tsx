import { JSX } from "preact";
import { type ExportFormat } from "../components/ExportFormats.tsx";
import { type BlpExportFormat } from "../components/BlpExporter.tsx";
import AnalysisPanel from "../components/AnalysisPanel.tsx";
import { type AnalysisData } from "../components/ImageAnalyzer.tsx";

interface ExportOptionsProps {
  isPngFile: boolean;
  exportFormats: ExportFormat[];
  selectedFormat: string;
  onFormatChange: (e: JSX.TargetedEvent<HTMLSelectElement>) => void;
  blpExportFormats: BlpExportFormat[];
  selectedBlpFormat: string;
  onBlpFormatChange: (e: JSX.TargetedEvent<HTMLSelectElement>) => void;
  onDownload: () => void;
  onBlpDownload: () => void;
  isGeneratingPreview: boolean;
  isGeneratingBlpPreview: boolean;
  previewBlob: Blob | null;
  previewBlpBlob: Blob | null;
  showAnalysis: boolean;
  onToggleAnalysis: () => void;
  isAnalyzing: boolean;
  analysisError: string | null;
  analysisData: AnalysisData | null;
  file: File | null;
  previewSize: number | null;
}

export default function ExportOptions({
  isPngFile,
  exportFormats,
  selectedFormat,
  onFormatChange,
  blpExportFormats,
  selectedBlpFormat,
  onBlpFormatChange,
  onDownload,
  onBlpDownload,
  isGeneratingPreview,
  isGeneratingBlpPreview,
  previewBlob,
  previewBlpBlob,
  showAnalysis,
  onToggleAnalysis,
  isAnalyzing,
  analysisError,
  analysisData,
  file,
  previewSize,
}: ExportOptionsProps) {
  if (
    (!isPngFile && exportFormats.length === 0) ||
    (isPngFile && blpExportFormats.length === 0)
  ) {
    return null;
  }

  const format = isPngFile
    ? blpExportFormats.find((f) => f.id === selectedBlpFormat)
    : exportFormats.find((f) => f.id === selectedFormat);

  return (
    <>
      <div class="my-6 flex justify-center">
        <div class="w-full h-px bg-gray-200 rounded"></div>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-green-700">
            {isPngFile ? "BLP Export Options:" : "PNG Export Options:"}
          </h3>
          <button
            type="button"
            onClick={onToggleAnalysis}
            class="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            {showAnalysis ? "Hide Analysis" : "Show Analysis"}
          </button>
        </div>

        <AnalysisPanel
          showAnalysis={showAnalysis}
          isAnalyzing={isAnalyzing}
          analysisError={analysisError}
          analysisData={analysisData}
          file={file}
          previewSize={previewSize}
        />

        <div class="mb-4">
          <label
            for="format-select"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Export Format:
          </label>
          <select
            id="format-select"
            value={isPngFile ? selectedBlpFormat : selectedFormat}
            onChange={isPngFile ? onBlpFormatChange : onFormatChange}
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {isPngFile
              ? blpExportFormats.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.name} {format.recommended ? "⭐" : ""}
                </option>
              ))
              : exportFormats.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.name} {format.recommended ? "⭐" : ""}
                </option>
              ))}
          </select>
        </div>

        {format && (
          <div class="mb-4 p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-700 mb-1">
              <span class="font-semibold">{format.name}</span>
            </p>
            <p class="text-xs text-gray-600 mb-2">
              {format.description}
            </p>
            {format.recommended && format.reason && (
              <p class="text-xs text-green-600">
                <span class="font-semibold">Recommended:</span> {format.reason}
              </p>
            )}
          </div>
        )}

        <div class="flex gap-2">
          <button
            type="button"
            onClick={isPngFile ? onBlpDownload : onDownload}
            disabled={isPngFile
              ? (isGeneratingBlpPreview || !previewBlpBlob)
              : (isGeneratingPreview || !previewBlob)}
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPngFile
              ? (isGeneratingBlpPreview ? "Generating..." : "Download BLP")
              : (isGeneratingPreview ? "Generating..." : "Download PNG")}
          </button>
        </div>

        {(isPngFile ? previewBlpBlob : previewBlob) && (
          <p class="text-xs text-gray-600 mt-2">
            File size:{" "}
            {((isPngFile ? previewBlpBlob : previewBlob)!.size / 1024)
              .toFixed(2)} KB
          </p>
        )}
      </div>
    </>
  );
}
