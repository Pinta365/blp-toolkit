import { useState } from "preact/hooks";
import FileUploader from "./FileUploader.tsx";

export default function MainPage() {
  const [hasFile, setHasFile] = useState(false);

  return (
    <div class="min-h-screen flex flex-col">
      <main class="flex-1 flex flex-col items-center">
        <header class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-4 text-gray-900">
            BLP ↔ PNG Toolkit
          </h1>
          <p class="text-xl text-gray-700 mb-2">
            Convert Blizzard BLP Files to PNG and Back
          </p>
          <p class="mb-6 text-gray-600 text-center max-w-4xl">
            Upload a <span class="font-semibold text-blue-600">.blp</span>{" "}
            file to convert to PNG, or upload a{" "}
            <span class="font-semibold text-green-600">.png</span>{" "}
            file to convert to BLP format. Supports DXT1, DXT3, DXT5, Palette,
            and Uncompressed formats.
          </p>
        </header>

        <section class="w-full max-w-4xl">
          <FileUploader onFileUploaded={() => setHasFile(true)} />
        </section>

        {!hasFile && (
          <section class="mt-12 w-full max-w-4xl">
            <h2 class="text-2xl font-bold mb-6 text-gray-900 text-center">
              Features
            </h2>
            <div class="grid md:grid-cols-2 gap-8 px-4">
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-lg font-semibold mb-3 text-blue-600">
                  BLP to PNG Conversion
                </h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• View BLP metadata and live PNG preview</li>
                  <li>• Export to RGBA, RGB, Grayscale, and Palette formats</li>
                  <li>• Smart format recommendations based on BLP analysis</li>
                  <li>• Support for all Blizzard BLP compression formats</li>
                </ul>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-lg font-semibold mb-3 text-green-600">
                  PNG to BLP Conversion
                </h3>
                <ul class="space-y-2 text-gray-600">
                  <li>• Convert PNG images to BLP format</li>
                  <li>• DXT1, DXT3, DXT5, Palette, and Uncompressed support</li>
                  <li>• Smart alpha detection and format recommendations</li>
                  <li>• Auto-resizing to power-of-2 dimensions with padding</li>
                  <li>• Automatic mipmap generation for optimal quality</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer class="w-full text-center py-6 mt-12 text-sm text-gray-500 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4">
          <p class="mb-2">
            <strong>Disclaimer:</strong>{" "}
            This toolkit is a work in progress. BLP processing powered by{" "}
            <a
              href="https://jsr.io/@pinta365/blp"
              class="underline hover:text-blue-600"
              target="_blank"
              rel="noopener external"
              aria-label="Visit @pinta365/blp library on JSR"
            >
              @pinta365/blp
            </a>.
          </p>
          <p>
            Found a bug or have feedback? Report issues or contribute on{" "}
            <a
              href="https://github.com/Pinta365/blp-toolkit"
              class="underline hover:text-blue-600"
              target="_blank"
              rel="noopener external"
              aria-label="Visit BLP Toolkit GitHub repository"
            >
              GitHub
            </a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
