export function cleanFilename(filename: string): string {
  // UUID v4 is 36 chars, followed by a hyphen
  // Example: 693a-412e-adc0-603d373e9068-Gan Ming Liang CV 2025 Q1.pdf
  const firstHyphen = filename.indexOf("-");
  if (firstHyphen === -1) return filename;
  // Find the hyphen after the UUID (UUID is 36 chars, so look for hyphen after 36th char)
  const uuidEnd = filename.indexOf("-", 36);
  if (uuidEnd !== -1) {
    return filename.slice(uuidEnd + 1);
  }
  // Fallback: just remove up to the first hyphen
  return filename.slice(firstHyphen + 1);
}

export function formatEnumString(str: string): string {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
