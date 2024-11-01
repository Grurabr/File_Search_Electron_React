// public/preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Экспортируем API для взаимодействия через IPC
contextBridge.exposeInMainWorld('electronAPI', {
  searchFiles: (folderName, searchTerm, pathToBaseDir) => ipcRenderer.invoke('search-files', folderName, searchTerm, pathToBaseDir),
  openFile: (folderName, fileName, pathToBaseDir) => ipcRenderer.invoke('open-file', folderName, fileName, pathToBaseDir),
  copyAndRenameExcelFile: (folderName, searchTerm, pathToCopyExcel, pathToBaseDir) => ipcRenderer.invoke('copy-and-rename-excel-file', folderName, searchTerm, pathToCopyExcel, pathToBaseDir),
});
