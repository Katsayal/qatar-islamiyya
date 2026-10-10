// Browser only. Shrinks a photo to at most `maxSide` px and re-saves it as JPEG so phone photos
// (3-8 MB) fit the upload limit and load fast. If the browser cannot read the file, the original is returned.
export async function resizeImage(file: File, maxSide = 1600): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file); // applies the photo's rotation
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff"; // JPEG has no transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
