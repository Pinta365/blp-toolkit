import FileUploader from "../islands/FileUploader.tsx";
import { define } from "../utils.ts";

export default define.page(function Home() {
  return (
    <div class="min-h-screen flex flex-col">
      <div class="flex-1 flex flex-col items-center">
        <h1 class="text-3xl font-bold mb-2 text-gray-900">BLP Toolkit</h1>
        <p class="mb-6 text-gray-600 text-center max-w-lg">
          Upload a <span class="font-semibold text-blue-600">.blp</span>{" "}
          file to see its information and export to PNG.
        </p>
        <FileUploader />
      </div>
      <footer class="w-full text-center py-4 mt-8 text-sm text-gray-500">
        <span>
          <strong>Disclaimer:</strong>{" "}
          This toolkit is a work in progress. BLP processing done by{" "}
          <a
            href="https://jsr.io/@pinta365/blp"
            class="underline hover:text-blue-600"
            target="_blank"
            rel="noopener external"
          >
            @pinta365/blp
          </a>.
        </span>
        <br />
        <span>
          Found a bug or have feedback? Report issues or contribute on{" "}
          <a
            href="https://github.com/Pinta365/blp-toolkit"
            class="underline hover:text-blue-600"
            target="_blank"
            rel="noopener external"
          >
            GitHub
          </a>.
        </span>
      </footer>
    </div>
  );
});
