export function getMimeType(uri: string): string {
  if (uri.endsWith('.png')) return 'image/png';
  if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) return 'image/jpeg';
  if (uri.endsWith('.mp4')) return 'video/mp4';
  if (uri.endsWith('.mov')) return 'video/quicktime';
  return 'application/octet-stream';
}
