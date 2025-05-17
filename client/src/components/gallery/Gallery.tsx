import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import GalleryItem from './GalleryItem';
import InfiniteDragImageGallery from './InfiniteDragImageGallery';
import { usePortfolio } from '@/lib/stores/usePortfolio';
import { Artwork, ArtworkCategory } from '@/types';
import { LayoutGrid, Hand } from 'lucide-react';

const Gallery = () => {
  const { 
    getFilteredArtworks, 
    selectedCategory,
    setSelectedCategory
  } = usePortfolio();
  
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'drag'>('grid');
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
    
    // Animate toggle buttons
    gsap.from('.toggle-button', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.5
    });
  }, []);
  
  // Toggle view mode
  const toggleViewMode = (mode: 'grid' | 'drag') => {
    setViewMode(mode);
  };
  
  // Available categories (get unique categories from artwork data)
  const categories: (ArtworkCategory | 'All')[] = ['All', '3D Model', 'Digital Sculpture', 'Abstract Render', 'Conceptual Art', 'Experimental'];
  
  // Handle category filter change
  const handleCategoryChange = (category: ArtworkCategory | 'All') => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12" ref={galleryRef}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
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
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* View mode toggle */}
        <div className="flex gap-2 self-end md:self-auto">
          <Button
            onClick={() => toggleViewMode('grid')}
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            className={`toggle-button ${
              viewMode === 'grid' 
                ? 'bg-accent hover:bg-accent/90 text-white' 
                : 'border-muted hover:border-accent text-secondary'
            }`}
            size="sm"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Grid View
          </Button>
          <Button
            onClick={() => toggleViewMode('drag')}
            variant={viewMode === 'drag' ? 'default' : 'outline'}
            className={`toggle-button ${
              viewMode === 'drag' 
                ? 'bg-accent hover:bg-accent/90 text-white' 
                : 'border-muted hover:border-accent text-secondary'
            }`}
            size="sm"
          >
            <Hand className="w-4 h-4 mr-2" />
            Interactive View
          </Button>
        </div>
      </div>
      
      {/* Content based on view mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
        ) : (
          <motion.div
            key="drag-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            {artworks.length > 0 ? (
              <InfiniteDragImageGallery artworks={artworks} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-secondary mb-2">No artworks found</h3>
                <p className="text-muted-foreground">
                  No artworks match the selected category.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
