/**
 * Kompresi gambar otomatis di sisi klien (Canvas-based)
 * Sesuai kebutuhan non-fungsional PRD: kompresi gambar otomatis saat upload
 * agar pemuatan halaman tetap cepat dan responsif.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 - 1.0
  maxSizeBytes?: number;
}

export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<{ dataUrl: string; originalSize: number; compressedSize: number }> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    maxSizeBytes = 1024 * 1024,
  } = options;
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        const minimumQuality = 0.4;
        const minimumDimension = 320;
        const qualityStep = 0.1;

        while (true) {
          canvas.width = width;
          canvas.height = height;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          for (
            let currentQuality = quality;
            currentQuality >= minimumQuality;
            currentQuality -= qualityStep
          ) {
            const dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
            const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
            const padding = base64.endsWith('==')
              ? 2
              : base64.endsWith('=')
                ? 1
                : 0;
            const compressedSize = (base64.length * 3) / 4 - padding;

            if (compressedSize <= maxSizeBytes) {
              resolve({ dataUrl, originalSize, compressedSize });
              return;
            }
          }

          if (Math.max(width, height) <= minimumDimension) {
            reject(new Error('Foto tidak dapat dikompres hingga batas ukuran.'));
            return;
          }

          width = Math.max(1, Math.round(width * 0.8));
          height = Math.max(1, Math.round(height * 0.8));
        }
      };

      img.onerror = () => reject(new Error('Gagal memuat gambar untuk dikompres'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes ke string ukuran yang manusiawi (KB / MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
