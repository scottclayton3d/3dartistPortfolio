import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Layers } from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';
import { artworks } from '@/data/artworks';
import { Artwork } from '@/types';
import ModelViewer from '@/components/3d/ModelViewer';
import ThreeScene from '@/components/3d/ThreeScene';
import FloatingParticles from '@/components/3d/FloatingParticles';

const ArtworkDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Find artwork by ID
  useEffect(() => {
    if (!id) return;
    
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Simulate loading
    setIsLoading(true);
    
    // Find artwork in data
    const foundArtwork = artworks.find(item => item.id === id);
    
    setTimeout(() => {
      if (foundArtwork) {
        setArtwork(foundArtwork);
      } else {
        toast.error('Artwork not found');
        navigate('/gallery');
      }
      setIsLoading(false);
    }, 800);
  }, [id, navigate]);
  
  // Set up animations
  useEffect(() => {
    if (isLoading || !artwork) return;
    
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    // Animate content
    tl.from('.artwork-title', { opacity: 0, y: 30, duration: 0.8 }, 0.2);
    tl.from('.artwork-meta', { opacity: 0, y: 20, duration: 0.6 }, 0.4);
    tl.from('.artwork-description', { opacity: 0, y: 20, duration: 0.6 }, 0.5);
    tl.from('.artwork-details', { opacity: 0, y: 20, duration: 0.6 }, 0.6);
    tl.from('.artwork-image', { 
      opacity: 0, 
      scale: 0.95, 
      duration: 0.8,
      stagger: 0.2
    }, 0.4);
  }, [isLoading, artwork]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    );
  }
  
  // Not found state
  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary mb-4">Artwork Not Found</h2>
          <Link to="/gallery" className="btn-secondary">
            Return to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${artwork.title} | 3D Art Portfolio`}</title>
        <meta name="description" content={artwork.description} />
      </Helmet>
      
      <div className="min-h-screen">
        {/* Back button */}
        <div className="container mx-auto px-4 md:px-8 py-6">
          <Link 
            to="/gallery" 
            className="inline-flex items-center text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Gallery
          </Link>
        </div>
        
        {/* Artwork details */}
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left column - 3D Model or Image */}
            <div>
              {artwork.modelUrl ? (
                <div className="rounded-lg overflow-hidden h-[500px] bg-primary">
                  <ModelViewer 
                    modelUrl={artwork.modelUrl}
                    artworkId={artwork.id}
                    interactive={true}
                    autoRotate={true}
                  />
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden h-[500px] bg-primary">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={artwork.thumbnail} 
                      alt={artwork.title}
                      className="artwork-image w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              {/* Additional images */}
              {artwork.images.length > 1 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {artwork.images.slice(0, 3).map((image, index) => (
                    <div 
                      key={index} 
                      className="artwork-image rounded-lg overflow-hidden aspect-square"
                    >
                      <img 
                        src={image} 
                        alt={`${artwork.title} - View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right column - Info */}
            <div>
              <div className="artwork-meta flex items-center mb-4">
                <span className="px-3 py-1 bg-accent text-white text-sm rounded-full">
                  {artwork.category}
                </span>
                <span className="ml-3 text-muted-foreground flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {artwork.year}
                </span>
              </div>
              
              <h1 className="artwork-title text-3xl md:text-4xl font-bold text-white mb-6">
                {artwork.title}
              </h1>
              
              <div className="artwork-description prose prose-invert max-w-none mb-8">
                <p className="text-secondary/90 text-lg">
                  {artwork.description}
                </p>
              </div>
              
              {/* Technical details */}
              <div className="artwork-details bg-primary p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-accent" />
                  Technical Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Techniques */}
                  <div>
                    <h4 className="text-secondary font-medium mb-2">Techniques</h4>
                    <div className="flex flex-wrap gap-2">
                      {artwork.techniques.map((technique, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-muted rounded text-sm text-secondary/80"
                        >
                          {technique}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Dimensions if available */}
                  {artwork.dimensions && (
                    <div>
                      <h4 className="text-secondary font-medium mb-2">Dimensions</h4>
                      <p className="text-secondary/80">{artwork.dimensions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArtworkDetailPage;
