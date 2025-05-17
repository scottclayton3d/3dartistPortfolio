import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import About from '@/components/about/About';
import ThreeScene from '@/components/3d/ThreeScene';
import FloatingParticles from '@/components/3d/FloatingParticles';

const AboutPage = () => {
  // Initialize page
  useEffect(() => {
    // Reset scroll position
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>About | 3D Art Portfolio</title>
        <meta name="description" content="Learn about the artist behind the 3D artwork portfolio, their process, and technical approach to digital art creation." />
      </Helmet>
      
      {/* Hero section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        {/* 3D background */}
        <div className="absolute inset-0 -z-10">
          <ThreeScene 
            orbitControls={false}
            ambientLightIntensity={0.3}
            cameraPosition={[0, 0, 5]}
            environmentPreset="night"
          >
            <FloatingParticles 
              count={150} 
              radius={8} 
              size={0.06} 
              color="#00FFD1" 
            />
          </ThreeScene>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/90"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            About
          </h1>
          <p className="text-xl text-secondary/80 max-w-2xl mx-auto">
            The artist and creative process behind the work
          </p>
        </div>
      </section>
      
      {/* About content */}
      <section className="bg-background py-12">
        <About />
      </section>
    </>
  );
};

export default AboutPage;
