import { useState, useEffect } from 'react';
import { debounce } from '@/lib/helpers';

interface MousePosition {
  x: number;
  y: number;
  relativeX: number; // -1 to 1, centered at middle of screen
  relativeY: number; // -1 to 1, centered at middle of screen
}

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    relativeX: 0,
    relativeY: 0
  });
  
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate relative positions (-1 to 1)
      const relativeX = (clientX / innerWidth) * 2 - 1;
      const relativeY = -(clientY / innerHeight) * 2 + 1;
      
      setMousePosition({
        x: clientX,
        y: clientY,
        relativeX,
        relativeY
      });
    };
    
    // Debounce to improve performance
    const debouncedUpdateMousePosition = debounce(updateMousePosition, 10);
    
    window.addEventListener('mousemove', debouncedUpdateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', debouncedUpdateMousePosition);
    };
  }, []);
  
  return mousePosition;
};
