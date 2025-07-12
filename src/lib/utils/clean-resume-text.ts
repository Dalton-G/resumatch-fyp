export function cleanResumeText(raw: string): string {
  return (
    raw
      // Replace unusual bullet points with a dash
      .replace(
        /\u2022|\u25CF|\u00B7|\u2023|\u2043|\u2219|\u25AA|\u25A0|/g,
        "-"
      )

      // Fix ordinal spacing: "1 st" → "1st"
      .replace(/\b(\d+)\s+(st|nd|rd|th)\b/gi, "$1$2")

      // Normalize line endings
      .replace(/\r\n|\r/g, "\n")

      // Collapse multiple blank lines to two
      .replace(/\n{3,}/g, "\n\n")

      // Normalize extra spaces and tabs
      .replace(/[ \t]+/g, " ")

      // Trim leading and trailing whitespace
      .trim()
  );
}
