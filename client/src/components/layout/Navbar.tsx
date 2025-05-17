import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { usePortfolio } from '@/lib/stores/usePortfolio';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { setCurrentPage } = usePortfolio();
  
  // Define navigation links
  const navLinks = [
    { name: 'Home', path: '/', id: 'home' },
    { name: 'Gallery', path: '/gallery', id: 'gallery' },
    { name: 'Terrain', path: '/terrain', id: 'terrain' },
    { name: 'About', path: '/about', id: 'about' },
    { name: 'Contact', path: '/contact', id: 'contact' },
  ];
  
  // Set current page based on location
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/') {
      setCurrentPage('home');
    } else if (path.includes('/gallery')) {
      setCurrentPage('gallery');
    } else if (path.includes('/terrain')) {
      setCurrentPage('terrain');
    } else if (path.includes('/about')) {
      setCurrentPage('about');
    } else if (path.includes('/contact')) {
      setCurrentPage('contact');
    } else if (path.includes('/artwork')) {
      setCurrentPage('artwork');
    }
  }, [location, setCurrentPage]);
  
  // Handle mobile menu animation
  useEffect(() => {
    if (isMenuOpen) {
      // Animate menu in
      gsap.fromTo(
        '.mobile-nav-item',
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.1,
          ease: 'power3.out',
          duration: 0.5,
          delay: 0.2
        }
      );
    }
  }, [isMenuOpen]);
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Close menu on link click
  const handleLinkClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <div className="glass-panel py-4 px-4 md:px-8">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-bold text-2xl tracking-tight"
            style={{ fontFamily: 'Monument Extended, sans-serif' }}
          >
            <span className="text-accent">ART</span>
            <span className="text-white">PORTFOLIO</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.id}
                to={link.path}
                className={`text-sm uppercase tracking-widest hover:text-accent transition-colors duration-300 ${
                  location.pathname === link.path ? 'text-accent' : 'text-secondary'
                }`}
                onClick={handleLinkClick}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-background z-40 flex flex-col justify-center items-center md:hidden">
          <nav className="flex flex-col space-y-8 items-center">
            {navLinks.map((link, index) => (
              <Link
                key={link.id}
                to={link.path}
                className={`mobile-nav-item text-2xl font-medium hover:text-accent transition-colors duration-300 ${
                  location.pathname === link.path ? 'text-accent' : 'text-secondary'
                }`}
                onClick={handleLinkClick}
                style={{ opacity: 0 }}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
