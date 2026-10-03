/**
 * Compresses an image to ensure it stays within server limits (e.g., 4.5MB for Vercel).
 * Also resizes extremely large images to a maximum dimension while maintaining aspect ratio.
 * Supports both base64 strings and remote image URLs.
 */
export async function compressImage(source, maxWidth = 1200, quality = 0.85) {
  // If it's a remote URL, fetch as blob first to avoid cross-origin canvas tainting
  let base64Str = source;
  if (typeof source === "string" && source.startsWith("http")) {
    try {
      const res = await fetch(source);
      if (res.ok) {
        const blob = await res.blob();
        base64Str = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (e) {
      console.warn("Could not convert URL via fetch blob, falling back to direct src:", e);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Limit max dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width *= maxWidth / height;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed jpeg string
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };
    img.onerror = (err) => reject(err);
  });
}
