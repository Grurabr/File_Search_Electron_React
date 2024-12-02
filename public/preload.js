// public/preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  searchFiles: (folderName, searchTerm, pathToBaseDir) => ipcRenderer.invoke('search-files', folderName, searchTerm, pathToBaseDir),
  searchFilesSaha: (folderName, searchTerm, malliToBaseDir) => ipcRenderer.invoke('search-files-saha', folderName, searchTerm, malliToBaseDir),
  openFile: (folderName, fileName, pathToBaseDir) => ipcRenderer.invoke('open-file', folderName, fileName, pathToBaseDir),
  openFileSaha: (folderName, fileName, malliToBaseDir) => ipcRenderer.invoke('open-file-saha', folderName, fileName, malliToBaseDir),
  copyAndRenameExcelFileSaha: (folderName, searchTerm, malliToBaseDir, material, sahaMitat) => ipcRenderer.invoke('copy-and-rename-excel-file-saha', folderName, searchTerm, malliToBaseDir, material, sahaMitat),
  copyAndRenameExcelFile: (folderName, searchTerm, pathToCopyExcel, pathToBaseDir) => ipcRenderer.invoke('copy-and-rename-excel-file', folderName, searchTerm, pathToCopyExcel, pathToBaseDir),
  addCompany: (companyName, companyPath) => ipcRenderer.invoke('add-company', companyName, companyPath),
  luoKansioita: (folderName, companyPath) => ipcRenderer.invoke('luo-kansioita', folderName, companyPath),
  getCompanies: () => ipcRenderer.invoke('get-companies'),
  createFolders: (cmm, romer, folderName, pathToBaseDir) => ipcRenderer.invoke("create-folders", cmm, romer, folderName, pathToBaseDir),
  openFolder: (folderName, pathToBaseDir) => ipcRenderer.invoke('open-folder', folderName, pathToBaseDir),
});
