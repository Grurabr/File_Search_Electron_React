// public/preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  searchFiles: (folderName, searchTerm, pathToBaseDir) => ipcRenderer.invoke('search-files', folderName, searchTerm, pathToBaseDir),
  searchFilesSaha: (folderName, searchTerm, malliToBaseDir) => ipcRenderer.invoke('search-files-saha', folderName, searchTerm, malliToBaseDir),
  openFile: (folderName, fileName, pathToBaseDir) => ipcRenderer.invoke('open-file', folderName, fileName, pathToBaseDir),
  copyAndRenameExcelFileSaha: (folderName, searchTerm, malliToBaseDir, material, sahaMitat) => ipcRenderer.invoke('copy-and-rename-excel-file-saha', folderName, searchTerm, malliToBaseDir, material, sahaMitat),
  copyAndRenameExcelFile: (folderName, searchTerm, pathToCopyExcel, pathToBaseDir) => ipcRenderer.invoke('copy-and-rename-excel-file', folderName, searchTerm, pathToCopyExcel, pathToBaseDir),
  addCompany: (companyName, companyPath) => ipcRenderer.invoke('add-company', companyName, companyPath),
  getCompanies: () => ipcRenderer.invoke('get-companies')
});
