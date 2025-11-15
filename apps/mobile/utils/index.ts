export function getMimeType(uri: string): { mimeType: string; mediaType: 'image' | 'video' | 'unknown' } {
  const cleanUri = uri.split('?')[0].split('#')[0];
  const extension = cleanUri.split('.').pop()?.toLowerCase();

  if (!extension) {
    return { mimeType: 'application/octet-stream', mediaType: 'unknown' };
  }

  switch (extension) {
    // ----- Images -----
    case 'jpg':
    case 'jpeg':
      return { mimeType: 'image/jpeg', mediaType: 'image' };
    case 'png':
      return { mimeType: 'image/png', mediaType: 'image' };
    case 'heic':
      return { mimeType: 'image/heic', mediaType: 'image' };
    case 'heif':
      return { mimeType: 'image/heif', mediaType: 'image' };
    case 'gif':
      return { mimeType: 'image/gif', mediaType: 'image' };
    case 'webp':
      return { mimeType: 'image/webp', mediaType: 'image' };
    case 'bmp':
      return { mimeType: 'image/bmp', mediaType: 'image' };
    case 'tiff':
    case 'tif':
      return { mimeType: 'image/tiff', mediaType: 'image' };

    // ----- Videos -----
    case 'mp4':
      return { mimeType: 'video/mp4', mediaType: 'video' };
    case 'mov':
      return { mimeType: 'video/quicktime', mediaType: 'video' };
    case 'avi':
      return { mimeType: 'video/x-msvideo', mediaType: 'video' };
    case 'mkv':
      return { mimeType: 'video/x-matroska', mediaType: 'video' };
    case 'webm':
      return { mimeType: 'video/webm', mediaType: 'video' };
    case '3gp':
      return { mimeType: 'video/3gpp', mediaType: 'video' };

    // ----- Default -----
    default:
      return { mimeType: 'application/octet-stream', mediaType: 'unknown' };
  }
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return [hrs, mins, secs]
    .map((val) => (val < 10 ? `0${val}` : val)) // Add leading zero if needed
    .filter((val, idx) => val !== '00' || idx > 0) // Skip hours if 0
    .join(':');
}
