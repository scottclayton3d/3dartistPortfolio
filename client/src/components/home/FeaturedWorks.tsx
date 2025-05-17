import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { Artwork } from '@/types';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const FeaturedWorks = () => {
  const { getFeaturedArtworks } = usePortfolio();
  const featuredWorks = getFeaturedArtworks().slice(0, 3);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up scroll animations
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Animate section title
    gsap.from('.section-title', {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: '.section-title',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
    
    // Animate artwork cards
    gsap.from('.artwork-card', {
      opacity: 0,
      y: 100,
      duration: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.featured-works-grid',
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    });
    
    // Animate the "View All" button
    gsap.from('.view-all-button', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: '.view-all-button',
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });
  }, []);
  
  // Render a featured artwork card
  const renderArtworkCard = (artwork: Artwork, index: number) => (
    <div 
      key={artwork.id}
      className="artwork-card group"
    >
      <Link to={`/artwork/${artwork.id}`} className="block relative overflow-hidden rounded-lg">
        {/* Artwork image */}
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={artwork.thumbnail} 
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-6">
            <span className="inline-block px-2 py-1 bg-accent text-white text-xs rounded mb-2">
              {artwork.category}
            </span>
            <h3 className="text-xl font-bold text-white">{artwork.title}</h3>
          </div>
        </div>
      </Link>
      
      {/* Artwork info */}
      <div className="mt-4">
        <h3 className="text-lg md:text-xl font-bold text-secondary mb-2">
          {artwork.title}
        </h3>
        <p className="text-muted-foreground mb-4">
          {artwork.description.length > 120 
            ? `${artwork.description.substring(0, 120)}...` 
            : artwork.description}
        </p>
        <Link 
          to={`/artwork/${artwork.id}`} 
          className="inline-flex items-center text-accent hover:text-accent/80 transition-colors"
        >
          View Project
          <ArrowUpRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <section 
      className="section-padding bg-primary"
      ref={containerRef}
    >
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="section-title text-secondary">Featured Artworks</h2>
        
        {/* Featured works grid */}
        <div className="featured-works-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredWorks.map((artwork, index) => renderArtworkCard(artwork, index))}
        </div>
        
        {/* View all button */}
        <div className="text-center">
          <Link to="/gallery" className="view-all-button btn-secondary">
            View All Works
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedWorks;
