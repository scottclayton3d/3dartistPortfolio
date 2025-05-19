import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import ThreeScene from '@/components/3d/ThreeScene';
import RayMarchShader from '@/components/3d/RayMarchShader';
import FloatingParticles from '@/components/3d/FloatingParticles';
import MarchingCubes from '@/components/3d/MarchingCubes';
import ParticleTrails from '@/components/3d/ParticleTrails';

// Register GSAP plugins
gsap.registerPlugin(SplitText);

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const titleSplitRef = useRef<SplitText | null>(null);
  
  // Animate hero elements on mount
  useEffect(() => {
    if (!containerRef.current) return;
    
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    // Split text for animation
    if (titleRef.current) {
      titleSplitRef.current = new SplitText(titleRef.current, { type: 'words,chars' });
      
      // Animate title
      tl.from(titleSplitRef.current.chars, {
        opacity: 0,
        y: 100,
        rotationX: -90,
        stagger: 0.02,
        duration: 0.8,
      });
    }
    
    // Animate subtitle
    if (subtitleRef.current) {
      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
      }, '-=0.4');
    }
    
    // Animate button
    tl.from('.hero-button', {
      opacity: 0,
      y: 20,
      duration: 0.6,
    }, '-=0.2');
    
    // Clean up split text instance
    return () => {
      if (titleSplitRef.current) {
        titleSplitRef.current.revert();
      }
    };
  }, []);

  return (
    <section 
      className="relative h-screen w-full flex items-center overflow-hidden"
      ref={containerRef}
    >
      {/* 3D scene with ray marching visualization */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient background - darker, more dramatic */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#080818] via-[#10101e] to-[#1a1a2e]"></div>
        
        {/* Main 3D visualization */}
        <ThreeScene 
          orbitControls={false}
          ambientLightIntensity={0.3}
          cameraPosition={[0, 0, 5]}
          enablePostProcessing={true}
          effectsPreset="medium"
          backgroundColor="#080818"
        >
          <RayMarchShader 
            colorPalette={['#ff2d92', '#080818', '#00d1c3']} 
            preset="vibrant"
          />
        </ThreeScene>
        
        {/* Additional ThreeScene for particles to avoid conflicts */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <ThreeScene 
            orbitControls={false}
            backgroundColor="#080818"
            ambientLightIntensity={0.5}
            cameraPosition={[0, 0, 5]}
            enablePostProcessing={false}
          >
            <FloatingParticles
              count={150}
              radius={6}
              size={0.03}
              color="#ff2d92"
            />
            <FloatingParticles
              count={100}
              radius={5}
              size={0.02}
              color="#00d1c3"
            />
            <ParticleTrails 
              count={30}
              trailLength={25}
              size={0.025}
              color="#ff3366"
              followSpeed={0.15}
            />
            <ParticleTrails 
              count={20}
              trailLength={20}
              size={0.02}
              color="#00ffd1"
              followSpeed={0.12}
            />
          </ThreeScene>
        </div>
        
        {/* Grid overlay for texture */}
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 pointer-events-none"></div>
        
        {/* Dynamic animated orbs - visible on top of 3D scene */}
        <div className="absolute top-1/3 left-1/2 w-24 h-24 rounded-full bg-[#ff2d92]/10 blur-md animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/3 w-32 h-32 rounded-full bg-[#00d1c3]/10 blur-md animate-pulse pointer-events-none" 
          style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
      </div>
      
      {/* Hero content */}
      <div className="container mx-auto px-4 md:px-12 z-10">
        <div className="max-w-3xl">
          <h1 
            ref={titleRef}
            className="hero-title mb-8 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <div className="text-white mb-3">
              Exploring Digital Art
            </div>
            <div className="text-white flex items-center">
              <span className="mr-3">Through</span>
              <span className="text-[#00d1c3] relative">
                3D
                <span className="absolute -inset-1 blur-md opacity-40 bg-[#00d1c3] rounded-lg -z-10"></span>
              </span>
            </div>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-secondary/80 mb-8 max-w-2xl"
          >
            A curated collection of modern 3D artwork, digital sculptures, and abstract renders brought to life through WebGL and interactive experiences.
          </p>
          
          <Link 
            to="/gallery" 
            className="hero-button relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#ff2d92] to-[#a855f7] text-white rounded-md font-medium transition-all duration-300 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              Explore Gallery
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#a855f7] to-[#00d1c3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg"></span>
          </Link>
        </div>
      </div>
      
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;