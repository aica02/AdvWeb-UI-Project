import React from 'react';
import HeroCarousel from './banner';
import BestSellingBooks from './bestselling';
import NewReleaseBooks from './newrelease';
import InfoBanner from './services';
import Header from './header'
import Footer from './footer'
import Profile from './profile'
const Home = () => {
  return (
    <>
        <Header/>
        <HeroCarousel />
        <BestSellingBooks />
        <NewReleaseBooks />
        <InfoBanner/>
        <Footer/>
    </>
  );
};

export default Home;
