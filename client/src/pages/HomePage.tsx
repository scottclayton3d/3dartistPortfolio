import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '@/components/home/Hero';
import FeaturedWorks from '@/components/home/FeaturedWorks';

const HomePage = () => {
  // Initialize page
  useEffect(() => {
    // Reset scroll position
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>3D Art Portfolio | Interactive Digital Art</title>
        <meta name="description" content="Explore a curated collection of modern 3D artwork, digital sculptures, and abstract renders through an interactive WebGL experience." />
      </Helmet>
      
      {/* Full-screen hero section */}
      <Hero />
      
      {/* Featured works section */}
      <FeaturedWorks />
    </>
  );
};

export default HomePage;
