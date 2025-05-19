import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import ThreeScene from '@/components/3d/ThreeScene';
import RayMarchShader from '@/components/3d/RayMarchShader';
import FloatingParticles from '@/components/3d/FloatingParticles';
import RaymarchEffect from '@/components/3d/RaymarchEffect';
import { Canvas } from '@react-three/fiber';
import { usePortfolio } from '@/lib/stores/usePortfolio';

// Register GSAP plugins
gsap.registerPlugin(SplitText);

const Hero = () => {
  const { animationEnabled } = usePortfolio();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const titleSplitRef = useRef<SplitText | null>(null);

  useEffect(() => {
    if (!containerRef.current || !animationEnabled) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (titleRef.current) {
      titleSplitRef.current = new SplitText(titleRef.current, { type: 'words,chars' });

      tl.from(titleSplitRef.current.chars, {
        opacity: 0,
        y: 100,
        rotationX: -90,
        stagger: 0.02,
        duration: 0.8,
      });
    }

    if (subtitleRef.current) {
      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
      }, '-=0.4');
    }

    tl.from('.hero-button', {
      opacity: 0,
      y: 20,
      duration: 0.6,
    }, '-=0.2');

    return () => {
      if (titleSplitRef.current) {
        titleSplitRef.current.revert();
      }
    };
  }, [animationEnabled]);

  return (
    <section 
      className="relative h-screen w-full flex items-center overflow-hidden"
      ref={containerRef}
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080818] via-[#10101e] to-[#1a1a2e]"></div>

        <ThreeScene 
          orbitControls={false}
          ambientLightIntensity={0.3}
          cameraPosition={[0, 0, 5]}
          enablePostProcessing={true}
          effectsPreset="medium"
          backgroundColor="#080818"
        >
          <FloatingParticles />
          <RaymarchEffect 
            colorPalette={['#ff2d92', '#080818', '#00d1c3']}
            noiseIntensity={0.8}
          />
        </ThreeScene>

        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 pointer-events-none"></div>

        <div className="absolute top-1/3 left-1/2 w-24 h-24 rounded-full bg-[#ff2d92]/10 blur-md animate-pulse pointer-events-none"></div>
        <div 
          className="absolute bottom-1/4 right-1/3 w-32 h-32 rounded-full bg-[#00d1c3]/10 blur-md animate-pulse pointer-events-none" 
          style={{ animationDelay: '1s', animationDuration: '3s' }}
        ></div>
      </div>

      <div className="container mx-auto px-4 md:px-12 z-10">
        <div className="max-w-3xl">
          <h1 
            ref={titleRef}
            className="hero-title mb-8 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <div className="text-white mb-3">
              Digital Artistry
            </div>
            <div className="text-white flex items-center">
              <span className="mr-3">Through</span>
              <span className="text-[#00d1c3] relative">
                Code
                <span className="absolute -inset-1 blur-md opacity-40 bg-[#00d1c3] rounded-lg -z-10"></span>
              </span>
            </div>
          </h1>

          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-secondary/80 mb-8 max-w-2xl"
          >
            Exploring the intersection of creative coding and digital art through interactive experiences and generative algorithms.
          </p>

          <Link 
            to="/gallery" 
            className="hero-button relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#ff2d92] to-[#a855f7] text-white rounded-md font-medium transition-all duration-300 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              View Projects
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#a855f7] to-[#00d1c3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg"></span>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;