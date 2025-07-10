import FileUploader, { FileUploaderProps } from "./file-uploader";
import { FILE_CATEGORY_CONFIG } from "@/config/file-category-config";

export default function JobImageUploader(props: Partial<FileUploaderProps>) {
  const config = FILE_CATEGORY_CONFIG["job-image"];
  return (
    <FileUploader
      allowedExtensions={config.allowedExtensions}
      maxSize={config.maxSize}
      folderPath={config.folder}
      fileCategory="job-image"
      multiple={false}
      {...props}
    />
  );
}
