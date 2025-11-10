import React from 'react';
import HeroCarousel from './banner';
import BestSellingBooks from './bestselling';
import NewReleaseBooks from './newrelease';
import InfoBanner from './services';
import Header from './header'
import Cart from '../pages/Cart';
import Footer from './footer'
const Home = () => {
  return (
    <>
      <Header/>
      <div>
        <HeroCarousel />
        <BestSellingBooks />
        <NewReleaseBooks />
        <InfoBanner/>
      </div>
      <InfoBanner/>
      <Footer/>
    </>
  );
};

export default Home;
