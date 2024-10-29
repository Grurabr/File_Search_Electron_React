// public/electron.js
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Ловим событие от рендера (React) для поиска файлов
ipcMain.handle('search-files', async (event, folderName, searchTerm, pathToBaseDir) => {
  const folderPath = path.join(pathToBaseDir, folderName, 'Mittapöytäkirjat');

  if (!fs.existsSync(folderPath)) {
    return [`Kansiota "${folderName}" ei löydy`];
  }

  const files = fs.readdirSync(folderPath);
  const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));

  const filteredFiles = searchTerm
    ? excelFiles.filter(file => file.toLowerCase().includes(searchTerm.toLowerCase()))
    : excelFiles;

  return filteredFiles.length > 0 ? filteredFiles : ['Tiedostoja ei löytynyt.'];
});

// Открытие файла через shell
ipcMain.handle('open-file', async (event, folderName, fileName, pathToBaseDir) => {
  const filePath = path.join(pathToBaseDir, folderName, 'Mittapöytäkirjat', fileName);

  // Проверяем, существует ли файл перед открытием
  if (fs.existsSync(filePath)) {
    await shell.openPath(filePath);
  } else {
    return `Tiedostoa ${fileName} ei löydy.`;
  }
});


ipcMain.handle('copy-and-rename-excel-file', async (event, folderName, searchTerm, pathToCopyExcel, pathToBaseDir) => {
  const upperFolderName = folderName.toUpperCase();
  const upperSearchTerm = searchTerm.toUpperCase();
  
  const folderPath = path.join(pathToBaseDir, upperFolderName, "Mittapöytäkirjat");

  const copyFiles = fs.readdirSync(pathToCopyExcel)
  console.log(pathToCopyExcel, "path ennen search")

  const fileName = `${upperFolderName}M`


  const foundFile = copyFiles.find(file => file.startsWith(fileName) && (file.endsWith(".xlsx") || file.endsWith(".xls")))


  if (!foundFile) {
    console.error(`Tiedosto-malli ${fileName} ei löydy.`);
    return `Tiedosto-malli ${fileName} ei löydy.`;
  }

  const fullPathToCopy = path.join(pathToCopyExcel, foundFile)

  if (!fs.existsSync(fullPathToCopy)) {
    console.error(`Polku ${fullPathToCopy} ei löydy.`);
    return `Polku ${fullPathToCopy} ei löydy.`;
  }


  const date = new Date();
  const day = String(date.getDate()).padStart(2,"0");
  const month = String(date.getMonth()+1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const formattedDate = `${day}${month}${year}`;

  const newFileName = `${upperFolderName}M_${upperSearchTerm}_${formattedDate}.xlsx`;
  console.log(newFileName)
  const destinationPath = path.join(folderPath, newFileName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Копируем файл
  try {
    fs.copyFileSync(fullPathToCopy, destinationPath);
    return `Tiedosto ${upperFolderName} kopioitiin onnistuneesti kansioon ${folderPath}.`;
  } catch (error) {
    console.error('Virhe kopioitaessa tiedostoa:', error);
    return `Virhe kopioitaessa tiedostoa: ${error.message}`;
  }
});