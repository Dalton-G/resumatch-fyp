import { ResumeChunkMetadata } from "../model/chunk-metadata";

export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  // Clean and normalize the text
  const cleanText = text
    .replace(/\s+/g, " ") // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, "\n") // Remove excessive line breaks
    .trim();

  while (start < cleanText.length) {
    let end = start + chunkSize;

    // If we're not at the end of the text, try to break at a sentence or word boundary
    if (end < cleanText.length) {
      // Look for sentence ending within the last 100 characters
      const sentenceEnd = cleanText.lastIndexOf(".", end);
      const questionEnd = cleanText.lastIndexOf("?", end);
      const exclamationEnd = cleanText.lastIndexOf("!", end);

      const lastSentenceEnd = Math.max(
        sentenceEnd,
        questionEnd,
        exclamationEnd
      );

      if (lastSentenceEnd > start + chunkSize - 100) {
        end = lastSentenceEnd + 1;
      } else {
        // If no good sentence break, look for word boundary
        const lastSpace = cleanText.lastIndexOf(" ", end);
        if (lastSpace > start + chunkSize - 50) {
          end = lastSpace;
        }
      }
    }

    const chunk = cleanText.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start position, accounting for overlap
    start = end - overlap;
  }

  console.log(`Chunked text into ${chunks.length} parts`);

  return chunks;
}

export function prepareResumeMetadata(
  chunks: string[],
  jobSeekerId: string,
  resumeId: string,
  source: string
): ResumeChunkMetadata[] {
  return chunks.map((content, index) => ({
    content,
    metadata: {
      jobSeekerId,
      resumeId,
      chunkIndex: index,
      totalChunks: chunks.length,
      source,
      appliedJobIds: [],
    },
  }));
}
