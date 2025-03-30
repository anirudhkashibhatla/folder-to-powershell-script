import React from "react";

const FileUploader = ({ handleFileUpload, isLoading }) => {
  return (
    <div className="mb-6">
      <label className="block mb-2 font-medium">Select Folder:</label>
      <input
        type="file"
        onChange={handleFileUpload}
        webkitdirectory="true"
        directory="true"
        multiple
        className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
      />
      <p className="mt-1 text-sm text-gray-500">
        Select a folder to convert (module files will be ignored, but
        package.json and lock files will be included)
      </p>

      {isLoading && (
        <div className="my-4 text-blue-600">
          Processing folder structure and reading file contents...
        </div>
      )}
    </div>
  );
};

export default FileUploader;
