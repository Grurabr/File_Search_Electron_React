// main/electron.js
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Используем file:// для загрузки index.html из папки build
  const startURL = path.join(__dirname, '..', 'build', 'index.html');
  mainWindow.loadFile(startURL);
}

app.whenReady().then(() => {
  createWindow();

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Avaa kehittäjätyökalut',
          accelerator: 'Ctrl+Shift+I',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        },
        { role: 'Quit' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//const companyDataPath = path.join(__dirname, "..", 'resources', 'companies.json');
const companyDataPath = path.join(app.getPath('userData'), 'companies.json');


// Сохранение информации о компании
ipcMain.handle('add-company', async (event, companyName, companyPath) => {

  let companies = [];
  if (fs.existsSync(companyDataPath)) {
    const fileContent = fs.readFileSync(companyDataPath);
    companies = JSON.parse(fileContent);
  }

  companies.push({ name: companyName, path: companyPath });
  fs.writeFileSync(companyDataPath, JSON.stringify(companies, null, 2));

  return 'Asiakas lisätty onnistuneesti!';
});

// Получение списка компаний
ipcMain.handle('get-companies', async () => {
  // Чтение файла companies.json
  console.log(companyDataPath)
  if (fs.existsSync(companyDataPath)) {
    const fileContent = fs.readFileSync(companyDataPath);
    let companies = JSON.parse(fileContent)
    console.log(companies)
    return JSON.parse(fileContent);
  }

  return [];
});




// Ловим событие от рендера (React) для поиска файлов в папке и подпапках
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

  return filteredFiles.length > 0 ? filteredFiles : ['Tiedostoa ei löydy.'];
});



/*
ipcMain.handle('search-files', async (event, folderName, searchTerm, pathToBaseDir) => {
  const folderPath = path.join(pathToBaseDir, folderName, 'Mittapöytäkirjat');

  if (!fs.existsSync(pathToBaseDir)) {
    return [`Kansiota "${folderName}" ei löydy`];
  }

  const filteredFiles = searchFilesRecursive(pathToBaseDir, searchTerm);

  return filteredFiles.length > 0 ? filteredFiles : ['Tiedostoja ei löytynyt.'];
});
*/

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

// Функция для рекурсивного поиска файлов в папках и подпапках
function searchFilesRecursive(directoryPath, searchTerm) {
  let results = "";

  const filesAndDirs = fs.readdirSync(directoryPath, { withFileTypes: true });

  filesAndDirs.forEach(entry => {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      // Если текущая запись - директория, вызываем функцию рекурсивно
      results = results.concat(searchFilesRecursive(fullPath, searchTerm));
    } else if (entry.isFile() && (entry.name.endsWith('.xlsx') || entry.name.endsWith('.xls'))) {
      if (!searchTerm || entry.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        results = fullPath;
      }
    }
  });

  return results;
}

ipcMain.handle('copy-and-rename-excel-file', async (event, folderName, searchTerm, pathToCopyExcel, pathToBaseDir) => {
  const upperFolderName = folderName.toUpperCase();
  const upperSearchTerm = searchTerm.toUpperCase();
  
  const folderPath = path.join(pathToBaseDir, upperFolderName, "Mittapöytäkirjat");

  //const allCopyFiles = fs.readdirSync(pathToCopyExcel)
  console.log(pathToCopyExcel, "path ennen search")

  const fileName = `${upperFolderName}M`

  const foundFile = searchFilesRecursive(pathToCopyExcel, fileName)

  //const foundFile = allCopyFiles.find(file => file.startsWith(fileName) && (file.endsWith(".xlsx") || file.endsWith(".xls")))


  if (!foundFile) {
    console.error(`Tiedosto-mallia ${fileName} ei löydy.`);
    return `Tiedosto-mallia ${fileName} ei löydy.`;
  }

  //const fullPathToCopy = path.join(pathToCopyExcel, foundFile)

  if (!fs.existsSync(foundFile)) {
    console.error(`Polkua ${foundFile} ei löydy.`);
    return `Polkua ${foundFile} ei löydy.`;
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
    fs.copyFileSync(foundFile, destinationPath);
    return `Tiedosto ${upperFolderName} kopioitiin onnistuneesti kansioon ${folderPath}.`;
  } catch (error) {
    console.error('Virhe kopioitaessa tiedostoa:', error);
    return `Virhe kopioitaessa tiedostoa: ${error.message}`;
  }
});