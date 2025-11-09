import { useState } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Outlet/>
    </>
  )
}
export default App
