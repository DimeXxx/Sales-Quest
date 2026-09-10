/**
 * Resizes and compresses an image file in the browser (canvas-based) before
 * turning it into a base64 data URI. Keeps uploaded product photos small —
 * the backend stores them inline in a JSON file, so an unresized phone photo
 * (several MB) would bloat it fast. Max 800px on the longest side, JPEG q0.8.
 */
export function fileToCompressedDataUrl(file: File, maxSize = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("read_failed"));
    reader.onload = () => {
      img.onerror = () => reject(new Error("decode_failed"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas_unavailable"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
