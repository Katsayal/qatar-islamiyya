// True when the first bytes of a file are a real JPEG, PNG or WebP image.
// The type a browser reports comes from the file name, so a renamed file would pass a type check.
export function isImageBytes(b: Uint8Array): boolean {
  const starts = (sig: number[], at = 0) => sig.every((v, i) => b[at + i] === v);
  if (starts([0xff, 0xd8, 0xff])) return true; // JPEG
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return true; // PNG
  return starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8); // WebP: "RIFF" .... "WEBP"
}
