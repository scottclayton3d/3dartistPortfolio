import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Common animation options
const defaultEase = 'power3.out';
const defaultDuration = 0.8;

/**
 * Animate element from initial to visible state
 */
export const fadeInUp = (
  element: string | Element, 
  delay = 0,
  duration = defaultDuration,
  y = 50
) => {
  return gsap.fromTo(
    element,
    { opacity: 0, y },
    { 
      opacity: 1, 
      y: 0, 
      duration, 
      delay,
      ease: defaultEase,
    }
  );
};

/**
 * Animate element from visible to hidden state
 */
export const fadeOut = (
  element: string | Element, 
  delay = 0,
  duration = defaultDuration
) => {
  return gsap.to(
    element,
    { 
      opacity: 0, 
      duration, 
      delay,
      ease: defaultEase,
    }
  );
};

/**
 * Create a staggered animation for multiple elements
 */
export const staggerItems = (
  elements: string | Element | Element[], 
  delay = 0,
  staggerDelay = 0.1,
  y = 20
) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, y },
    { 
      opacity: 1, 
      y: 0, 
      duration: defaultDuration, 
      delay,
      stagger: staggerDelay,
      ease: defaultEase,
    }
  );
};

/**
 * Create a reveal animation tied to scroll position
 */
export const scrollReveal = (
  elements: string | Element | Element[],
  trigger: string | Element = elements,
  start = 'top 80%',
  y = 50
) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration: defaultDuration,
      ease: defaultEase,
      scrollTrigger: {
        trigger,
        start,
        toggleActions: 'play none none none',
      }
    }
  );
};

/**
 * Create a parallax effect on scroll
 */
export const scrollParallax = (
  element: string | Element,
  speed = 0.5,
  trigger: string | Element = element,
) => {
  return gsap.to(element, {
    y: () => -window.innerHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });
};

/**
 * Create a horizontal text ticker effect
 */
export const createTextMarquee = (element: string | Element, speed = 20) => {
  const marquee = document.querySelector(element as string);
  if (!marquee) return;
  
  const text = marquee.querySelector('.marquee-text');
  if (!text) return;
  
  const textWidth = (text as HTMLElement).offsetWidth;
  const duration = textWidth / speed;
  
  // Clone text for seamless loop
  const clone = text.cloneNode(true);
  marquee.appendChild(clone);
  
  gsap.to('.marquee-text', {
    x: -textWidth,
    ease: 'none',
    repeat: -1,
    duration,
  });
};

/**
 * Create a smooth scroll animation to target
 */
export const smoothScrollTo = (target: string | Element, offset = 0, duration = 1) => {
  gsap.to(window, {
    duration,
    scrollTo: {
      y: target,
      offsetY: offset,
    },
    ease: 'power2.inOut',
  });
};

/**
 * Create a hover animation for elements
 */
export const createHoverEffect = (element: string | Element, scale = 1.05) => {
  const elements = document.querySelectorAll(element as string);
  elements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, { scale, duration: 0.3, ease: 'power2.out' });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
  });
};

/**
 * Animate text characters with a staggered effect
 */
export const animateTextChars = (
  element: string | Element,
  delay = 0,
  staggerDelay = 0.03
) => {
  const text = document.querySelector(element as string);
  if (!text) return;
  
  // Split text into spans
  const content = text.innerHTML;
  let characters = '';
  for (let i = 0; i < content.length; i++) {
    characters += `<span class="char">${content[i]}</span>`;
  }
  text.innerHTML = characters;
  
  // Animate each character
  return gsap.fromTo(
    `${element} .char`,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.3,
      stagger: staggerDelay,
      delay,
      ease: 'power2.out',
    }
  );
};

/**
 * Create a page transition animation
 */
export const pageTransition = {
  out: (container: Element) => {
    return gsap.to(container, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.inOut',
    });
  },
  in: (container: Element) => {
    return gsap.fromTo(
      container,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }
    );
  }
};
