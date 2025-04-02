import React, { useState } from "react";
import {
  downloadScript,
  copyToClipboard,
  isBinaryFile,
  shouldIgnoreFile,
} from "./utils/fileUtils";
import { generateScript } from "./utils/scriptUtils";
import "./FolderToPowerShellConverter.css";

const FolderToPowerShellConverter = () => {
  const [files, setFiles] = useState([]);
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileContents, setFileContents] = useState({});
  const [ignoredFiles, setIgnoredFiles] = useState([]);

  const handleFileUpload = (event) => {
    setIsLoading(true);
    const items = event.target.files;
    const newFiles = [];
    const contents = {};
    const ignored = [];

    const readFileContent = (file) => {
      return new Promise((resolve) => {
        if (shouldIgnoreFile(file)) {
          ignored.push(file.webkitRelativePath);
          resolve(null);
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          ignored.push(
            `${file.webkitRelativePath} (too large - ${(
              file.size /
              1024 /
              1024
            ).toFixed(2)}MB)`
          );
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.onerror = () => {
          ignored.push(file.webkitRelativePath);
          resolve(null);
        };

        if (isBinaryFile(file)) {
          ignored.push(`${file.webkitRelativePath} (binary file)`);
          resolve(null);
        } else {
          reader.readAsText(file);
        }
      });
    };

    const processItems = async () => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const path = item.webkitRelativePath;

        if (shouldIgnoreFile(item)) {
          ignored.push(path);
          continue;
        }

        newFiles.push({
          name: item.name,
          path: path,
          size: item.size,
          type: item.type,
          isDirectory: path.split("/").length > 2 && item.size === 0,
        });

        if (item.size > 0 && !isBinaryFile(item)) {
          try {
            const content = await readFileContent(item);
            if (content !== null) {
              contents[path] = content;
            }
          } catch (error) {
            console.error(`Error reading file ${path}:`, error);
            ignored.push(path);
          }
        }
      }

      setFiles(newFiles);
      setFileContents(contents);
      setIgnoredFiles(ignored);
      generateScript(newFiles, contents, setScript);
      setIsLoading(false);
    };

    processItems();
  };

  return (
    <div className="container">
      <h1 className="header">Folder to PowerShell Converter</h1>

      <div className="file-input-container">
        <label className="file-input-label">Select Folder:</label>
        <input
          type="file"
          onChange={handleFileUpload}
          webkitdirectory="true"
          directory="true"
          multiple
          className="file-input"
        />
        <p className="file-input-helper">
          Select a folder to convert (module files will be ignored, but
          package.json and lock files will be included)
        </p>
      </div>

      {isLoading && (
        <div className="loading-message">
          Processing folder structure and reading file contents...
        </div>
      )}

      {files.length > 0 && (
        <div className="folder-preview">
          <h2 className="folder-preview-header">Folder Structure Preview</h2>
          <div className="folder-preview-content">
            <ul>
              {Array.from(
                new Set(files.map((file) => file.path.split("/")[0]))
              ).map((rootFolder, index) => (
                <li key={index} className="folder-preview-list">
                  {rootFolder}/
                </li>
              ))}
            </ul>
            <p className="folder-preview-summary">
              {files.length} total items processed (
              {Object.keys(fileContents).length} files with content)
              {ignoredFiles.length > 0 &&
                `, ${ignoredFiles.length} files ignored`}
            </p>
          </div>
        </div>
      )}

      {ignoredFiles.length > 0 && ignoredFiles.length < 100 && (
        <div className="ignored-files">
          <div className="ignored-files-container">
            <h3 className="ignored-files-header">
              Ignored Files ({ignoredFiles.length}):
            </h3>
            <div className="ignored-files-list">
              <ul>
                {ignoredFiles.slice(0, 20).map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
                {ignoredFiles.length > 20 && (
                  <li>...and {ignoredFiles.length - 20} more</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {script && (
        <div className="script-section">
          <div className="script-header">
            <h2 className="script-header-title">Generated PowerShell Script</h2>
            <div className="script-buttons">
              <button
                onClick={() => copyToClipboard(script)}
                className="script-button copy"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => downloadScript(script)}
                className="script-button download"
              >
                Download .ps1
              </button>
            </div>
          </div>
          <pre className="script-content">{script}</pre>
        </div>
      )}

      {script && (
        <div className="how-to-use">
          <div className="how-to-use-content">
            <p className="how-to-use-title">How to use this script:</p>
            <ol className="how-to-use-list">
              <li>Download the PowerShell script (.ps1 file)</li>
              <li>
                Place it in the location where you want to create the directory
                structure
              </li>
              <li>
                Right-click on the script and select "Run with PowerShell"
              </li>
              <li>
                If you encounter execution policy restrictions, use:{" "}
                <code>
                  PowerShell -ExecutionPolicy Bypass -File
                  .\create_directories.ps1
                </code>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderToPowerShellConverter;
