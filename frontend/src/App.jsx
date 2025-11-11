import { useState } from 'react'
import { Outlet} from 'react-router-dom'
import './App.css'
import ScrollToTop from './components/scrollToTop'
import Header from './pages/header'
import Footer from './pages/footer'
import InfoBanner from './pages/services'

function App() {

  return (
    <>
      <ScrollToTop/>
      <Header/>
      <Outlet/>
      <InfoBanner/>
      <Footer/>
    </>
  )
}
export default App
