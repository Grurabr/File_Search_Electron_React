// main/electron.js
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const XlsxPopulate = require('xlsx-populate');

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
  //console.log(companyDataPath)
  if (fs.existsSync(companyDataPath)) {
    const fileContent = fs.readFileSync(companyDataPath);
    //let companies = JSON.parse(fileContent)
    //console.log(companies)
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

// Ловим событие от рендера (React) для поиска файлов в папке и подпапках
ipcMain.handle('search-files-saha', async (event, folderName, searchTerm, malliToBaseDir) => {
  const folderPath = path.join(malliToBaseDir, folderName);

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

ipcMain.handle('open-file-saha', async (event, folderName, fileName, malliToBaseDir) => {
  const filePath = path.join(malliToBaseDir, folderName, fileName);

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


ipcMain.handle('copy-and-rename-excel-file-saha', async (event, folderName, searchTerm, malliToBaseDir, material, sahaMitat) => {
  const upperFolderName = folderName.toUpperCase();
  const upperSearchTerm = searchTerm.toUpperCase();
  
  const folderPath = path.join(malliToBaseDir, upperFolderName);
  const folderFrom = path.join(malliToBaseDir, 'POHJA', "SAHAMIT.xlsx");

  if (!folderFrom) {
    console.error(`Tiedosto-mallia SAHAMIT.xlsx ei löydy.`);
    return `Tiedosto-mallia SAHAMIT.xlsx ei löydy.`;
  }

  if (!fs.existsSync(folderFrom)) {
    console.error(`Polkua ${folderFrom} ei löydy.`);
    return `Polkua ${folderFrom} ei löydy.`;
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
    fs.copyFileSync(folderFrom, destinationPath);

    // Открываем скопированный файл для редактирования
    const workbook = await XlsxPopulate.fromFileAsync(destinationPath);
    const sheet = workbook.sheet(0);

    // Устанавливаем значения в ячейки B6, B7 и B8
    sheet.cell("B6").value(searchTerm);
    sheet.cell("B7").value(material);
    sheet.cell("B8").value(sahaMitat);

    // Сохраняем файл
    await workbook.toFileAsync(destinationPath);

    return `Tiedosto ${upperFolderName} kopioitiin onnistuneesti kansioon ${folderPath}.`;
  } catch (error) {
    console.error('Virhe kopioitaessa tiedostoa:', error);
    return `Virhe kopioitaessa tiedostoa: ${error.message}`;
  }
});

ipcMain.handle("create-folders", async (event, cmm, romer, folderName, pathToBaseDir) => {
  const name = folderName.toUpperCase()
  const pathFrom = "T:\\Kuvat";
  const pathTo = path.join(pathToBaseDir, name);
  let message = ""

  
  if(cmm && !fs.existsSync(path.join(pathTo, "CMM Ohjelma"))){
    fs.mkdirSync(path.join(pathTo, "CMM Ohjelma"), { recursive: true });
    fs.mkdirSync(path.join(pathTo, "CMM Raportti"));
  }
  if(romer && !fs.existsSync(path.join(pathTo, "ROMER Ohjelma"))){
    fs.mkdirSync(path.join(pathTo, "ROMER Ohjelma"), { recursive: true });
    fs.mkdirSync(path.join(pathTo, "ROMER Raportti"));
  }
  if (!fs.existsSync(path.join(pathTo, "Jigi"))) {
    fs.mkdirSync(path.join(pathTo, "Jigi"));
  }
  if (!fs.existsSync(path.join(pathTo, "Mittapöytäkirjat"))) {
    fs.mkdirSync(path.join(pathTo, "Mittapöytäkirjat"));
  }

  const kuva = await searchFilesRecursive2(pathFrom, name, ["pdf", "PDF"])
  const step = await searchFilesRecursive2(pathFrom, name, ["step", "STEP", "stp", "STP"])
  const mittausKirja = await searchFilesRecursive2(pathFrom, name, ["xls", "xlsx"])

  if (kuva){
    createShortcutLink(kuva, path.join(pathTo, `${name} KUVA.lnk`))
    message += "Kuva luotu\n"
  } else {
    message += "Kuvaa ei löydy \n"
  }

  if (step){
    createShortcutLink(step, path.join(pathTo, `${name} STEP.lnk`))
    message += "Step luotu\n"
  } else {
    message += "Step ei löydy \n"
  }

  if (mittausKirja){
    createShortcutLink(mittausKirja, path.join(pathTo, `${name} MITTAPÖYTÄKIRJA.lnk`))
    message += "Mittauspöytäkirja luotu\n"
  } else {
    message += "Mittauspöytäkirjaa ei löydy \n"
  }

  if (cmm) {
    const cmmProgramPath = path.join(pathTo, "CMM Ohjelma", `${name}.PRG`);
    createShortcutLink(cmmProgramPath, path.join(pathTo, `${name} CMM Ohjelma.lnk`));
    message += "CMM Ohjelman pikakuvake luotu\n";
  }

  if (romer) {
    const romerProgramPath = path.join(pathTo, "ROMER Ohjelma", `${name}.mcam`);
    createShortcutLink(romerProgramPath, path.join(pathTo, `${name} ROMER Ohjelma.lnk`));
    message += "ROMER Ohjelman pikakuvake luotu\n";
  }

  return message
})

function createShortcutLink(pathFrom, pathTo){
  shell.writeShortcutLink(pathTo, {
    target: pathFrom,
    type: "link"
  })
}


function searchFilesRecursive2(directoryPath, searchTerm, rash) {
  let results = "";

  const filesAndDirs = fs.readdirSync(directoryPath, { withFileTypes: true });

  filesAndDirs.forEach(entry => {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      // Если текущая запись - директория, вызываем функцию рекурсивно
      results = results.concat(searchFilesRecursive2(fullPath, searchTerm, rash));
    } else if (entry.isFile()) {
      // Проверяем, заканчивается ли имя файла на одно из расширений в массиве rash
      const fileExtension = entry.name.split('.').pop().toLowerCase();
      if (rash.includes(fileExtension)) {
        if (!searchTerm || entry.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          results = fullPath;
        }
      }
    }
  });

  return results;
}

// Открытие файла через shell
ipcMain.handle('open-folder', async (event, folderName,  pathToBaseDir) => {
  const filePath = path.join(pathToBaseDir, folderName);

  // Проверяем, существует ли файл перед открытием
  if (fs.existsSync(filePath)) {
    await shell.openPath(filePath);
  }
});