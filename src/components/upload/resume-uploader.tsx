import FileUploader, { FileUploaderProps } from "./file-uploader";
import { FILE_CATEGORY_CONFIG } from "@/config/file-category-config";

export default function ResumeUploader(props: Partial<FileUploaderProps>) {
  const config = FILE_CATEGORY_CONFIG["resume"];
  return (
    <FileUploader
      allowedExtensions={config.allowedExtensions}
      maxSize={config.maxSize}
      folderPath={config.folder}
      fileCategory="resume"
      multiple={false}
      {...props}
    />
  );
}
