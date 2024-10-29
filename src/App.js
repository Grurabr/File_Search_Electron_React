import React, { useState, useEffect } from 'react';
import './App.css'

function App() {
  const [folderName, setFolderName] = useState('');//nimikenumero
  const [searchTerm, setSearchTerm] = useState('');//työnumero
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [pathCheckbox, setPathCheckbox] = useState(false);
  const [pathToBaseDir, setPathToBaseDir] = useState("T:\\Yhteiset\\LAATU\\Mittaukset");
  const [pathToCopyExcel, setPathToCopyExcel] = useState("T:\\Kuvat");
  const [errorMessage, setErrorMessage] = useState('');
  const [radioButton, setRadioButton] = useState(""); //yritys


  const yritykset = ['Ponsse', 'Normet', 'Hydroline', 'Vexve', 'Farmi Forest', 'Parker', 'Hydac', 'Ratesteel'];

  useEffect(() => {
    if (radioButton) {
      switch (radioButton) {
        case "Ponsse":
          setPathToCopyExcel(`T:\\Kuvat\\PONSSE OYJ\\Kuva\\ESITÄYT.MITTAPKR`);
          break;
        case "Normet":
          setPathToCopyExcel(`T:\\Kuvat\\Normet\\ESITMTPKRJ`);
          break;
        case "Hydroline":
          setPathToCopyExcel(`T:\\Kuvat\\Hydroline\\ESITÄYT.MITTAPKR`);
          break;
        case "Vexve":
          setPathToCopyExcel(`T:\\Kuvat\\Vexve\\Esitäyt.mitt`);
          break;
        case "Farmi Forest":
          setPathToCopyExcel(`T:\\Kuvat\\Farmi Forest Oy\\ESITÄYT`);
          break;
        case "Parker":
          setPathToCopyExcel(`T:\\Kuvat\\Parker Hannifin Oy\\MITTAPTKRJA`);
          break;
        case "Hydac":
          setPathToCopyExcel(`T:\\Kuvat\\HYDAC OY\\Kuva\\ESITÄYT`);
          break;
        case "Ratesteel":
          setPathToCopyExcel(`T:\\Kuvat\\Ratesteel Oy\\ESITMTPKRJA`);
          break;
        default:
          break;
      }
    }
  }, [radioButton]);


  const handleSearch = async () => {
    if (!folderName) {
      setErrorMessage('Nimikenumero puuttuu!');
      return;
    }
    //setErrorMessage('');
    // Обращаемся к Electron для поиска файлов
    const results = await window.electronAPI.searchFiles(folderName, searchTerm, pathToBaseDir);

    if (results.length === 1 && results[0] === `Kansiota "${folderName}" ei löydy`) {
      setNoResults(true); // Устанавливаем состояние для отображения кнопки создания
      setSearchResults([]); // Очищаем результаты поиска
    } else {
      setSearchResults(results);
      setNoResults(results.length === 0 || results[0] === 'Tiedostoja ei löytynyt.'); // Устанавливаем флаг при отсутствии результатов
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

  const handleCopyAndRenameFile = async () => {

    try {
      const result = await window.electronAPI.copyAndRenameExcelFile(folderName, searchTerm, pathToCopyExcel, pathToBaseDir);
      setErrorMessage(result)
      //alert(result); // Выводим сообщение об успешном копировании и переименовании

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


  const handleOptionChange = (event) => {
    const selectedValue = event.target.value; // Сохраняем выбранное значение
    setRadioButton(event.target.value); // Устанавливаем новое значение для radioButton
    console.log("Selected radio button:", selectedValue);

  };


  const handleCreateFile = async () => {
    if (!searchTerm) {
      setErrorMessage('Työnumero puuttuu!');
      return;
    }

    if (!radioButton) {
      setErrorMessage("Asiakas puuttuu!");
      return;
    }



    setErrorMessage('');
    await handleCopyAndRenameFile();
    await handleSearch()
    //setPathToCopyExcel("T:\\Kuvat")

  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mittauspöytäkirjan haku</h1>

      {errorMessage && <p style={{ color: 'blue' }}>{errorMessage}</p>}

      <div>
        <input
          type="checkbox"
          id="path"
          name="path"
          checked={pathCheckbox}
          onChange={() => setPathCheckbox(!pathCheckbox)} />
        <label for="path">Muuttaa polkuja</label>
      </div>

      {pathCheckbox && (
        <div style={{ marginTop: "10px" }}>

          <input
            type='text'
            id='baseDirPath'
            value={pathToBaseDir}
            onChange={(e) => setPathToBaseDir(e.target.value)}
            style={{ marginRight: "10px" }} />
          <label htmlFor="baseDirPath">Polku T:\Yhteiset\LAATU\Mittaukset</label>
          <br />



          <input
            type='text'
            id='mpkMalli'
            value={pathToCopyExcel}
            onChange={(e) => setPathToCopyExcel(e.target.value)}
            style={{ marginRight: "10px" }} />
          <label htmlFor="mpkMalli">Polku josta etsimme MPKirjan mallia</label>
          <br />

        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Nimikenumero"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          style={{ marginRight: '10px' }}
        />
      </div>


      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          placeholder="Työnumero"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleSearch}>Etsiä</button>
      </div>

      {/* Таблица с результатами поиска */}
      <div style={{ marginTop: '20px' }}>
        
        {searchResults.length > 0 && searchResults[0] !== 'Tiedostoja ei löytynyt.' ? (
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
              <p>Tiedostoja ei löytynyt.</p>
              <p>Asiakas:</p>
              <div className="radio-group">
                {yritykset.map((yritys, index) => (
                  <label key={index} className="radio-label">
                    <input
                      type="radio"
                      value={yritys}
                      checked={radioButton === yritys}
                      onChange={handleOptionChange}
                    />
                    {yritys}
                  </label>
                ))}
              </div>
              <button onClick={handleCreateFile}>Luoda mittauspöytäkirja</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
