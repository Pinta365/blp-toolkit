export interface AnalysisData {
  histogram: { r: number[]; g: number[]; b: number[]; a: number[] };
  alphaStats: {
    hasAlpha: boolean;
    alphaPixels: number;
    totalPixels: number;
    avgAlpha: number;
  };
  compressionRatio: number;
  sizeSavings: number;
}

export function analyzeImage(
  imageData: ImageData,
  originalSize: number,
  compressedSize: number,
): AnalysisData {
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  const histogram = {
    r: new Array(256).fill(0),
    g: new Array(256).fill(0),
    b: new Array(256).fill(0),
    a: new Array(256).fill(0),
  };

  let alphaSum = 0;
  let alphaPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    histogram.r[r]++;
    histogram.g[g]++;
    histogram.b[b]++;
    histogram.a[a]++;

    alphaSum += a;
    if (a < 255) alphaPixels++;
  }

  const avgAlpha = alphaSum / totalPixels;
  const hasAlpha = alphaPixels > 0;

  const compressionRatio = originalSize > 0
    ? (compressedSize / originalSize) * 100
    : 0;
  const sizeSavings = originalSize > 0
    ? ((originalSize - compressedSize) / originalSize) * 100
    : 0;

  return {
    histogram,
    alphaStats: {
      hasAlpha,
      alphaPixels,
      totalPixels,
      avgAlpha,
    },
    compressionRatio,
    sizeSavings,
  };
}

export function generateAnalysis(
  previewPngUrl: string,
  originalSize: number,
  compressedSize: number,
): Promise<AnalysisData | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Image analysis timed out"));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const analysis = analyzeImage(
            imageData,
            originalSize,
            compressedSize,
          );
          resolve(analysis);
        } catch (error) {
          reject(
            new Error(
              `Analysis processing failed: ${
                error instanceof Error ? error.message : String(error)
              }`,
            ),
          );
        }
      };

      img.onerror = (event) => {
        clearTimeout(timeout);
        console.error("Image load error:", event);
        reject(
          new Error(
            `Failed to load image for analysis. URL: ${
              previewPngUrl.substring(0, 50)
            }...`,
          ),
        );
      };

      img.src = previewPngUrl;
    });
  } catch (error) {
    console.error("Analysis failed:", error);
    return Promise.resolve(null);
  }
}
