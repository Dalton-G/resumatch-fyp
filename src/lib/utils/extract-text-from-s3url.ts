import pdfParse from "pdf-parse";
import axios from "axios";
import { cleanText } from "./clean-resume-text";

/**
 * Downloads a PDF file from a public S3 URL and extracts its plain text content.
 * @param s3Url Publicly accessible S3 URL pointing to a PDF file.
 * @returns Extracted text from the PDF.
 */
export const extractTextFromS3Url = async (s3Url: string): Promise<string> => {
  if (!s3Url) throw new Error("Missing S3 URL");

  const response = await axios.get<ArrayBuffer>(s3Url, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data);

  const data = await pdfParse(buffer);

  const cleanedText = cleanText(data.text);

  return cleanedText;
};
