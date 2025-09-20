import { type AnalysisData } from "./ImageAnalyzer.tsx";

interface AnalysisPanelProps {
  showAnalysis: boolean;
  isAnalyzing: boolean;
  analysisError: string | null;
  analysisData: AnalysisData | null;
  file: File | null;
  previewSize: number | null;
}

export default function AnalysisPanel({
  showAnalysis,
  isAnalyzing,
  analysisError,
  analysisData,
  file,
  previewSize,
}: AnalysisPanelProps) {
  if (!showAnalysis) return null;

  return (
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
                <span class="font-medium">Alpha Pixels:</span>{" "}
                {analysisData.alphaStats.alphaPixels
                  .toLocaleString()} / {analysisData.alphaStats.totalPixels
                  .toLocaleString()}{" "}
                <span class="text-xs text-gray-500">
                  (pixels with alpha &lt; 255)
                </span>
              </div>
              <div>
                <span class="font-medium">Alpha Coverage:</span>{" "}
                {((analysisData.alphaStats.alphaPixels /
                  analysisData.alphaStats.totalPixels) * 100)
                  .toFixed(
                    1,
                  )}%
              </div>
              <div>
                <span class="font-medium">Average Alpha:</span>{" "}
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
                <span class="font-medium">Original Size:</span>{" "}
                {(file?.size ? file.size / 1024 : 0).toFixed(2)} KB
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
                <span class="font-medium">Size Savings:</span>{" "}
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
                        bucketData[bucketIndex] += analysisData.histogram.r[i];
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
                        bucketData[bucketIndex] += analysisData.histogram.g[i];
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
                        bucketData[bucketIndex] += analysisData.histogram.b[i];
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
                        bucketData[bucketIndex] += analysisData.histogram.a[i];
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
  );
}
