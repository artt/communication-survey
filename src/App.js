import React from 'react';
import './App.scss';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Boxes from "./Boxes"

// const hostname = "http://localhost:3333"
const hostname = "https://artt-survey.herokuapp.com"

function App() {

  const [allData, setAllData] = React.useState({})
  const [tmpId, setTmpId] = React.useState('')
  const [id, setId] = React.useState('')
  const [result, setResult] = React.useState([])
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
      <>
        <div className="qtitle">คุณคิดว่างาน<span className="colorize">{pstr}</span>อยากทำงานในกล่องไหน</div>
        {props.isOptional &&
          <Button onClick={() => handleRemove(props.evaluatee)} color="secondary">ลบชื่อออก</Button>
        }
        <div className="boxbox">
          <div>
            <p>ในตอนนี้</p>
            <Boxes time={'now'} {...props} />
          </div>
          <div>
            <p>ในอีก 3–5 ปี</p>
            <Boxes time={'future'} {...props} />
          </div>
        </div>
      </>
    )
  }

  function AddPeople() {

    // const curid = React.useState('')

    return(
      <div className="question">
        <Autocomplete
          // disablePortal
          autoHighlight
          id="combo-box-demo"
          options={Object.entries(allData).filter(obj => !result.map(x => x.evaluatee).includes(obj[0])).map(obj => {
            return {label: obj[1].name, id: obj[0]}
          })}
          renderInput={(params) => <TextField {...params} label="ค้นหาชื่อ เพื่อเพิ่มคนอื่น ๆ (optional)" size="small" />}
          onChange={(e, newValue) => handleAdd(newValue.id)}
        />
      </div>
    )
  }

  React.useEffect(() => {
    if (Object.keys(allData).length > 0 && id !== '') {
      let tmp = []
      let xxx = [id]
      if (allData[id].evalList)
        xxx = xxx.concat(allData[id].evalList)
      xxx.forEach(x => {
        tmp.push({
          evaluatee: x,
          now: '',
          future: '',
        })
      })
      setResult(tmp)
    }
  }, [allData, id])

  async function handleGo() {
    // // check hash
    const r = await fetch(`${hostname}/checkuser`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: tmpId,
        hash: window.location.search.slice(1),
      })
    })
    if (r.status !== 200) {
      alert("รหัสพนักงานไม่ตรงกับลิงค์")
      return
    }
    if (!(Object.keys(allData).includes(tmpId))) {
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
    return result.every(x => {
      if (x.now === '' || x.future === '')
        return false
      return true
    })
  }

  function handleAdd(newid) {
    let tmp = JSON.parse(JSON.stringify(result))
    tmp.push({
      evaluatee: newid,
      now: '',
      future: ''
    })
    setResult(tmp)
  }

  function handleRemove(removeid) {
    // no need to copy since filter creates a new array
    setResult(result.filter(x => x.evaluatee !== removeid))    
  }

  async function handleSubmit() {
    setSubmitting(true)
    const rows = result.map((r, i) => ({
      Timestamp: new Date().toString(),
      EvaluatorID: id,
      EvaluateeID: r.evaluatee,
      Now: r.now,
      Future: r.future,
      Comment: i === 0 ? comment : "",
    }))
    await fetch(`${hostname}/submit`, {
      method: 'post',
      headers: {
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
    for (let i = 0; i < tmp.length; i ++) {
      if (tmp[i].evaluatee === evaluatee) {
        tmp[i][time] = box
        break
      }
    }
    console.log(tmp)
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
                    result.map((r, i) => {
                      const isOptional = r.evaluatee !== id && !allData[id].evalList.includes(r.evaluatee)
                      return(
                        <div className={`question ${isOptional ? "optional" : ""}`} key={`q${i}`}>
                          <Question evaluatee={r.evaluatee} result={r} setPersonResult={setPersonResult} isOptional={isOptional} />
                        </div>
                      )
                    })
                  }
                  <AddPeople />
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
