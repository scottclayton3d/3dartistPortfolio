import { useEffect, useState } from 'react';

const ScrollIndicator = () => {
  const [showIndicator, setShowIndicator] = useState(true);
  
  // Hide indicator when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowIndicator(false);
      } else {
        setShowIndicator(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Only show on main page
  if (window.location.pathname !== '/') {
    return null;
  }
  
  return (
    <div 
      className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-40 transition-opacity duration-500 ${
        showIndicator ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center">
        <span className="text-secondary text-sm uppercase tracking-wider mb-2">Scroll</span>
        <div className="w-6 h-9 border-2 border-secondary rounded-full flex justify-center">
          <div className="w-1 h-1 bg-accent rounded-full mt-2 scroll-indicator"></div>
        </div>
      </div>
    </div>
  );
};

export default ScrollIndicator;
