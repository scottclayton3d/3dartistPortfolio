import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  threshold?: number;
  ease?: string;
  once?: boolean;
  className?: string;
}

/**
 * Component that reveals its children with an animation when they enter the viewport
 */
const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 50,
  stagger = 0.1,
  threshold = 0.3,
  ease = 'power3.out',
  once = true,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    // Configure initial state based on direction
    let initialProps: gsap.TweenVars = { opacity: 0 };
    switch (direction) {
      case 'up':
        initialProps.y = distance;
        break;
      case 'down':
        initialProps.y = -distance;
        break;
      case 'left':
        initialProps.x = distance;
        break;
      case 'right':
        initialProps.x = -distance;
        break;
    }
    
    // Multiple elements handling (for stagger effect)
    const items = element.children.length > 1 
      ? Array.from(element.children)
      : element;
    
    // Set initial state
    gsap.set(items, initialProps);
    
    // Create animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: `top bottom-=${threshold * 100}%`,
        end: 'bottom top',
        toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        onEnter: () => setIsRevealed(true),
        onLeave: () => once ? null : setIsRevealed(false),
        onEnterBack: () => once ? null : setIsRevealed(true),
        onLeaveBack: () => once ? null : setIsRevealed(false),
      },
    });
    
    // Create reveal animation
    const revealProps: gsap.TweenVars = {
      opacity: 1,
      x: 0,
      y: 0,
      duration,
      ease,
      delay,
      stagger: element.children.length > 1 ? stagger : 0,
    };
    
    tl.to(items, revealProps);
    
    // Clean up
    return () => {
      if (tl) tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [direction, delay, duration, distance, stagger, threshold, ease, once]);
  
  return (
    <div 
      ref={ref} 
      className={`scroll-reveal ${isRevealed ? 'revealed' : ''} ${className}`}
      aria-hidden={!isRevealed}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;