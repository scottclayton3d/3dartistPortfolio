import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Contact from '@/components/contact/Contact';
import ThreeScene from '@/components/3d/ThreeScene';
import FloatingParticles from '@/components/3d/FloatingParticles';

const ContactPage = () => {
  // Initialize page
  useEffect(() => {
    // Reset scroll position
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Contact | 3D Art Portfolio</title>
        <meta name="description" content="Get in touch to discuss art commissions, collaborations, or for any inquiries about the 3D artwork portfolio." />
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
              color="#FF3366" 
            />
          </ThreeScene>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/90"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Contact
          </h1>
          <p className="text-xl text-secondary/80 max-w-2xl mx-auto">
            Interested in my work? Let's connect and discuss
          </p>
        </div>
      </section>
      
      {/* Contact content */}
      <section className="bg-background py-12">
        <Contact />
      </section>
    </>
  );
};

export default ContactPage;
