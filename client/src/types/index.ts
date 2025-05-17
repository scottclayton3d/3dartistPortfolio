// Artwork types
export interface Artwork {
  id: string;
  title: string;
  description: string;
  year: number;
  category: ArtworkCategory;
  thumbnail: string;
  images: string[];
  modelUrl?: string;
  techniques: string[];
  dimensions?: string;
  featured: boolean;
}

export type ArtworkCategory = 
  | '3D Model' 
  | 'Digital Sculpture' 
  | 'Abstract Render'
  | 'Conceptual Art'
  | 'Experimental';

// Animation types
export interface AnimationProps {
  delay?: number;
  duration?: number;
  ease?: string;
}

// Three.js and model viewer types
export interface ModelViewerProps {
  modelUrl?: string;
  artworkId: string;
  interactive?: boolean;
  autoRotate?: boolean;
  backgroundColor?: string;
  lightIntensity?: number;
}

// Custom Three.js environment and shader types
export interface VertexData {
  position: [number, number, number];
  color: [number, number, number];
  size: number;
}

export interface ShaderUniforms {
  uTime: { value: number };
  uColor: { value: THREE.Color };
  uResolution: { value: THREE.Vector2 };
  uMouse: { value: THREE.Vector2 };
  [key: string]: any;
}

// Custom hook types for portfolio state
export interface PortfolioState {
  // Navigation state
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // UI state
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Artwork filtering
  selectedCategory: ArtworkCategory | 'All';
  setSelectedCategory: (category: ArtworkCategory | 'All') => void;
  
  // View state for model viewer
  currentArtwork: Artwork | null;
  setCurrentArtwork: (artwork: Artwork | null) => void;
  
  // Interactive state
  isModelInteractive: boolean;
  setModelInteractive: (interactive: boolean) => void;
  
  // Animation state
  animationEnabled: boolean;
  toggleAnimation: () => void;
  
  // Utility methods
  getFilteredArtworks: () => Artwork[];
  getFeaturedArtworks: () => Artwork[];
}
