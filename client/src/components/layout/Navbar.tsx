import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { useMousePosition } from '@/hooks/useMousePosition';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { setCurrentPage } = usePortfolio();
  const logoRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition();
  
  // Define navigation links
  const navLinks = [
    { name: 'Home', path: '/', id: 'home' },
    { name: 'Gallery', path: '/gallery', id: 'gallery' },
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
    } else if (path.includes('/about')) {
      setCurrentPage('about');
    } else if (path.includes('/contact')) {
      setCurrentPage('contact');
    } else if (path.includes('/artwork')) {
      setCurrentPage('artwork');
    }
  }, [location, setCurrentPage]);
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50 && !isScrolled) {
        setIsScrolled(true);
        // Animate navbar on scroll
        gsap.to('.navbar-container', {
          backgroundColor: 'rgba(18, 18, 18, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          padding: '0.5rem 0',
          duration: 0.3
        });
      } else if (scrollPosition <= 50 && isScrolled) {
        setIsScrolled(false);
        // Reset navbar on top
        gsap.to('.navbar-container', {
          backgroundColor: 'rgba(18, 18, 18, 0.5)',
          backdropFilter: 'blur(5px)',
          boxShadow: 'none',
          padding: '1rem 0',
          duration: 0.3
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);
  
  // Logo animation
  useEffect(() => {
    if (logoRef.current) {
      const logo = logoRef.current;
      
      // Initial reveal animation
      gsap.fromTo(
        logo,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
      
      // Interactive hover effect
      logo.addEventListener('mouseenter', () => {
        gsap.to('.logo-text', {
          letterSpacing: '1px',
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to('.logo-accent', {
          color: '#ff3366',
          scale: 1.05,
          duration: 0.3
        });
      });
      
      logo.addEventListener('mouseleave', () => {
        gsap.to('.logo-text', {
          letterSpacing: '0px',
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to('.logo-accent', {
          color: '#ff3366',
          scale: 1,
          duration: 0.3
        });
      });
    }
  }, []);
  
  // Handle mobile menu animation
  useEffect(() => {
    if (isMenuOpen) {
      // Animate menu background
      gsap.fromTo(
        '.mobile-menu-overlay',
        { 
          opacity: 0,
          backdropFilter: 'blur(0px)'
        },
        { 
          opacity: 1, 
          backdropFilter: 'blur(10px)',
          duration: 0.5,
          ease: 'power2.out' 
        }
      );
      
      // Animate menu items
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
      
      // Add cool accent lines
      gsap.fromTo(
        '.menu-accent-line',
        { width: 0 },
        {
          width: '100%',
          duration: 0.8,
          ease: 'power2.inOut',
          stagger: 0.1,
          delay: 0.3
        }
      );
    } else {
      // Animate out if menu is closing
      gsap.to('.mobile-menu-overlay', { 
        opacity: 0,
        backdropFilter: 'blur(0px)',
        duration: 0.3,
        ease: 'power2.in'
      });
    }
  }, [isMenuOpen]);
  
  // Nav link hover animations
  useEffect(() => {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link, {
          y: -2,
          color: '#ff3366',
          duration: 0.2,
          ease: 'power2.out'
        });
      });
      
      link.addEventListener('mouseleave', () => {
        gsap.to(link, {
          y: 0,
          color: link.classList.contains('active') ? '#ff3366' : '#f0f0f0',
          duration: 0.2,
          ease: 'power2.out'
        });
      });
    });
  }, [location.pathname]);
  
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
      <div className="navbar-container glass-panel py-4 px-4 md:px-8">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div ref={logoRef} className="logo-container">
            <Link 
              to="/" 
              className="font-bold text-2xl tracking-tight logo-text"
              style={{ fontFamily: 'Monument Extended, sans-serif' }}
            >
              <span className="text-accent logo-accent">ART</span>
              <span className="text-white">PORTFOLIO</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav ref={navLinksRef} className="hidden md:flex space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.id}
                to={link.path}
                className={`nav-link text-sm uppercase tracking-widest transition-all duration-300 ${
                  location.pathname === link.path ? 'text-accent active' : 'text-secondary'
                }`}
                onClick={handleLinkClick}
              >
                <div className="nav-link-text">{link.name}</div>
                {location.pathname === link.path && (
                  <div className="h-0.5 bg-accent mt-1 transform origin-left scale-x-100 transition-transform duration-300"></div>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none transition-transform duration-300 hover:scale-110"
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
        <div className="mobile-menu-overlay fixed inset-0 bg-background/80 backdrop-blur z-40 flex flex-col justify-center items-center md:hidden">
          <nav className="flex flex-col space-y-8 items-center">
            {navLinks.map((link, index) => (
              <div key={link.id} className="nav-item-container">
                <Link
                  to={link.path}
                  className={`mobile-nav-item text-2xl font-medium hover:text-accent transition-colors duration-300 ${
                    location.pathname === link.path ? 'text-accent' : 'text-secondary'
                  }`}
                  onClick={handleLinkClick}
                  style={{ opacity: 0 }}
                >
                  {link.name}
                </Link>
                <div className="menu-accent-line h-0.5 bg-accent mt-2" style={{ width: 0 }}></div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
