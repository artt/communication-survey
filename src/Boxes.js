import React from 'react'
import "./Boxes.scss"

export default function Boxes({ time, evaluatee, result, setPersonResult }) {
  
  const ref = React.useRef({})

  const def = {
    F: {text: "Frontliners", color: "#0078D7", gc: "1/2", gr: "1/2"},
    C: {text: "Content", color: "#F7630C", gc: "1/2", gr: "2/3"},
    S: {text: "Corp Sec", color: "#68768A", gc: "2/3", gr: "1/3"},
    I: {text: "Infrastructure", color: "#10893E", gc: "1/3", gr: "3/4"},
  }

  const handleClick = React.useCallback((box) => {
    for (const i of Object.keys(def)) {
      if (i !== box)
        ref.current[i].classList.remove("highlight")
    }
    ref.current[box].classList.add("highlight")
    setPersonResult(evaluatee, time, box)
  }, [evaluatee, time, setPersonResult])

  const Box = React.forwardRef(({children, name, ...rest}, ref) => {
    return(
      <div
        {...rest}
        ref={ref}
        className={`${name} ${name === result[time] ? "highlight" : ""}`}
        onClick={() => handleClick(name)}
      >
        {children}
      </div>
    )
  })

  return(
    <div className="boxes">
      {Object.entries(def).map((obj, i) => (
        <Box
          name={obj[0]}
          ref={el => ref.current[obj[0]] = el}
          style={{
            backgroundColor: obj[1].color + "99",
            gridColumn: obj[1].gc,
            gridRow: obj[1].gr,
          }}
          key={`box${i}`}
        >
          {obj[1].text}
        </Box>)
      )}
      {/* <Box name="a" ref={el => ref.current["a"] = el}>Frontliners</Box>
      <Box name="b" ref={el => ref.current["b"] = el}>Content</Box>
      <Box name="c" ref={el => ref.current["c"] = el}>Corp Sec</Box>
      <Box name="d" ref={el => ref.current["d"] = el}>Infrastructure</Box> */}
    </div>
  )
}