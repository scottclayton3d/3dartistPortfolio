import { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollIndicator from './components/layout/ScrollIndicator';
import PageTransition from './components/transitions/PageTransition';

// Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ArtworkDetailPage = lazy(() => import('./pages/ArtworkDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFound = lazy(() => import('./pages/not-found'));

// Load the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Page transition effect
  useEffect(() => {
    // Initialize page
    if (!isReady) {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsLoading(false);
          setIsReady(true);
        }
      });
      
      // Initial loading animation
      tl.to('.loading-screen', {
        duration: 0.5,
        opacity: 0,
        delay: 1,
        ease: 'power2.inOut',
      });
    }

    // Handle route changes
    if (isReady) {
      const content = document.querySelector('.page-content');
      if (content) {
        // Animate out
        gsap.to(content, {
          opacity: 0,
          y: 20,
          duration: 0.2,
          onComplete: () => {
            // Animate in
            gsap.fromTo(content, 
              { opacity: 0, y: 20 },
              { 
                opacity: 1, 
                y: 0, 
                duration: 0.4,
                ease: 'power2.out',
                delay: 0.1
              }
            );
          }
        });
      }
    }
  }, [location.pathname, isReady]);

  return (
    <div className="app-container relative overflow-x-hidden">
      {/* Loading screen */}
      {isLoading && (
        <div className="loading-screen fixed inset-0 bg-background flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="loading-spinner w-16 h-16 border-4 border-accent rounded-full border-t-transparent animate-spin mb-4"></div>
            <p className="text-secondary text-xl">Loading experience...</p>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <Navbar />
      <main>
        <Suspense fallback={
          <div className="w-full h-screen flex items-center justify-center">
            <div className="loading-spinner w-12 h-12 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
          </div>
        }>
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </Suspense>
      </main>
      <Footer />
      <ScrollIndicator />
      
      {/* Toast notifications */}
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
