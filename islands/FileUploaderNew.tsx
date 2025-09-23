import { JSX } from "preact";
import { useRef, useState } from "preact/hooks";
import { parseBlpHeader } from "@pinta365/blp";
import { useEffect } from "preact/hooks";

import { type BlpHeader } from "../components/BlpAnalyzer.tsx";
import {
  type AnalysisData,
  generateAnalysis,
} from "../components/ImageAnalyzer.tsx";
import {
  type ExportFormat,
  getRecommendedFormats,
} from "../components/ExportFormats.tsx";
import { downloadPng, exportToPng } from "../components/PngExporter.tsx";
import {
  type BlpExportFormat,
  downloadBlp,
  exportToBlp,
  getSmartRecommendedFormats,
} from "../components/BlpExporter.tsx";
import FileDropZone from "../components/FileDropZone.tsx";
import FileInfoDisplay from "../components/FileInfoDisplay.tsx";
import PreviewSection from "../components/PreviewSection.tsx";
import ExportOptions from "./ExportOptions.tsx";

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
        const blpBlob = new Blob([new Uint8Array(blpData)], {
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
        const blob = new Blob([new Uint8Array(png)], { type: "image/png" });
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
              const recommendedBlob = new Blob(
                [new Uint8Array(recommendedPng)],
                {
                  type: "image/png",
                },
              );
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
      const blob = new Blob([new Uint8Array(png)], { type: "image/png" });
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
      const blob = new Blob([new Uint8Array(blpData)], {
        type: "application/octet-stream",
      });

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

  const handleToggleAnalysis = () => {
    if (showAnalysis) {
      setShowAnalysis(false);
      setAnalysisData(null);
      setAnalysisError(null);
      setIsAnalyzing(false);
      setLastAnalyzedUrl(null);
    } else {
      setShowAnalysis(true);
    }
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
    <div class="w-full max-w-4xl">
      <FileDropZone
        isDragOver={isDragOver}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("file-upload")?.click()}
        onFileChange={handleFileChange}
      />

      {error && (
        <div class="mt-4 p-4 border rounded-lg bg-red-100 text-red-700 shadow-sm">
          <h3 class="text-lg font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {file && (
        <FileInfoDisplay
          file={file}
          isPngFile={isPngFile}
          header={header}
          exportFormats={exportFormats}
          selectedFormat={selectedFormat}
          previewSize={previewSize}
          blpExportFormats={blpExportFormats}
          selectedBlpFormat={selectedBlpFormat}
          previewBlpSize={previewBlpSize}
        />
      )}

      <PreviewSection
        pngUrl={pngUrl}
        file={file}
        isPngFile={isPngFile}
        isGeneratingPreview={isGeneratingPreview}
        previewPngUrl={previewPngUrl}
        exportFormats={exportFormats}
        selectedFormat={selectedFormat}
        blpExportFormats={blpExportFormats}
        selectedBlpFormat={selectedBlpFormat}
      />

      <ExportOptions
        isPngFile={isPngFile}
        exportFormats={exportFormats}
        selectedFormat={selectedFormat}
        onFormatChange={handleFormatChange}
        blpExportFormats={blpExportFormats}
        selectedBlpFormat={selectedBlpFormat}
        onBlpFormatChange={handleBlpFormatChange}
        onDownload={handleDownload}
        onBlpDownload={handleBlpDownload}
        isGeneratingPreview={isGeneratingPreview}
        isGeneratingBlpPreview={isGeneratingBlpPreview}
        previewBlob={previewBlob}
        previewBlpBlob={previewBlpBlob}
        showAnalysis={showAnalysis}
        onToggleAnalysis={handleToggleAnalysis}
        isAnalyzing={isAnalyzing}
        analysisError={analysisError}
        analysisData={analysisData}
        file={file}
        previewSize={previewSize}
      />
    </div>
  );
}
