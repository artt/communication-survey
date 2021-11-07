import React, { useCallback } from 'react'
import "./Boxes.scss"

export default function Boxes({ time, evaluatee, result, setPersonResult }) {
  
  const ref = React.useRef({})

  const handleClick = React.useCallback((box) => {
    for (const i of ["a", "b", "c", "d"]) {
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
        className={`${name} ${name === result[evaluatee][time] ? "highlight" : ""}`}
        onClick={() => handleClick(name)}
      >
        {children}
      </div>
    )
  })

  return(
    <div className="boxes">
      <Box name="a" ref={el => ref.current["a"] = el}>A</Box>
      <Box name="b" ref={el => ref.current["b"] = el}>B</Box>
      <Box name="c" ref={el => ref.current["c"] = el}>C</Box>
      <Box name="d" ref={el => ref.current["d"] = el}>D</Box>
    </div>
  )
}