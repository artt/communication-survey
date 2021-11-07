const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { GoogleSpreadsheet } = require('google-spreadsheet');

require("dotenv").config()

const app = express()

const corsOptions = {
	origin: "*",
	optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*'}));

let allData = null
let dataSheet = null
let resultSheet = null

async function loadData() {
  const doc = new GoogleSpreadsheet(process.env.REACT_APP_SHEETS_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY.replaceAll('\\n', '\n'),
  });
  await doc.loadInfo(); // loads document properties and worksheets
  dataSheet = doc.sheetsById[process.env.REACT_APP_DATA_SHEET_ID]
  resultSheet = doc.sheetsById[process.env.REACT_APP_RESULT_SHEET_ID]
  let tmp = {}
  await dataSheet.getRows().then(x => x.forEach(row => {
    tmp[row.ID] = {
      name: row.Name,
      evalList: row.EvalList?.split(",").map(x => x.trim()),
    }
  }))
  return(tmp)
}

app.get(`/`, (req, res) => {
  res.send('Hello there!')
})

app.get(`/alldata`, (req, res) => {
  allData.then(x => res.send(x))
})

app.post(`/submit`, async (req, res) => {
  console.log("-- User submitted --")
  console.log(req.body)
  await resultSheet.addRows(req.body)
  res.send("OK")
})

const port = process.env.PORT || 3333

allData = loadData().then(x => {
  console.log("Data loaded")
  return x
})

app.listen(port, () => {
  console.log(`Server started at port ${port}`)
})