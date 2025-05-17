import { create } from "zustand";
import { artworks } from "@/data/artworks";
import { type Artwork, type ArtworkCategory } from "@/types";

interface PortfolioState {
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

export const usePortfolio = create<PortfolioState>((set, get) => ({
  // Navigation state
  currentPage: 'home',
  setCurrentPage: (page: string) => set({ currentPage: page }),
  
  // UI state - always dark mode by default
  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  // Artwork filtering
  selectedCategory: 'All',
  setSelectedCategory: (category: ArtworkCategory | 'All') => set({ selectedCategory: category }),
  
  // View state for model viewer
  currentArtwork: null,
  setCurrentArtwork: (artwork: Artwork | null) => set({ currentArtwork: artwork }),
  
  // Interactive state
  isModelInteractive: true,
  setModelInteractive: (interactive: boolean) => set({ isModelInteractive: interactive }),
  
  // Animation state
  animationEnabled: true,
  toggleAnimation: () => set((state) => ({ animationEnabled: !state.animationEnabled })),
  
  // Utility methods
  getFilteredArtworks: () => {
    const { selectedCategory } = get();
    if (selectedCategory === 'All') {
      return artworks;
    }
    return artworks.filter(artwork => artwork.category === selectedCategory);
  },
  
  getFeaturedArtworks: () => {
    return artworks.filter(artwork => artwork.featured);
  }
}));
