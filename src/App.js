import React from 'react';
import styled from 'styled-components';
import Papa from "papaparse";
import Tables from './Tables';
import Statsig from 'statsig-js-lite';

const Header = styled.header`
  background: linear-gradient(135deg, #3b86d5 0%, #121c5c 100%);
  color: #ffffff;
  padding: 20px;
  text-align: center;
`;

const Input = styled.input`
  border: none;
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  display: block;
  text-align: center;
  margin: auto;
`;

const Button = styled.button`
  background-color: #00c29c;
  border: none;
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 24px 12px 24px;
  transition: background-color 0.2s ease-in-out;
  margin: 6px 0 24px 0;
  &:hover {
    background-color: #00896c;
  }
`;

function getData(file) {
  
  return new Promise((resolve, reject) => {
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      console.error('The File APIs are not fully supported in this browser.');
      return reject('The File APIs are not fully supported in this browser.');
    }
    let reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      return resolve(parsedData);
    };
    reader.readAsText(file);
  });
}

function App() {
  const [file, setFile] = React.useState(null);
  const [data, setData] = React.useState(null);

  React.useEffect( () => {
    async function initializeStatsig() {
      await Statsig.initialize("client-qdtoJK1mqOynTm63re6LHGNkeOInnDMCaJw07Rr0pWl");
      Statsig.logEvent("page_load");
    }
    initializeStatsig();
    return () => {
      Statsig.shutdown();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    Statsig.logEvent("analyze");
    const parsedData = await getData(file);
    setData(parsedData);
  };

  const handleFile = e => {
    Statsig.logEvent("csv_submit");
    setFile(e.target.files[0]);
  };

  let body = null;
  if (data !== null) {
    body = <Tables data={data} />;
  }

  return (
    <div>
      <Header>
        <h1>
          Github Actions Analyzer
        </h1>
        <div>
          <p>Brought to you by <a class="headerLink" href="https://www.statsig.com">Statsig Open Source</a></p>
        </div>
        <div>
          {file == null ? <label className="custom-file-upload">
            <Input type="file" accept=".csv" id="input_file" onChange={handleFile}/>
            Choose a CSV
          </label> : <div>{file.name}<br /></div>}
          
          {file == null ? null : <Button onClick={handleSubmit} disabled={file === null}>Analyze</Button>}
          <div className="footnote">
              The contents of your file will only be used to render tables and charts in your browser.
              It will not be uploaded to any server.
              Feel free to verify for yourself in the github repository for this site!
          </div>
        </div>
      </Header>
      <div className="content">
        {body}
      </div>
    </div>
  );
}

export default App;
