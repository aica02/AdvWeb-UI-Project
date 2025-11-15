import { useState } from 'react'
import { Outlet} from 'react-router-dom'
import './App.css'
import ScrollToTop from './components/scrollToTop'

function App() {

  return (
    <>
      <ScrollToTop/>
      <Outlet/>
    </>
  )
}
export default App
