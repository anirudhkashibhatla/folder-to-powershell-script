export const isBinaryFile = (file) => {
  // Simplified check for binary files based on MIME type and extension
  const binaryMimeTypes = [
    "application/octet-stream",
    "application/x-executable",
    "application/x-dosexec",
    "application/x-msdownload",
    "application/vnd.microsoft",
    "application/x-ms",
  ];

  const binaryExtensions = [
    ".exe",
    ".dll",
    ".obj",
    ".bin",
    ".dat",
    ".pdb",
    ".so",
    ".class",
    ".pyc",
    ".pyo",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".zip",
    ".tar",
    ".gz",
    ".7z",
  ];

  // Check MIME type
  if (binaryMimeTypes.some((type) => file.type.includes(type))) {
    return true;
  }

  // Check extension
  const extension = "." + file.name.split(".").pop().toLowerCase();
  if (binaryExtensions.includes(extension)) {
    return true;
  }

  return false;
};
