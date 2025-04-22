import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './App.css';

function App() {
  const [folderName, setFolderName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [asiakasNimi, setAsiakasNimi] = useState('');
  const [asiakasPath, setAsiakasPath] = useState('');

  const [material, setMaterial] = useState('');
  const [sahaMitat, setSahaMitat] = useState('');

  const [malliToBaseDir, setMalliToBaseDir] = useState('T:\\Yhteiset\\LAATU\\SAHAUS');


  const [searchResults, setSearchResults] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [noResults, setNoResults] = useState(false);
  const [pathCheckbox, setPathCheckbox] = useState(false);
  const [pathToBaseDir, setPathToBaseDir] = useState("T:\\Yhteiset\\LAATU\\Mittaukset");

  const [cmm, setCmm] = useState(true); //yritys
  const [romer, setRomer] = useState(true);
  const [naytaVaiEi, setNaytaVaiEi] = useState(false);


  // Загружаем компании из файла companies.json
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await window.electronAPI.getCompanies();
      console.log("App-loadCompanies: ", response)
      setCompanies(response);
    } catch (error) {
      console.error('Virhe yritysten latauksessa:', error);
      setErrorMessage('Yrityslistaa ei onnistuttu lataamaan.');
    }
  };

  const addCompany = async (newName, newPath) => {
    try {

      await window.electronAPI.addCompany(newName, newPath)

    } catch (error) {
      console.error('Virhe yritysten tallennuksessa:', error);
      setErrorMessage('Yrityslistaa ei onnistuttu tallentamaan.');
    }
  }

  const handleSearch = async () => {
    if (!folderName) {
      setErrorMessage('Nimikenumero puuttuu!');
      return;
    }

    //setErrorMessage('');

    // Обращаемся к Electron для поиска файлов
    const results = await window.electronAPI.searchFiles(folderName, searchTerm, pathToBaseDir);

    if (results[0] === `Kansiota "${folderName}" ei löydy`) {
      setNoResults(true); // Устанавливаем состояние для отображения кнопки создания
      setSearchResults([]); // Очищаем результаты поиска
    } else {
      setSearchResults(results);
      setNoResults(results.length === 0 || results[0] === 'Tiedostoa ei löydy.'); // Устанавливаем флаг при отсутствии результатов
    }
  };



  const handleSearchSaha = async () => {
    if (!folderName) {
      setErrorMessage('Nimikenumero puuttuu!');
      return;
    }

    //setErrorMessage('');

    // Обращаемся к Electron для поиска файлов
    const results = await window.electronAPI.searchFilesSaha(folderName, searchTerm, malliToBaseDir);

    if (results[0] === `Kansiota "${folderName}" ei löydy`) {
      setNoResults(true); // Устанавливаем состояние для отображения кнопки создания
      setSearchResults([]); // Очищаем результаты поиска
    } else {
      setSearchResults(results);
      setNoResults(results.length === 0 || results[0] === 'Tiedostoa ei löydy.'); // Устанавливаем флаг при отсутствии результатов
    }
  };

  // Функция для открытия файла по клику
  const handleOpenFile = async (fileName) => {
    try {
      const result = await window.electronAPI.openFile(folderName, fileName, pathToBaseDir);
      setErrorMessage(result)
    } catch (error) {
      console.error('Virhe:', error);
    }
  };

  const handleOpenFileSaha = async (fileName) => {
    try {
      const result = await window.electronAPI.openFileSaha(folderName, fileName, malliToBaseDir);
      setErrorMessage(result)
    } catch (error) {
      console.error('Virhe:', error);
    }
  };
  const handleOpenFolder = async (folderName) => {
    try {
      const result = await window.electronAPI.openFolder(folderName, pathToBaseDir);
    } catch (error) {
      console.error('Virhe:', error);
    }
  };


  const handleCopyAndRenameFile = async () => {
    if (!folderName) {
      setErrorMessage('Nimikenumero puuttuu!');
      return;
    }
    if (!searchTerm) {
      setErrorMessage('Työnumero puuttuu!');
      return;
    }

    if (!selectedCompany) {
      setErrorMessage('Yritystä ei ole valittu!');
      return;
    }

    const selectedCompanyObject = companies.find(c => c.name === selectedCompany);
    if (!selectedCompanyObject) {
      setErrorMessage('Valittua yritystä ei löydy.');
      return;
    }

    try {
      const result = await window.electronAPI.copyAndRenameExcelFile(folderName, searchTerm, selectedCompanyObject.path, pathToBaseDir);
      setErrorMessage(result)
      //alert(result); // Выводим сообщение об успешном копировании и переименовании

    } catch (error) {
      console.error('Virhe:', error);
    }
  };

  const handleCopyAndRenameFileSaha = async () => {
    if (!folderName) {
      setErrorMessage('Nimikenumero puuttuu!');
      return;
    }
    if (!searchTerm) {
      setErrorMessage('Työnumero puuttuu!');
      return;
    }

    try {
      const result = await window.electronAPI.copyAndRenameExcelFileSaha(folderName, searchTerm, malliToBaseDir, material, sahaMitat);
      setErrorMessage(result)

    } catch (error) {
      console.error('Virhe:', error);
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.length !== 6) return dateStr || ''; // Проверяем, что dateStr определен и имеет нужную длину
    const year = `20${dateStr.slice(4, 6)}`;
    const month = dateStr.slice(2, 4);
    const day = dateStr.slice(0, 2);
    return `${day}.${month}.${year}`;
  };

  const handleUusiAsiakas = async () => {

    await addCompany(asiakasNimi, asiakasPath);
    setAsiakasNimi('');
    setAsiakasPath('');

    await loadCompanies();
  }

  const handleCreateFile = async () => {
    if (!searchTerm) {
      setErrorMessage('Työnumero puuttuu!');
      return;
    }

    if (!folderName) {
      setErrorMessage("Nimikenumero puuttuu!")
      return;
    }

    setErrorMessage('');
    await handleCopyAndRenameFile();
    await handleSearch()
  };

  const handleCreateFileSaha = async () => {
    if (!searchTerm) {
      setErrorMessage('Työnumero puuttuu!');
      return;
    }

    if (!folderName) {
      setErrorMessage("Nimikenumero puuttuu!")
      return;
    }

    setErrorMessage('');
    await handleCopyAndRenameFileSaha();
    await handleSearchSaha()
  };

  const handleLuoKansioita = async () => {
    if (!folderName) {
      setErrorMessage("Nimikenumero puuttuu!")
      return;
    }

    if (!selectedCompany) {
      setErrorMessage('Yritystä ei ole valittu!');
      return;
    }

    const selectedCompanyObject = companies.find(c => c.name === selectedCompany);

    try {
      const result = await window.electronAPI.luoKansioita(folderName, selectedCompanyObject.path);
      setErrorMessage(result)

    } catch (error) {
      console.error('Virhe:', error);
    }
  }

  const handleKansiodenLuonti = async () => {
    if ((cmm || romer) && folderName) {
      try {

        const luoKansiot = await window.electronAPI.createFolders(cmm, romer, folderName, pathToBaseDir)
        setNaytaVaiEi(true)
        setErrorMessage(luoKansiot)
      }
      catch (error) {
        console.log('Virhe kansioiden luonnissa:', error)
        setErrorMessage('Virhe kansioiden luonnissa.')
      }
    } else {
      setErrorMessage("Valitse CMM tai Romer (tai molemmat) ja syötä nimikenumero")
    }
  }

  const handleTabSelect = () => {
    setErrorMessage("")
    setNaytaVaiEi(false)
  }


  return (

    <div className="App" style={{width: '100%', padding: '5px'}}>
      <Tabs onSelect={handleTabSelect}>
        <TabList className="my-tab-list">
          <Tab className="my-tab" selectedClassName="my-selected-tab">Haku</Tab>
          <Tab className="my-tab" selectedClassName="my-selected-tab">Laatu</Tab>
        </TabList>

        <TabPanel>
          {/* Haku */}
          <div style={{
            width: '100%'
           }}>

            {errorMessage && <p style={{ color: 'blue' }}>{errorMessage}</p>}
            {/*
            <div>
              <input
                type="checkbox"
                id="path"
                name="path"
                checked={pathCheckbox}
                onChange={() => setPathCheckbox(!pathCheckbox)} />
              <label for="path">Options</label>
            </div>
              */}
            {pathCheckbox && (
              <div style={{ marginTop: "10px" }}>

                <input
                  type='text'
                  id='baseDirPath'
                  value={pathToBaseDir}
                  onChange={(e) => setPathToBaseDir(e.target.value)}
                  style={{ marginRight: "10px" }} />
                <label htmlFor="baseDirPath">Mittauspöytäkirjan kansiopolku</label>
                <br />


                <input
                  type='text'
                  id='uusiAsiakasNimi'
                  value={asiakasNimi}
                  onChange={(e) => setAsiakasNimi(e.target.value)}
                  style={{ marginRight: "10px" }} />
                <label htmlFor="uusiAsiakasNimi">Uusi asiakas</label>
                <br />


                <input
                  type='text'
                  id='uusiAsiakasPath'
                  value={asiakasPath}
                  onChange={(e) => setAsiakasPath(e.target.value)}
                  style={{ marginRight: "10px" }} />
                <label htmlFor="uusiAsiakasPath">Polku</label>
                <br />
                <br />

                <button onClick={handleUusiAsiakas}>Uusi asiakas</button>
                <br />
                <br />
              </div>
            )}
            <div>{/* Ввод данных поиска */}

              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Nimikenumero"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  style={{ marginTop: '5px' }}
                />
                <br />
                <input 
                  type="text"
                  placeholder="Työnumero"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ marginTop: '5px' }}
                />
              </div>
              <button style={{marginTop: '5px'}} onClick={handleSearch}>Haku</button>
            </div>

            {/* Таблица с результатами поиска */}
            <div className='scrollable-table'>

              {searchResults.length > 0 && searchResults[0] !== 'Tiedostoa ei löydy.' ? (
                <div>
                  <h3>Tulos:</h3>
                  <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%'}}>
                    <thead>
                      <tr>
                        <th><strong>Nimikenumero</strong></th>
                        <th><strong>Työnumero</strong></th>
                        <th><strong>Päivämäärä</strong></th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((file, index) => {
                        const fileName = file.split('\\').pop();
                        const [nimikenumero, tilausnumero, datePart] = fileName.replace('.xlsx', '').replace('.xls', '').split('_');
                        const formattedDate = formatDate(datePart);

                        return (
                          <tr key={index}>
                            <td>{nimikenumero}</td>
                            <td>
                              <button
                                onClick={() => handleOpenFile(file)}
                                style={{
                                  color: 'blue',
                                  textDecoration: 'underline',
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                }}
                              >
                                {tilausnumero}
                              </button>
                            </td>
                            <td>{formattedDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                noResults && (
                  <div>
                    <p>Tiedostoa ei löydy.</p>
                    <div style={{ marginBottom: '20px' }}>
                      <label>Valitse asiakas:</label>
                      <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}>
                        <option value="0">Kaikki</option>
                        {companies.map((company, index) => (
                          <option key={index} value={company.name}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>


                    <button style={{marginTop: '5px'}} onClick={handleCreateFile}>Luo uusi mittauspöytäkirja</button>
                  </div>
                )
              )}
            </div>
          </div>
        </TabPanel>
{/*
        <TabPanel>
          {/* Saha 
          <div style={{ padding: '20px' }}>

            {errorMessage && <p style={{ color: 'blue' }}>{errorMessage}</p>}

            <div>
              <input
                type="checkbox"
                id="path"
                name="path"
                checked={pathCheckbox}
                onChange={() => setPathCheckbox(!pathCheckbox)} />
              <label for="path">Options</label>
            </div>

            {pathCheckbox && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type='text'
                  id='malliDirPath'
                  value={malliToBaseDir}
                  onChange={(e) => setMalliToBaseDir(e.target.value)}
                  style={{ marginRight: "10px" }} />
                <label htmlFor="malliDirPath">Malli kansiopolku</label>
                <br />
              </div>
            )}
            <div>

              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Nimikenumero"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <br />

                <input
                  type="text"
                  placeholder="Työnumero"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <br />
              </div>

              <button onClick={handleSearchSaha}>Haku</button>
            </div>


            {/* Таблица с результатами поиска 
            <div style={{ marginTop: '20px' }}>

              {searchResults.length > 0 && searchResults[0] !== 'Tiedostoa ei löydy.' ? (
                <div className="scrollable-table">
                  <h3>Tulos:</h3>
                  <table border="1" cellPadding="10" cellSpacing="0">
                    <thead>
                      <tr>
                        <th><strong>Nimikenumero</strong></th>
                        <th><strong>Työnumero</strong></th>
                        <th><strong>Päivämäärä</strong></th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((file, index) => {
                        const fileName = file.split('\\').pop();
                        const [nimikenumero, tilausnumero, datePart] = fileName.replace('.xlsx', '').replace('.xls', '').split('_');
                        const formattedDate = formatDate(datePart);

                        return (
                          <tr key={index}>
                            <td>{nimikenumero}</td>
                            <td>
                              <button
                                onClick={() => handleOpenFileSaha(file)}
                                style={{
                                  color: 'blue',
                                  textDecoration: 'underline',
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                }}
                              >
                                {tilausnumero}
                              </button>
                            </td>
                            <td>{formattedDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                noResults && (
                  <div>
                    <p>Tiedostoa ei löydy.</p>
                    <div style={{ marginTop: '10px', marginBottom: "10px" }}>
                      <input
                        type='text'
                        id='sahaMitat'
                        placeholder='Ø tai sivu*sivu'
                        value={sahaMitat}
                        onChange={(e) => setSahaMitat(e.target.value)}
                        style={{ marginRight: "10px" }} />
                      <label htmlFor="sahaMitat">Mitat</label>
                      <br />
                      <input
                        type='text'
                        id='material'
                        placeholder='Materiaali'
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        style={{ marginRight: "10px" }} />
                      <label htmlFor="material">Materiaali</label>
                      <br />
                    </div>

                    <button onClick={handleCreateFileSaha}>Luo uusi mittauspöytäkirja</button>
                  </div>
                )
              )}
            </div>
          </div>
        </TabPanel>
*/}
        <TabPanel>
          <div style={{
            width: '100%'
           }}>

            <h4>Kansioiden luonti</h4>
            <input
              type="checkbox"
              id="CMM"
              name='CMM'
              checked={cmm}
              onChange={() => setCmm(!cmm)} />
            <label for="CMM">CMM</label>
            <br />

            <input
              type="checkbox"
              id="ROMER"
              name='ROMER'
              checked={romer}
              onChange={() => setRomer(!romer)} />
            <label for="ROMER">Romer</label>
            <br />

            <input
              type="text"
              id="nimikeNro"
              name="nimikeNro"
              checked={folderName}
              onChange={(e) => setFolderName(e.target.value)} />
              <label for="nimikeNro">Nimikenumero</label>
            <br />

            <button style={{marginTop: '5px'}} onClick={handleKansiodenLuonti}>
              Luo
            </button>
            <br />
          </div>

          <div>
            {naytaVaiEi && <p style={{ color: 'blue', whiteSpace: "pre-line" }}>{errorMessage}</p>}
          </div>

          {naytaVaiEi && (
            <button
              onClick={() => handleOpenFolder(folderName)}
              style={{
                color: 'blue',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              Avaa luodut kansiot
            </button>
          )}

        </TabPanel>

      </Tabs>
    </div>

  );
}

export default App;


/*
<Tab className="my-tab" selectedClassName="my-selected-tab">Saha</Tab>

<TabPanel>

          {errorMessage && <p style={{ color: 'blue' }}>{errorMessage}</p>}

          <div>
            <input
              type="checkbox"
              id="path"
              name="path"
              checked={pathCheckbox}
              onChange={() => setPathCheckbox(!pathCheckbox)} />
            <label for="path">Options</label>
          </div>

          {pathCheckbox && (
            <div style={{ marginTop: "10px" }}>

              <input
                type='text'
                id='baseDirPath'
                value={pathToBaseDir}
                onChange={(e) => setPathToBaseDir(e.target.value)}
                style={{ marginRight: "10px" }} />
              <label htmlFor="baseDirPath">Mittauspöytäkirjan kansiopolku</label>
              <br />

            </div>
          )}

          <div style={{ marginTop: "10px" }}>
            <div>
              <input
                type="text"
                placeholder="Nimikenumero"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                style={{ marginRight: '10px' }}
              />
            </div>
            <br />
            <div style={{ marginBottom: '20px' }}>
              <label>Valitse asiakas:</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}>
                <option value="" disabled>Valitse asiakas...</option>
                {companies.map((company, index) => (
                  <option key={index} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <br />
            <button onClick={handleLuoKansioita}>Luo kansioita ja tiedostoja</button>
            <br />

            

          </div>
        </TabPanel>
*/