export const FILE_CATEGORY_CONFIG = {
  "profile-picture": {
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    maxSize: 5 * 1024 * 1024,
    folder: "profile-pictures",
  },
  resume: {
    allowedExtensions: ["pdf"],
    maxSize: 10 * 1024 * 1024,
    folder: "resumes",
  },
  "job-image": {
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    maxSize: 5 * 1024 * 1024,
    folder: "job-images",
  },
};
