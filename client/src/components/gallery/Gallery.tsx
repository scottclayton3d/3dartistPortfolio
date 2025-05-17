import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import GalleryItem from './GalleryItem';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { Artwork, ArtworkCategory } from '@/types';

const Gallery = () => {
  const { 
    getFilteredArtworks, 
    selectedCategory,
    setSelectedCategory
  } = usePortfolio();
  
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const galleryRef = useRef<HTMLDivElement>(null);
  
  // Get artworks based on filter
  useEffect(() => {
    setArtworks(getFilteredArtworks());
  }, [selectedCategory, getFilteredArtworks]);
  
  // Set up animations
  useEffect(() => {
    if (!galleryRef.current) return;
    
    // Animate filter buttons
    gsap.from('.filter-button', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.3
    });
  }, []);
  
  // Available categories (get unique categories from artwork data)
  const categories: (ArtworkCategory | 'All')[] = ['All', '3D Model', 'Digital Sculpture', 'Abstract Render'];
  
  // Handle category filter change
  const handleCategoryChange = (category: ArtworkCategory | 'All') => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12" ref={galleryRef}>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => handleCategoryChange(category)}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className={`filter-button ${
              selectedCategory === category 
                ? 'bg-accent hover:bg-accent/90 text-white' 
                : 'border-muted hover:border-accent text-secondary'
            }`}
          >
            {category}
          </Button>
        ))}
      </div>
      
      {/* Gallery grid with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="gallery-grid"
        >
          {artworks.length > 0 ? (
            artworks.map((artwork) => (
              <GalleryItem key={artwork.id} artwork={artwork} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium text-secondary mb-2">No artworks found</h3>
              <p className="text-muted-foreground">
                No artworks match the selected category.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
