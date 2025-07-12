import pdfParse from "pdf-parse";
import axios from "axios";

/**
 * Downloads a PDF file from a public S3 URL and extracts its plain text content.
 * @param s3Url Publicly accessible S3 URL pointing to a PDF file.
 * @returns Extracted text from the PDF.
 */
export const extractTextFromS3Url = async (s3Url: string): Promise<string> => {
  if (!s3Url) throw new Error("Missing S3 URL");

  console.log("Extracting text from S3 URL:", s3Url);

  const response = await axios.get<ArrayBuffer>(s3Url, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data);

  console.log("PDF buffer size:", buffer.length);

  const data = await pdfParse(buffer);
  return data.text;
};
