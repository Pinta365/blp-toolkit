import { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import { parseBlpHeader, PNGColorType, ResizeMode } from "@pinta365/blp";
import { useEffect } from "preact/hooks";

import { type BlpHeader, getBlpInfo } from "../components/BlpAnalyzer.tsx";
import {
  type AnalysisData,
  generateAnalysis,
} from "../components/ImageAnalyzer.tsx";
import {
  type ExportFormat,
  getRecommendedFormats,
} from "../components/ExportFormats.tsx";
import {
  downloadPng,
  exportToPng,
  getPngFilename,
} from "../components/PngExporter.tsx";
import {
  type BlpExportFormat,
  downloadBlp,
  exportToBlp,
  getBlpFilename,
  getSmartRecommendedFormats,
} from "../components/BlpExporter.tsx";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [header, setHeader] = useState<BlpHeader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("rgba-8");
  const [exportFormats, setExportFormats] = useState<ExportFormat[]>([]);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewPngUrl, setPreviewPngUrl] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<number | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState<string | null>(null);
  const prevFormatRef = useRef<string | null>(null);

  // PNG to BLP conversion state
  const [isPngFile, setIsPngFile] = useState(false);
  const [blpExportFormats, setBlpExportFormats] = useState<BlpExportFormat[]>(
    [],
  );
  const [selectedBlpFormat, setSelectedBlpFormat] = useState<string>("dxt1");
  const [isGeneratingBlpPreview, setIsGeneratingBlpPreview] = useState(false);
  const [previewBlpBlob, setPreviewBlpBlob] = useState<Blob | null>(null);
  const [previewBlpSize, setPreviewBlpSize] = useState<number | null>(null);
  const prevBlpFormatRef = useRef<string | null>(null);

  const processFile = async (file: File) => {
    setFile(file);
    setHeader(null);
    setError(null);
    setPngUrl(null);
    setPreviewPngUrl(null);
    setPreviewSize(null);
    setPreviewBlob(null);
    setAnalysisData(null);
    setLastAnalyzedUrl(null);
    setPreviewBlpBlob(null);
    setPreviewBlpSize(null);
    setIsGeneratingPreview(true);
    setIsGeneratingBlpPreview(true);

    // Check if it's a PNG file
    const isPng = file.name.toLowerCase().endsWith(".png") ||
      file.type === "image/png";
    setIsPngFile(isPng);

    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);

      if (isPng) {
        // Handle PNG to BLP conversion with smart recommendations
        const smartFormats = await getSmartRecommendedFormats(data);
        setBlpExportFormats(smartFormats);

        const defaultFormat = smartFormats.find((f) => f.recommended) ||
          smartFormats[0];
        setSelectedBlpFormat(defaultFormat.id);

        // Generate BLP preview
        const blpData = await exportToBlp(data, defaultFormat);
        const blpBlob = new Blob([blpData], {
          type: "application/octet-stream",
        });
        setPreviewBlpBlob(blpBlob);
        setPreviewBlpSize(blpBlob.size);

        // Also create a PNG preview for display
        const pngUrl = URL.createObjectURL(file);
        setPngUrl(pngUrl);
        setPreviewPngUrl(pngUrl);
        setPreviewSize(file.size);
        setPreviewBlob(file);
      } else {
        // Handle BLP to PNG conversion (existing logic)
        const blpHeader = parseBlpHeader(data);
        setHeader(blpHeader);

        const formats = getRecommendedFormats(blpHeader);
        setExportFormats(formats);

        const defaultFormat = formats.find((f) => f.recommended) || formats[0];

        const png = await exportToPng(data, defaultFormat);
        const blob = new Blob([png], { type: "image/png" });
        const url = URL.createObjectURL(blob);

        setPngUrl(url);
        setPreviewPngUrl(url);
        setPreviewSize(blob.size);
        setPreviewBlob(blob);
        setSelectedFormat(defaultFormat.id);

        setIsAnalyzing(true);
        setAnalysisError(null);
        setLastAnalyzedUrl(url);
        prevFormatRef.current = defaultFormat.id;

        try {
          const analysisData = await generateAnalysis(
            url,
            file.size,
            blob.size,
          );
          if (analysisData) {
            setAnalysisData(analysisData);

            const recommendedFormats = getRecommendedFormats(
              blpHeader,
              analysisData,
            );
            setExportFormats(recommendedFormats);

            const recommendedFormat = recommendedFormats.find((f) =>
              f.recommended
            );
            if (
              recommendedFormat && recommendedFormat.id !== defaultFormat.id
            ) {
              const recommendedPng = await exportToPng(data, recommendedFormat);
              const recommendedBlob = new Blob([recommendedPng], {
                type: "image/png",
              });
              const recommendedUrl = URL.createObjectURL(recommendedBlob);

              URL.revokeObjectURL(url);

              setPngUrl(recommendedUrl);
              setPreviewPngUrl(recommendedUrl);
              setPreviewSize(recommendedBlob.size);
              setPreviewBlob(recommendedBlob);

              setSelectedFormat(recommendedFormat.id);
              prevFormatRef.current = recommendedFormat.id;
            }
          }
        } catch (error) {
          console.error("Analysis failed:", error);
          setAnalysisError(
            error instanceof Error ? error.message : String(error),
          );
          setAnalysisData(null);
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsGeneratingPreview(false);
      setIsGeneratingBlpPreview(false);
    }
  };

  const generatePreview = async () => {
    if (!file || !header) return;

    const format = exportFormats.find((f) => f.id === selectedFormat);
    if (!format) return;

    setIsGeneratingPreview(true);
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const png = await exportToPng(data, format);
      const blob = new Blob([png], { type: "image/png" });
      const url = URL.createObjectURL(blob);

      if (previewPngUrl) {
        URL.revokeObjectURL(previewPngUrl);
      }

      setPreviewPngUrl(url);
      setPreviewSize(blob.size);
      setPreviewBlob(blob);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const generateBlpPreview = async () => {
    if (!file || !isPngFile) return;

    const format = blpExportFormats.find((f) => f.id === selectedBlpFormat);
    if (!format) return;

    setIsGeneratingBlpPreview(true);
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const blpData = await exportToBlp(data, format);
      const blob = new Blob([blpData], { type: "application/octet-stream" });

      setPreviewBlpBlob(blob);
      setPreviewBlpSize(blob.size);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsGeneratingBlpPreview(false);
    }
  };

  const handleDownload = () => {
    if (!previewBlob || !file) return;
    const format = exportFormats.find((f) => f.id === selectedFormat);
    if (!format) return;

    downloadPng(previewBlob, file.name, format);
  };

  const handleBlpDownload = () => {
    if (!previewBlpBlob || !file) return;
    const format = blpExportFormats.find((f) => f.id === selectedBlpFormat);
    if (!format) return;

    downloadBlp(previewBlpBlob, file.name, format);
  };

  const handleFileChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDrop = (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFormatChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    const newFormat = e.currentTarget.value;
    setSelectedFormat(newFormat);
  };

  const handleBlpFormatChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    const newFormat = e.currentTarget.value;
    setSelectedBlpFormat(newFormat);
  };

  useEffect(() => {
    if (
      exportFormats.length > 0 && selectedFormat && !isGeneratingPreview &&
      file && header
    ) {
      if (prevFormatRef.current && prevFormatRef.current !== selectedFormat) {
        const format = exportFormats.find((f) => f.id === selectedFormat);
        if (format) {
          generatePreview();
        }
      }
      prevFormatRef.current = selectedFormat;
    }
  }, [selectedFormat, exportFormats.length, isGeneratingPreview, file, header]);

  useEffect(() => {
    if (
      blpExportFormats.length > 0 && selectedBlpFormat &&
      !isGeneratingBlpPreview &&
      file && isPngFile
    ) {
      if (
        prevBlpFormatRef.current &&
        prevBlpFormatRef.current !== selectedBlpFormat
      ) {
        const format = blpExportFormats.find((f) => f.id === selectedBlpFormat);
        if (format) {
          generateBlpPreview();
        }
      }
      prevBlpFormatRef.current = selectedBlpFormat;
    }
  }, [
    selectedBlpFormat,
    blpExportFormats.length,
    isGeneratingBlpPreview,
    file,
    isPngFile,
  ]);

  useEffect(() => {
    if (
      previewPngUrl && showAnalysis && file && !isAnalyzing &&
      !isGeneratingPreview && lastAnalyzedUrl !== previewPngUrl
    ) {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setLastAnalyzedUrl(previewPngUrl);

      generateAnalysis(previewPngUrl, file.size, previewSize || 0)
        .then((data) => {
          setAnalysisData(data);
          setIsAnalyzing(false);
        })
        .catch((error) => {
          console.error("Analysis failed:", error);
          setAnalysisError(
            error instanceof Error ? error.message : String(error),
          );
          setAnalysisData(null);
          setIsAnalyzing(false);
        });
    }
  }, [
    showAnalysis,
    file,
    previewSize,
    isAnalyzing,
    isGeneratingPreview,
    lastAnalyzedUrl,
  ]);

  useEffect(() => {
    return () => {
      if (pngUrl) URL.revokeObjectURL(pngUrl);
      if (previewPngUrl) URL.revokeObjectURL(previewPngUrl);
    };
  }, []);

  return (
    <div class="w-full max-w-3xl">
      <div
        class={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 shadow-sm bg-white ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            class="w-10 h-10 mb-4 text-blue-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p class="mb-2 text-base text-gray-700">
            <span class="font-semibold text-blue-600">Click to upload</span>
            {" "}
            or drag and drop
          </p>
          <p class="text-xs text-gray-400">BLP or PNG file</p>
        </div>
        <input
          id="file-upload"
          type="file"
          class="hidden"
          onChange={handleFileChange}
          accept=".blp,.png"
        />
      </div>

      {error && (
        <div class="mt-4 p-4 border rounded-lg bg-red-100 text-red-700 shadow-sm">
          <h3 class="text-lg font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {file && (
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
                <span class="font-bold">Size:</span>{" "}
                {(file.size / 1024).toFixed(2)} KB
              </li>
              {!isPngFile && header && (() => {
                const info = getBlpInfo(header);
                return (
                  <>
                    <li>
                      <span class="font-bold">BLP Type:</span> {info.magic}
                    </li>
                    <li>
                      <span class="font-bold">Compression:</span>{" "}
                      {info.compression}
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
                    <span class="font-bold">Bit Depth:</span>{" "}
                    {format.bitDepth}-bit
                  </li>
                  <li>
                    <span class="font-bold">Max Colors:</span> {(() => {
                      switch (format.colorType) {
                        case PNGColorType.RGBA:
                          return "16.7M + Alpha";
                        case PNGColorType.RGB:
                          return "16.7M";
                        case PNGColorType.GRAYSCALE:
                          return format.bitDepth === 4
                            ? "16 shades"
                            : "256 shades";
                        case PNGColorType.PALETTE:
                          return format.bitDepth === 4
                            ? "16 colors"
                            : "256 colors";
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
            const format = blpExportFormats.find((f) =>
              f.id === selectedBlpFormat
            );
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
      )}

      {pngUrl && (
        <>
          <div class="my-6 flex justify-center">
            <div class="w-full h-px bg-gray-200 rounded"></div>
          </div>
          <div class="flex justify-center gap-4">
            <div class="flex flex-col items-center">
              <img
                src={pngUrl}
                alt="BLP Preview"
                class="max-w-xs border border-gray-200 rounded-xl shadow-md"
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
                    alt={isPngFile ? "PNG Preview" : "PNG Preview"}
                    class="max-w-xs border border-gray-200 rounded-xl shadow-md"
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
      )}

      {((!isPngFile && exportFormats.length > 0) ||
        (isPngFile && blpExportFormats.length > 0)) && (
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
                    onClick={() => {
                      if (showAnalysis) {
                        setShowAnalysis(false);
                        setAnalysisData(null);
                        setAnalysisError(null);
                        setIsAnalyzing(false);
                        setLastAnalyzedUrl(null);
                      } else {
                        setShowAnalysis(true);
                      }
                    }}
                    class="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    {showAnalysis ? "Hide Analysis" : "Show Analysis"}
                  </button>
                </div>

                {showAnalysis && (
                  <>
                    {isAnalyzing && (
                      <div class="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                        <h4 class="text-lg font-semibold mb-2 text-blue-800">
                          Analyzing Image...
                        </h4>
                        <p class="text-sm text-blue-700">
                          Please wait while we analyze the image data.
                        </p>
                      </div>
                    )}
                    {analysisError && (
                      <div class="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <h4 class="text-lg font-semibold mb-2 text-red-800">
                          Analysis Error
                        </h4>
                        <p class="text-sm text-red-700">{analysisError}</p>
                      </div>
                    )}
                    {analysisData && !isAnalyzing && (
                      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 class="text-lg font-semibold mb-3 text-gray-800">
                          Advanced Analysis
                        </h4>

                        <div class="mb-4">
                          <h5 class="font-medium text-gray-700 mb-2">
                            Alpha Channel Analysis
                          </h5>
                          <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span class="font-medium">Has Alpha:</span>{" "}
                              {analysisData.alphaStats.hasAlpha ? "Yes" : "No"}
                            </div>
                            <div>
                              <span class="font-medium">Alpha Pixels:</span>
                              {" "}
                              {analysisData.alphaStats.alphaPixels
                                .toLocaleString()} /{" "}
                              {analysisData.alphaStats.totalPixels
                                .toLocaleString()}{" "}
                              <span class="text-xs text-gray-500">
                                (pixels with alpha &lt; 255)
                              </span>
                            </div>
                            <div>
                              <span class="font-medium">Alpha Coverage:</span>
                              {" "}
                              {((analysisData.alphaStats.alphaPixels /
                                analysisData.alphaStats.totalPixels) * 100)
                                .toFixed(
                                  1,
                                )}%
                            </div>
                            <div>
                              <span class="font-medium">Average Alpha:</span>
                              {" "}
                              {analysisData.alphaStats.avgAlpha.toFixed(1)}
                            </div>
                          </div>
                        </div>

                        <div class="mb-4">
                          <h5 class="font-medium text-gray-700 mb-2">
                            Compression Analysis
                          </h5>
                          <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span class="font-medium">Original Size:</span>
                              {" "}
                              {(file?.size ? file.size / 1024 : 0).toFixed(2)}
                              {" "}
                              KB
                            </div>
                            <div>
                              <span class="font-medium">PNG Size:</span>{" "}
                              {(previewSize ? previewSize / 1024 : 0).toFixed(
                                2,
                              )} KB
                            </div>
                            <div>
                              <span class="font-medium">
                                Compression Ratio:
                              </span>{" "}
                              {analysisData.compressionRatio.toFixed(1)}%
                            </div>
                            <div>
                              <span class="font-medium">Size Savings:</span>
                              {" "}
                              {analysisData.sizeSavings > 0 ? "+" : ""}
                              {analysisData.sizeSavings.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 class="font-medium text-gray-700 mb-2">
                            Color Distribution
                          </h5>
                          <div class="grid grid-cols-2 gap-4">
                            <div>
                              <div class="text-xs text-gray-600 mb-1">
                                Red Channel
                              </div>
                              <div class="h-16 bg-gray-200 rounded overflow-hidden">
                                <div class="h-full flex items-end">
                                  {(() => {
                                    const buckets = 64;
                                    const bucketSize = 256 / buckets;
                                    const bucketData = new Array(buckets).fill(
                                      0,
                                    );

                                    for (let i = 0; i < 256; i++) {
                                      const bucketIndex = Math.floor(
                                        i / bucketSize,
                                      );
                                      bucketData[bucketIndex] +=
                                        analysisData.histogram.r[i];
                                    }

                                    const maxCount = Math.max(...bucketData);

                                    return bucketData.map((count, i) => {
                                      const height = maxCount > 0
                                        ? (count / maxCount) * 100
                                        : 0;
                                      const startValue = i * bucketSize;
                                      const endValue = (i + 1) * bucketSize - 1;
                                      return (
                                        <div
                                          key={i}
                                          class="flex-1 bg-red-500 min-w-[1px]"
                                          style={`height: ${height}%`}
                                          title={`Values ${startValue}-${endValue}: ${count.toLocaleString()} pixels`}
                                        />
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div class="text-xs text-gray-600 mb-1">
                                Green Channel
                              </div>
                              <div class="h-16 bg-gray-200 rounded overflow-hidden">
                                <div class="h-full flex items-end">
                                  {(() => {
                                    const buckets = 64;
                                    const bucketSize = 256 / buckets;
                                    const bucketData = new Array(buckets).fill(
                                      0,
                                    );

                                    for (let i = 0; i < 256; i++) {
                                      const bucketIndex = Math.floor(
                                        i / bucketSize,
                                      );
                                      bucketData[bucketIndex] +=
                                        analysisData.histogram.g[i];
                                    }

                                    const maxCount = Math.max(...bucketData);

                                    return bucketData.map((count, i) => {
                                      const height = maxCount > 0
                                        ? (count / maxCount) * 100
                                        : 0;
                                      const startValue = i * bucketSize;
                                      const endValue = (i + 1) * bucketSize - 1;
                                      return (
                                        <div
                                          key={i}
                                          class="flex-1 bg-green-500 min-w-[1px]"
                                          style={`height: ${height}%`}
                                          title={`Values ${startValue}-${endValue}: ${count.toLocaleString()} pixels`}
                                        />
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div class="text-xs text-gray-600 mb-1">
                                Blue Channel
                              </div>
                              <div class="h-16 bg-gray-200 rounded overflow-hidden">
                                <div class="h-full flex items-end">
                                  {(() => {
                                    const buckets = 64;
                                    const bucketSize = 256 / buckets;
                                    const bucketData = new Array(buckets).fill(
                                      0,
                                    );

                                    for (let i = 0; i < 256; i++) {
                                      const bucketIndex = Math.floor(
                                        i / bucketSize,
                                      );
                                      bucketData[bucketIndex] +=
                                        analysisData.histogram.b[i];
                                    }

                                    const maxCount = Math.max(...bucketData);

                                    return bucketData.map((count, i) => {
                                      const height = maxCount > 0
                                        ? (count / maxCount) * 100
                                        : 0;
                                      const startValue = i * bucketSize;
                                      const endValue = (i + 1) * bucketSize - 1;
                                      return (
                                        <div
                                          key={i}
                                          class="flex-1 bg-blue-500 min-w-[1px]"
                                          style={`height: ${height}%`}
                                          title={`Values ${startValue}-${endValue}: ${count.toLocaleString()} pixels`}
                                        />
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div class="text-xs text-gray-600 mb-1">
                                Alpha Channel (excluding fully opaque)
                              </div>
                              <div class="h-16 bg-gray-200 rounded overflow-hidden">
                                <div class="h-full flex items-end">
                                  {(() => {
                                    const buckets = 64;
                                    const bucketSize = 255 / buckets;
                                    const bucketData = new Array(buckets).fill(
                                      0,
                                    );

                                    for (let i = 0; i < 255; i++) {
                                      const bucketIndex = Math.floor(
                                        i / bucketSize,
                                      );
                                      bucketData[bucketIndex] +=
                                        analysisData.histogram.a[i];
                                    }

                                    const maxCount = Math.max(...bucketData);

                                    return bucketData.map((count, i) => {
                                      const height = maxCount > 0
                                        ? (count / maxCount) * 100
                                        : 0;
                                      const startValue = i * bucketSize;
                                      const endValue = (i + 1) * bucketSize - 1;
                                      return (
                                        <div
                                          key={i}
                                          class="flex-1 bg-gray-600 min-w-[1px]"
                                          style={`height: ${height}%`}
                                          title={`Values ${startValue}-${endValue}: ${count.toLocaleString()} pixels`}
                                        />
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

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
                    onChange={isPngFile
                      ? handleBlpFormatChange
                      : handleFormatChange}
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

                {(() => {
                  const format = isPngFile
                    ? blpExportFormats.find((f) => f.id === selectedBlpFormat)
                    : exportFormats.find((f) => f.id === selectedFormat);
                  if (!format) return null;
                  return (
                    <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p class="text-sm text-gray-700 mb-1">
                        <span class="font-semibold">{format.name}</span>
                      </p>
                      <p class="text-xs text-gray-600 mb-2">
                        {format.description}
                      </p>
                      {format.recommended && format.reason && (
                        <p class="text-xs text-green-600">
                          <span class="font-semibold">Recommended:</span>{" "}
                          {format.reason}
                        </p>
                      )}
                    </div>
                  );
                })()}

                <div class="flex gap-2">
                  <button
                    type="button"
                    onClick={isPngFile ? handleBlpDownload : handleDownload}
                    disabled={isPngFile
                      ? (isGeneratingBlpPreview || !previewBlpBlob)
                      : (isGeneratingPreview || !previewBlob)}
                    class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPngFile
                      ? (isGeneratingBlpPreview
                        ? "Generating..."
                        : "Download BLP")
                      : (isGeneratingPreview
                        ? "Generating..."
                        : "Download PNG")}
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
          )}
    </div>
  );
}
