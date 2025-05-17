import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { useMousePosition } from '@/hooks/useMousePosition';

const MouseFollower = () => {
  const mousePosition = useMousePosition();
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorEnlarged, setCursorEnlarged] = useState(false);
  
  useEffect(() => {
    // Create cursor elements
    const cursor = document.createElement('div');
    cursor.classList.add('cursor');
    
    const cursorInner = document.createElement('div');
    cursorInner.classList.add('cursor-inner');
    
    // Add to DOM
    document.body.appendChild(cursor);
    document.body.appendChild(cursorInner);
    
    // Add cursor styles
    const style = document.createElement('style');
    style.textContent = `
      .cursor {
        position: fixed;
        width: 40px;
        height: 40px;
        border: 1px solid rgba(255, 51, 102, 0.6);
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 9999;
        mix-blend-mode: difference;
        transition: opacity 0.3s ease;
        opacity: 0;
      }
      
      .cursor-inner {
        position: fixed;
        width: 8px;
        height: 8px;
        background-color: #FF3366;
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        z-index: 9999;
        mix-blend-mode: difference;
        transition: opacity 0.3s ease;
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
    
    // Mouse events
    const handleMouseEnter = () => setCursorVisible(true);
    const handleMouseLeave = () => setCursorVisible(false);
    
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Handle hoverable elements
    const handleLinkHoverEvents = () => {
      document.querySelectorAll('a, button, .hoverable').forEach(el => {
        el.addEventListener('mouseenter', () => setCursorEnlarged(true));
        el.addEventListener('mouseleave', () => setCursorEnlarged(false));
      });
    };
    
    // Call once on mount
    handleLinkHoverEvents();
    
    // Re-attach events when new elements might be added (e.g., after route changes)
    const observer = new MutationObserver(handleLinkHoverEvents);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Cleanup
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeChild(cursor);
      document.body.removeChild(cursorInner);
      document.head.removeChild(style);
      observer.disconnect();
    };
  }, []);
  
  // Update cursor position with GSAP
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const cursor = document.querySelector('.cursor');
    const cursorInner = document.querySelector('.cursor-inner');
    
    if (!cursor || !cursorInner) return;
    
    // Update visibility
    gsap.to(cursor, {
      opacity: cursorVisible ? 1 : 0,
      duration: 0.3
    });
    
    gsap.to(cursorInner, {
      opacity: cursorVisible ? 1 : 0,
      duration: 0.3
    });
    
    // Update size for hovering interactive elements
    gsap.to(cursor, {
      width: cursorEnlarged ? 60 : 40,
      height: cursorEnlarged ? 60 : 40,
      duration: 0.3
    });
    
    // Follow mouse with smooth animation
    gsap.to(cursor, {
      x: mousePosition.x,
      y: mousePosition.y,
      duration: 0.15
    });
    
    gsap.to(cursorInner, {
      x: mousePosition.x,
      y: mousePosition.y,
      duration: 0.05
    });
  }, [mousePosition, cursorVisible, cursorEnlarged]);
  
  // This component doesn't render anything directly
  return null;
};

export default MouseFollower;
