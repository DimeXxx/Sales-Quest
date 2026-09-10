import { useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import { fileToCompressedDataUrl } from "../../lib/imageCompress";

interface PhotoPickerProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

/** Lets an admin either paste a photo URL or upload a file — the file gets resized/compressed client-side first. */
export function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#223044] bg-white/[0.02]">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-[#8B98A9]" />}
      </div>
      <input
        className="flex-1 rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-xs text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400"
        placeholder="URL фото товара"
        value={value && !value.startsWith("data:") ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
      />
      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-xs font-semibold text-[#8B98A9] hover:text-[#F5F7FA] disabled:opacity-50"
      >
        <Upload className="h-3.5 w-3.5" /> {busy ? "…" : "Файл"}
      </button>
    </div>
  );
}
