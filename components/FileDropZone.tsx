import { JSX } from "preact";

interface FileDropZoneProps {
  isDragOver: boolean;
  onDrop: (e: JSX.TargetedDragEvent<HTMLDivElement>) => void;
  onDragOver: (e: JSX.TargetedDragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: JSX.TargetedDragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onFileChange: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
}

export default function FileDropZone({
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  onFileChange,
}: FileDropZoneProps) {
  return (
    <div
      class={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-colors duration-200 shadow-sm bg-white ${
        isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
    >
      <div class="flex flex-col items-center justify-center pt-5 pb-6">
        <svg
          class="w-10 h-10 mb-4 text-blue-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 16"
          role="img"
          aria-label="File upload icon"
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
          <span class="font-semibold text-blue-600">Click to upload</span>{" "}
          or drag and drop
        </p>
        <p class="text-xs text-gray-400">BLP or PNG file</p>
      </div>
      <input
        id="file-upload"
        type="file"
        class="hidden"
        onChange={onFileChange}
        accept=".blp,.png"
      />
    </div>
  );
}
