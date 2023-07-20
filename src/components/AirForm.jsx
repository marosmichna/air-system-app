import Checkbox from '@mui/material/Checkbox';
import { useState } from 'react';
import axios from 'axios';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

const AirForm = () => {

  const [airportsSearch, setAirportsSearch] = useState("")
  const [countrySearch, setCountrySearch] = useState("")
  const [responseData, setResponseData] = useState(null)
  const [isMetarChecked, setIsMetarChecked] = useState(true)
  const [isSigmetChecked, setIsSigmetChecked] = useState(true)
  const [isTafChecked, setIsTafChecked] = useState(true)

  let userReportTypes = []

  if(isMetarChecked) {
    userReportTypes.push("METAR")
  }

  if(isSigmetChecked) {
    userReportTypes.push("SIGMET")
  }

  if(isTafChecked) {
    userReportTypes.push("TAF_LONGTAF")
  }

  const createBriefing = async () => {

    let airportsSearchChangedValue = []
    let countrySearchChangedValue = []

    if(!countrySearch == "") {
        countrySearchChangedValue = countrySearch.split(" ")
    }

    if(!airportsSearch == "") {
        airportsSearchChangedValue = airportsSearch.split(" ")
    }

    const requestData = {
        id: "query01",
        method: "query",
        params: [
          {
            id: "briefing01",
            reportTypes: userReportTypes,
            stations: airportsSearchChangedValue,
            countries: countrySearchChangedValue,
          }
        ]
      }

      try {
        const response = await axios.post("https://ogcie.iblsoft.com/ria/opmetquery", requestData)
        const responseData = response.data

        setResponseData(responseData)
        console.log(responseData)

      } catch (error) {
        console.log(error)
      } 
  }

  const metarHandleChange = (e) => {
    setIsMetarChecked(e.target.checked)
  }

  const sigmetHandleChange = (e) => {
    setIsSigmetChecked(e.target.checked)
  }

  const tafHandleChange = (e) => {
    setIsTafChecked(e.target.checked)
  }


/*****  Table style STRAT ******/

  const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: '#009090',
      color: '#F6FFFF',
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
      width:"150px"
    },
  }));

/*****  Table style END ******/



/*****  Set time START ******/

const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return format(date, 'dd.MM.yyyy HH:mm:ss')
}

/*****  Set time End ******/



/*****  Sort table START ******/

    const groupedData = responseData?.result.reduce((acc, result) => {
        if (acc[result.stationId]) {
        acc[result.stationId].push(result);
        } else {
        acc[result.stationId] = [result];
        }
        return acc;
    }, {});

/*****  Sort table END ******/


/*****  BKN, FEW, SCT Changed Color START ******/

const highlightText = (text) => {
    const regex = /(BKN|FEW|SCT)(\d{3})/g;
    let match;
    let lastIndex = 0;
    const highlightedParts = [];
    
    while ((match = regex.exec(text)) !== null) {
      const expression = match[1];
      const number = match[2];
      const color = parseInt(number, 10) > 30 ? "red" : "blue";
  
      highlightedParts.push(
        <span key={lastIndex}>
          {text.substring(lastIndex, match.index)}
          <span style={{ color }}>{expression}{number}</span>
        </span>
      );
  
      lastIndex = regex.lastIndex;
    }
  
    highlightedParts.push(
      <span key={lastIndex}>
        {text.substring(lastIndex)}
      </span>
    );
  
    return highlightedParts;
  };

/*****  BKN, FEW, SCT Changed Color END ******/

  return (
    <div>
        <div className="w-[600px]  my-5 mx-auto border-2 border-sky-500 py-10">
            <div className="flex justify-between items-center mx-5">
                <div>
                    <p>Message Types: </p>
                </div>
                <div className="flex justify-between  items-center">
                    <div className="flex justify-start items-center">
                        <Checkbox
                            checked={isMetarChecked}
                            onChange={metarHandleChange}
                        />
                        <p>METAR</p>
                    </div>
                    <div className="flex items-center">
                        <Checkbox
                            checked={isSigmetChecked}
                            onChange={sigmetHandleChange}
                        />
                        <p>SIGMET</p>
                    </div>
                    <div className="flex items-center">
                        <Checkbox
                            checked={isTafChecked}
                            onChange={tafHandleChange}
                        />
                        <p>TAF</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-8  mx-5">
                <p>Airports: </p>
                <input 
                    type="text"
                    className="border-2 border-gray-500 w-[250px]" 
                    onChange={(e) => {setAirportsSearch(e.target.value)}}
                />
            </div>
            <div className="flex justify-between mt-4  mx-5">
                <p>Countries: </p>
                <input 
                    type="text"
                    className="border-2 border-gray-500 w-[250px]" 
                    onChange={(e) => {setCountrySearch(e.target.value)}}
                />
            </div>
            <div className="flex justify-end mt-4 mr-5">
                <button 
                    className="bg-gray-400 py-2 px-4 rounded-lg text-white"
                    onClick={createBriefing}
                >
                    Create Briefing
                </button>
            </div>   
        </div>

        <div className="w-[1200px]  my-5 mx-auto shadow-xl">
            {groupedData &&
                Object.entries(groupedData).map(([stationId, data]) => (
                <div key={stationId}>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>{stationId}</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {data.map((result) => (
                                <StyledTableRow key={result.queryType}>
                                    <StyledTableCell>{result.queryType}</StyledTableCell>
                                    <StyledTableCell>{formatDate(result.receptionTime)}</StyledTableCell>
                                    <StyledTableCell 
                                        className="w-[400px]"
                                    >
                                        {highlightText(result.text)}
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                ))}
         </div>

    </div>
  )
}

export default AirForm