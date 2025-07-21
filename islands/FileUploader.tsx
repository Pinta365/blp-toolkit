import { JSX } from "preact";
import { useState } from "preact/hooks";
import { decodeBlpData, encodeToPNG, parseBlpHeader } from "@pinta365/blp";
import { useEffect } from "preact/hooks";

type BlpHeader = ReturnType<typeof parseBlpHeader>;

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [header, setHeader] = useState<BlpHeader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pngUrl, setPngUrl] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setFile(file);
    setHeader(null);
    setError(null);
    setPngUrl(null);
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const blpHeader = parseBlpHeader(data);
      setHeader(blpHeader);
      // Decode and encode to PNG, then create object URL
      const decoded = decodeBlpData(data);
      const png = await encodeToPNG(decoded);
      const blob = new Blob([png], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      setPngUrl(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleFileChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDrop = (e: JSX.TargetedDragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: JSX.TargetedDragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: JSX.TargetedDragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  function getBlpInfo(header: BlpHeader) {
    const compressionMap: Record<number, string> = {
      1: "Palettized (RAW1)",
      2: "DXT-compressed",
      3: "Uncompressed (RAW3, A8R8G8B8)",
    };
    const compressionDesc = compressionMap[header.compression] ||
      `Unknown (${header.compression})`;

    const alphaDesc = header.alphaSize === 0
      ? "No alpha channel"
      : header.alphaSize === 1
      ? "1-bit alpha (binary mask)"
      : header.alphaSize === 4
      ? "4-bit alpha (rare)"
      : header.alphaSize === 8
      ? "8-bit alpha (full)"
      : `Unknown (${header.alphaSize})`;

    const mipDesc = header.hasMips === 0
      ? "Only main image (no mipmaps)"
      : header.hasMips === 1 || header.hasMips === 2
      ? "Multiple mipmaps present"
      : `Unknown (${header.hasMips})`;

    const preferredFormatDesc = header.preferredFormat === 0
      ? "Default/unspecified"
      : header.preferredFormat === 1
      ? "DXT3 (if DXT)"
      : header.preferredFormat === 7
      ? "DXT5 (if DXT)"
      : `${header.preferredFormat}`;

    let dxtType = "";
    if (header.compression === 2) {
      if (header.preferredFormat === 1) {
        dxtType = "DXT3";
      } else if (header.preferredFormat === 7) {
        dxtType = "DXT5";
      } else {
        dxtType = "DXT1";
      }
    }

    return {
      magic: `${header.magic}`,
      version: `${header.version}`,
      compression: `${header.compression} (${compressionDesc})`,
      alpha: `${header.alphaSize} (${alphaDesc})`,
      preferredFormat: `${header.preferredFormat} (${preferredFormatDesc})`,
      mipmaps: mipDesc,
      width: `${header.width} px`,
      height: `${header.height} px`,
      dxtType: dxtType,
    };
  }

  useEffect(() => {
    return () => {
      if (pngUrl) URL.revokeObjectURL(pngUrl);
    };
  }, [pngUrl]);

  return (
    <div class="w-full max-w-lg">
      <label
        for="file-upload"
        class={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 shadow-sm bg-white ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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
          <p class="text-xs text-gray-400">BLP file</p>
        </div>
        <input
          id="file-upload"
          type="file"
          class="hidden"
          onChange={handleFileChange}
          accept=".blp"
        />
      </label>
      {error && (
        <div class="mt-4 p-4 border rounded-lg bg-red-100 text-red-700 shadow-sm">
          <h3 class="text-lg font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      {file && (
        <div class="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-blue-700">
            File Information:
          </h3>
          <ul class="space-y-1 text-gray-800">
            <li>
              <span class="font-bold">Name:</span> {file.name}
            </li>
            <li>
              <span class="font-bold">Type:</span> {file.type}
            </li>
            <li>
              <span class="font-bold">Size:</span>{" "}
              {(file.size / 1024).toFixed(2)} KB
            </li>
            {header && (() => {
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
      )}
      {pngUrl && (
        <>
          <div class="my-6 flex justify-center">
            <div class="w-full h-px bg-gray-200 rounded"></div>
          </div>
          <div class="flex justify-center">
            <img
              src={pngUrl}
              alt="BLP Preview"
              class="max-w-xs border border-gray-200 rounded-xl shadow-md"
            />
          </div>
        </>
      )}
    </div>
  );
}
