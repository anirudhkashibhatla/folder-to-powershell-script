export const escapeForPowerShell = (str) => {
  if (!str) return "";
  return str.replace(/'/g, "''");
};

export const generateScript = (filesList, contents, setScript) => {
  const directories = new Set();

  filesList.forEach((file) => {
    const pathParts = file.path.split("/");
    if (pathParts.length > 1) {
      let currentPath = "";
      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath =
          currentPath === "" ? pathParts[i] : `${currentPath}/${pathParts[i]}`;
        if (currentPath !== "") directories.add(currentPath);
      }
    }
  });

  const sortedDirs = Array.from(directories).sort(
    (a, b) => a.split("/").length - b.split("/").length
  );

  let powershellScript = `# PowerShell Script to recreate folder structure\n`;
  powershellScript += `# Generated on ${new Date().toLocaleString()}\n\n`;
  powershellScript += `$scriptPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition\n`;
  powershellScript += `if ([string]::IsNullOrEmpty($scriptPath)) {\n`;
  powershellScript += `    $scriptPath = (Get-Location).Path\n`;
  powershellScript += `}\n`;
  powershellScript += `Write-Host "Creating directory structure at: $scriptPath" -ForegroundColor Cyan\n\n`;

  sortedDirs.forEach((dir) => {
    const pathWithBackslashes = dir.replace(/\//g, "\\");
    powershellScript += `try {\n`;
    powershellScript += `    $dirPath = Join-Path -Path $scriptPath -ChildPath "${pathWithBackslashes}"\n`;
    powershellScript += `    if (!(Test-Path -Path $dirPath)) {\n`;
    powershellScript += `        New-Item -ItemType Directory -Path $dirPath -Force | Out-Null\n`;
    powershellScript += `        Write-Host "Created directory: ${pathWithBackslashes}" -ForegroundColor Green\n`;
    powershellScript += `    } else {\n`;
    powershellScript += `        Write-Host "Directory already exists: ${pathWithBackslashes}" -ForegroundColor Yellow\n`;
    powershellScript += `    }\n`;
    powershellScript += `} catch {\n`;
    powershellScript += `    Write-Host "Failed to create directory ${pathWithBackslashes}: $_" -ForegroundColor Red\n`;
    powershellScript += `}\n`;
  });

  const textFiles = filesList.filter(
    (file) => !file.isDirectory && contents[file.path]
  );

  powershellScript += `\n# Create files with content\n`;

  textFiles.forEach((file) => {
    const filePath = file.path.replace(/\//g, "\\");
    const fileContent = escapeForPowerShell(contents[file.path] || "");

    powershellScript += `try {\n`;
    powershellScript += `    $filePath = Join-Path -Path $scriptPath -ChildPath "${filePath}"\n`;
    powershellScript += `    $fileContent = @'\n${fileContent}\n'@\n`;
    powershellScript += `    Set-Content -Path $filePath -Value $fileContent -Force -Encoding UTF8\n`;
    powershellScript += `    Write-Host "Created file: ${filePath}" -ForegroundColor Green\n`;
    powershellScript += `} catch {\n`;
    powershellScript += `    Write-Host "Failed to create file ${filePath}: $_" -ForegroundColor Red\n`;
    powershellScript += `}\n\n`;
  });

  powershellScript += `Write-Host "=================================================================" -ForegroundColor Cyan\n`;
  powershellScript += `Write-Host "Directory structure and files created successfully at $scriptPath" -ForegroundColor Green\n`;
  powershellScript += `Write-Host "Directories created: ${sortedDirs.length}" -ForegroundColor Cyan\n`;
  powershellScript += `Write-Host "Files created: ${textFiles.length}" -ForegroundColor Cyan\n`;
  powershellScript += `Write-Host "=================================================================" -ForegroundColor Cyan\n`;

  setScript(powershellScript);
};
