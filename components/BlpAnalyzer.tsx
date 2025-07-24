import { parseBlpHeader } from "@pinta365/blp";

export type BlpHeader = ReturnType<typeof parseBlpHeader>;

export interface BlpInfo {
  magic: string;
  version: string;
  compression: string;
  alpha: string;
  preferredFormat: string;
  mipmaps: string;
  width: string;
  height: string;
  dxtType: string;
}

export function getBlpInfo(header: BlpHeader): BlpInfo {
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
