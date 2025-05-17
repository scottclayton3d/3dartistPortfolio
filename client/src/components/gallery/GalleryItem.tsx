import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { Artwork } from '@/types';

interface GalleryItemProps {
  artwork: Artwork;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ artwork }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Add hover animations
  useEffect(() => {
    if (!itemRef.current) return;
    
    const item = itemRef.current;
    const image = item.querySelector('.gallery-item-image') as HTMLImageElement;
    const title = item.querySelector('.gallery-item-title') as HTMLHeadingElement;
    const arrowIcon = item.querySelector('.arrow-icon') as SVGElement;
    
    // Set up hover animations
    item.addEventListener('mouseenter', () => {
      // Image scale
      gsap.to(image, {
        scale: 1.1,
        duration: 0.7,
        ease: 'power2.out'
      });
      
      // Title animation
      gsap.to(title, {
        y: -5,
        duration: 0.3,
        ease: 'power1.out'
      });
      
      // Arrow icon animation
      gsap.to(arrowIcon, {
        x: 3,
        y: -3,
        duration: 0.3,
        ease: 'power1.out'
      });
    });
    
    item.addEventListener('mouseleave', () => {
      // Image scale back
      gsap.to(image, {
        scale: 1,
        duration: 0.7,
        ease: 'power2.out'
      });
      
      // Title animation back
      gsap.to(title, {
        y: 0,
        duration: 0.3,
        ease: 'power1.out'
      });
      
      // Arrow icon animation back
      gsap.to(arrowIcon, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power1.out'
      });
    });
  }, []);

  return (
    <div 
      className="gallery-item group relative overflow-hidden rounded-lg bg-primary"
      ref={itemRef}
    >
      <Link to={`/artwork/${artwork.id}`}>
        {/* Artwork image */}
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={artwork.thumbnail} 
            alt={artwork.title}
            className="gallery-item-image w-full h-full object-cover transition-all duration-700"
          />
        </div>
        
        {/* Overlay with info */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-block px-2 py-1 bg-accent text-white text-xs rounded mb-2">
            {artwork.category}
          </span>
          <h3 className="gallery-item-title text-xl font-bold text-white mb-2">
            {artwork.title}
          </h3>
          <div className="flex items-center text-white/80 text-sm">
            <span>View Details</span>
            <ArrowUpRight className="arrow-icon ml-1 w-4 h-4" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GalleryItem;
