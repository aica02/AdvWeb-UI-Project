// Home.jsx
import React from 'react';
import HeroCarousel from './banner';
import BestSellingBooks from './bestselling';
import NewReleaseBooks from './newrelease';

const Home = () => {
  return (
    <>
      <HeroCarousel />
      <BestSellingBooks embedded />
      <NewReleaseBooks embedded />
    </>
  );
};

export default Home;
