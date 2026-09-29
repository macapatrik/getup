export const PHOTOS_BUCKET = "photos";

export function photoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTOS_BUCKET}/${path}`;
}

/** Náhodné id – funguje i mimo HTTPS (např. testování na mobilu přes LAN), kde chybí crypto.randomUUID. */
export function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && window.isSecureContext) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Zmenší fotku v prohlížeči na WebP (asi 2–3× menší než JPEG; méně dat na přetížené síti na koncertě).
 * Když prohlížeč WebP neumí uložit, vrátí JPEG – přípona se bere z `blob.type`.
 */
export async function resizeImage(file: File, maxSize = 1080, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas není podporovaný");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) =>
    new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Konverze fotky selhala"))), type, quality),
    );
  const webp = await encode("image/webp");
  return webp.type === "image/webp" ? webp : encode("image/jpeg");
}

export function photoExtension(blob: Blob) {
  return blob.type === "image/webp" ? "webp" : "jpg";
}
