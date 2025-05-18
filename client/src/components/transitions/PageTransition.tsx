import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Component that wraps pages and adds smooth transitions between route changes
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Animate page transitions when location changes
  useEffect(() => {
    const page = pageRef.current;
    const overlay = overlayRef.current;
    
    if (!page || !overlay) return;
    
    // Timeline for page transitions
    const tl = gsap.timeline();
    
    // Initial state (on first load)
    gsap.set(page, { opacity: 0, y: 30 });
    gsap.set(overlay, { yPercent: 100 });
    
    // Animation sequence
    tl
      // 1. Slide in overlay from bottom
      .to(overlay, {
        yPercent: 0,
        duration: 0.5,
        ease: 'power3.inOut',
      })
      // 2. Slide out overlay to top
      .to(overlay, {
        yPercent: -100,
        duration: 0.5,
        ease: 'power3.inOut',
      })
      // 3. Fade in and move up the page content
      .to(page, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.3'); // Start slightly before overlay is fully out
    
    // Clean up function
    return () => {
      tl.kill();
    };
  }, [location.pathname]); // Re-run when route changes
  
  return (
    <div className="page-transition-container relative">
      {/* Page content container */}
      <div 
        ref={pageRef} 
        className="page-content"
      >
        {children}
      </div>
      
      {/* Overlay for transition effect */}
      <div 
        ref={overlayRef}
        className="page-transition-overlay fixed inset-0 bg-accent z-50 pointer-events-none"
      />
    </div>
  );
};

export default PageTransition;