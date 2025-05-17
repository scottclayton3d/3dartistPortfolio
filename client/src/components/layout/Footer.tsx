import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, GitPullRequest } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 
              className="font-bold text-xl tracking-tight"
              style={{ fontFamily: 'Monument Extended, sans-serif' }}
            >
              <span className="text-accent">ART</span>
              <span className="text-white">PORTFOLIO</span>
            </h3>
            <p className="text-muted-foreground max-w-xs">
              Exploring the intersection of art and technology through interactive 3D experiences and digital creations.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-secondary font-medium text-lg">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-muted-foreground hover:text-accent transition-colors">Home</Link>
              <Link to="/gallery" className="text-muted-foreground hover:text-accent transition-colors">Gallery</Link>
              <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-accent transition-colors">Contact</Link>
            </nav>
          </div>
          
          {/* Social / Contact */}
          <div className="space-y-4">
            <h4 className="text-secondary font-medium text-lg">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors" aria-label="GitPullRequest">
                <GitPullRequest className="w-5 h-5" />
              </a>
            </div>
            <p className="text-muted-foreground">hello@artportfolio.com</p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-muted">
          <p className="text-muted-foreground text-sm text-center">
            &copy; {new Date().getFullYear()} Art Portfolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
