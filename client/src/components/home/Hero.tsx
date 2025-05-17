import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import ThreeScene from '@/components/3d/ThreeScene';
import AbstractBackground from '@/components/3d/AbstractBackground';

// Register GSAP plugins
gsap.registerPlugin(SplitText);

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  
  // Animate hero elements on mount
  useEffect(() => {
    if (!containerRef.current) return;
    
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    // Split text for animation
    let titleSplit;
    if (titleRef.current) {
      titleSplit = new SplitText(titleRef.current, { type: 'words,chars' });
      
      // Animate title
      tl.from(titleSplit.chars, {
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
      if (titleSplit) {
        titleSplit.revert();
      }
    };
  }, []);

  return (
    <section 
      className="relative h-screen w-full flex items-center overflow-hidden"
      ref={containerRef}
    >
      {/* Background 3D scene with raymarching effect */}
      <div className="absolute inset-0 -z-10">
        <ThreeScene 
          orbitControls={false}
          ambientLightIntensity={0.5}
          cameraPosition={[0, 0, 5]}
          enablePostProcessing={true}
          effectsPreset="medium"
        >
          <AbstractBackground 
            colorPalette={['#ff3366', '#121212', '#00ffd1']}
          />
        </ThreeScene>
      </div>
      
      {/* Hero content */}
      <div className="container mx-auto px-4 md:px-12 z-10">
        <div className="max-w-3xl">
          <h1 
            ref={titleRef}
            className="hero-title mb-6 text-white"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#00FFD1]">
              Exploring Digital Art
            </span>
            <br /> Through 3D
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-secondary/80 mb-8 max-w-2xl"
          >
            A curated collection of modern 3D artwork, digital sculptures, and abstract renders brought to life through WebGL and interactive experiences.
          </p>
          
          <Link 
            to="/gallery" 
            className="hero-button inline-flex items-center btn-primary group"
          >
            Explore Gallery
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
      
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;