import React from 'react';
import './App.scss';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Boxes from "./Boxes"

const crypto = require('crypto')
const hostname = "https://artt-survey.herokuapp.com"

function App() {

  const [allData, setAllData] = React.useState({})
  const [tmpId, setTmpId] = React.useState('')
  const [id, setId] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [done, setDone] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [filled, setFilled] = React.useState(false)
  const [comment, setComment] = React.useState('')

  const theme = createTheme({
    typography: {
      fontFamily: `"Mali"`,
    },
    palette: {
      mode: 'dark',
    },
  })

  function Question(props) {
    if (!props.result)
      return null
    let pstr = allData[props.evaluatee].name
    if (id === props.evaluatee) {
      pstr = "คุณ" 
    }
    return(
      <div className="question">
        <div className="qtitle">คุณคิดว่างานของ<span className="colorize">{pstr}</span>อยู่ในกล่องไหน</div>
        <div className="boxbox">
          <div>
            <p>ในตอนนี้</p>
            <Boxes time={'now'} {...props} />
          </div>
          <div>
            <p>ในอีกสามปี</p>
            <Boxes time={'future'} {...props} />
          </div>
        </div>
      </div>
    )
  }

  React.useEffect(() => {
    if (Object.keys(allData).length > 0 && id !== '') {
      let tmp = {}
      let xxx = [id]
      if (allData[id].evalList)
        xxx = xxx.concat(allData[id].evalList)
      xxx.forEach(x => {
        tmp[x] = {
          now: '',
          future: '',
        }
      })
      setResult(tmp)
    }
  }, [allData, id])

  function handleGo() {
    // // check hash
    // const compare = crypto.createHash('sha1').update(`${tmpId}${process.env.REACT_APP_HASHKEY}`).digest('hex')
    // if (window.location.search.slice(1) !== compare) {
    //   alert("รหัสพนักงานไม่ตรงกับลิงค์")
    //   return
    // }
    if (!(tmpId in Object.keys(allData))) {
      alert("กรุณาตรวจสอบรหัสพนักงานอีกครั้ง")

      return
    }
    setId(tmpId)
  }

  React.useEffect(() => {
    if (Object.keys(allData).length > 0) {
      console.log('Data loaded')
    }
  }, [allData])

  React.useEffect(() => {
    fetch(`${hostname}/alldata`).then(x => x.json()).then(x => {
      setAllData(x)
    })
  }, [])

  React.useEffect(() => {
    setFilled(checkResult())
  }, [result])

  function checkResult() {
    if (!result) return false
    return Object.values(result).every(x => {
      if (x.now === '' || x.future === '')
        return false
      return true
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    const rows = Object.keys(result).map(evaluatee => ({
      Timestamp: new Date().toString(),
      EvaluatorID: id,
      EvaluateeID: evaluatee,
      Now: result[evaluatee].now,
      Future: result[evaluatee].future,
      Comment: comment,
    }))
    // console.log("rows", rows)
    await fetch(`${hostname}/submit`, {
      method: 'post',
      headers: {
        // 'Accept': 'text/plain',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rows)
    }).then(x => {
    if (x.status === 200)
      setDone(true)
    })
  }

  function setPersonResult(evaluatee, time, box) {
    let tmp = JSON.parse(JSON.stringify(result))
    tmp[evaluatee][time] = box
    setResult(tmp)
  }

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <header className="App-header">
          {!done
          ? <>
              {!id || !result
              ? <div>
                  <p>โปรดระบุรหัสพนักงานของท่าน</p>
                  <div>
                    <TextField
                      id="outlined-basic"
                      label="รหัสพนักงาน"
                      variant="outlined"
                      size="small"
                      value={tmpId}
                      onChange={e => setTmpId(e.target.value)}
                    />
                    <IconButton aria-label="go" onClick={handleGo} disabled={Object.keys(allData).length === 0}>
                      <NavigateNextIcon />
                    </IconButton>
                  </div>
                </div>
              : <div className="page">
                  <h2>สวัสดีครับคุณ{allData[id].name}!</h2>
                  {/* <p>อธิบาย อธิบาย อธิบาย อธิบาย</p> */}
                  {
                    Object.keys(result).map((evaluatee, i) =>
                      <Question evaluatee={evaluatee} result={result} setPersonResult={setPersonResult} key={`q${i}`}/>
                    )
                  }
                  <div style={{maxWidth: "600px", margin: "40px auto"}}>
                    <TextField
                      label="ความกังวล ความเห็น ข้อเสนอแนะ"
                      fullWidth
                      multiline
                      rows={4}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                  </div>
                  <div>
                    <Button variant="contained" onClick={handleSubmit} disabled={!filled || submitting}>ส่งคำตอบ</Button>
                  </div>

                </div>
              }
            </>
          : <div>ขอบคุณครับ เราได้รับคำตอบของคุณแล้ว</div>
          }

        </header>
      </ThemeProvider>
    </div>
  );
}

export default App;
