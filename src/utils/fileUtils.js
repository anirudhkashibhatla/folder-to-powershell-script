// Utility function to check if a file is binary
export const isBinaryFile = (file) => {
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

// Utility function to check if a file should be ignored
export const shouldIgnoreFile = (file) => {
  const path = file.webkitRelativePath.toLowerCase();

  const ignorePatterns = [
    "/node_modules/",
    "/modules/",
    ".dll",
    ".psd1",
    ".psm1",
    ".module",
    ".pyc",
    "__pycache__",
    ".git/",
    "/bin/",
    "/obj/",
    ".vs/",
    ".vscode/",
    ".suo",
    ".user",
    ".sln",
    ".cache",
  ];

  return ignorePatterns.some((pattern) => path.includes(pattern));
};

export const downloadScript = (script) => {
  if (!script) {
    console.error("No script content provided.");
    return;
  }
  const blob = new Blob([script], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "create_directories.ps1";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

export const copyToClipboard = (script) => {
  navigator.clipboard
    .writeText(script)
    .then(() => {
      alert("Script copied to clipboard!");
      console.log(script);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
};
