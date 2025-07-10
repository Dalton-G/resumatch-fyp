import FileUploader, { FileUploaderProps } from "./file-uploader";
import { FILE_CATEGORY_CONFIG } from "@/config/file-category-config";

export default function ProfilePictureUploader(
  props: Partial<FileUploaderProps>
) {
  const config = FILE_CATEGORY_CONFIG["profile-picture"];
  return (
    <FileUploader
      allowedExtensions={config.allowedExtensions}
      maxSize={config.maxSize}
      folderPath={config.folder}
      fileCategory="profile-picture"
      label="Upload Profile Picture"
      multiple={false}
      {...props}
    />
  );
}
