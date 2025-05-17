import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Artwork } from '@/types';
import { ArrowUpRight, MousePointer, Hand } from 'lucide-react';
import { usePortfolio } from '@/lib/stores/usePortfolio';

interface InfiniteDragImageGalleryProps {
  artworks: Artwork[];
}

const InfiniteDragImageGallery: React.FC<InfiniteDragImageGalleryProps> = ({ artworks }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const { animationEnabled } = usePortfolio();
  const [expandedItem, setExpandedItem] = useState<HTMLElement | null>(null);
  
  // Gallery settings
  const settings = {
    gap: 30,               // Gap between items
    itemWidth: 280,        // Base item width
    itemHeight: 200,       // Base item height
    expandedScale: 0.8,    // Scale of expanded item (relative to viewport)
    dragSpeed: 1.5,        // Drag sensitivity
    momentumFactor: 0.96,  // Momentum after drag (0-1)
    friction: 0.94,        // Friction to slow down momentum
    snapThreshold: 0.3,    // Threshold for snapping to position
  };

  useEffect(() => {
    if (!containerRef.current || artworks.length === 0) return;
    
    const container = containerRef.current;
    const overlay = overlayRef.current;
    const items = Array.from(container.querySelectorAll('.gallery-item'));
    
    // Initial setup variables
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    let mouseHasMoved = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isExpanded = false;
    let canDrag = true;
    let originalPosition = { x: 0, y: 0, width: 0, height: 0 };
    
    // Define repeating grid dimensions
    const gridColumns = 3;
    const gridRows = 3;
    const repeatingFactor = 2; // How many times to repeat the grid in each direction
    
    // Initial positioning - create an infinite repeating grid of items
    function initializePositions() {
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      // Calculate spacing
      const cellWidth = settings.itemWidth + settings.gap;
      const cellHeight = settings.itemHeight + settings.gap;
      
      // Calculate total grid dimensions
      const totalGridWidth = cellWidth * gridColumns;
      const totalGridHeight = cellHeight * gridRows;
      
      // Calculate origin to center the grid
      const originX = -totalGridWidth / 2;
      const originY = -totalGridHeight / 2;
      
      // Remove existing items if any (for reinitialization)
      Array.from(container.querySelectorAll('.gallery-item-clone')).forEach(clone => {
        clone.remove();
      });
      
      // Create the repeating grid by cloning items
      for (let repeatX = -repeatingFactor; repeatX <= repeatingFactor; repeatX++) {
        for (let repeatY = -repeatingFactor; repeatY <= repeatingFactor; repeatY++) {
          // Skip the center grid (already covered by original items)
          if (repeatX === 0 && repeatY === 0) continue;
          
          // Create clones for this grid section
          items.forEach((item, index) => {
            const clone = item.cloneNode(true) as HTMLElement;
            clone.classList.add('gallery-item-clone');
            container.appendChild(clone);
            
            // Calculate position within this grid
            const row = Math.floor(index / gridColumns);
            const col = index % gridColumns;
            
            const x = originX + (col * cellWidth) + (repeatX * totalGridWidth);
            const y = originY + (row * cellHeight) + (repeatY * totalGridHeight);
            
            clone.style.width = `${settings.itemWidth}px`;
            clone.style.height = `${settings.itemHeight}px`;
            clone.style.transform = `translate(${x}px, ${y}px)`;
            clone.dataset.originalX = String(x);
            clone.dataset.originalY = String(y);
            clone.dataset.zIndex = String(index);
            clone.style.zIndex = String(index);
            
            // Add event listeners to clones
            clone.addEventListener("click", (e) => {
              if (!mouseHasMoved) {
                e.preventDefault();
                expandItem(clone);
              }
            });
          });
        }
      }
      
      // Position original items in the center grid
      items.forEach((item, index) => {
        const el = item as HTMLElement;
        
        // Calculate position within grid
        const row = Math.floor(index / gridColumns);
        const col = index % gridColumns;
        
        const x = originX + (col * cellWidth);
        const y = originY + (row * cellHeight);
        
        el.style.width = `${settings.itemWidth}px`;
        el.style.height = `${settings.itemHeight}px`;
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.dataset.originalX = String(x);
        el.dataset.originalY = String(y);
        el.dataset.zIndex = String(index);
        el.style.zIndex = String(index);
      });
    }
    
    // Update positions each frame
    function updatePositions() {
      // Apply easing to position
      currentX = currentX + (targetX - currentX) * 0.1;
      currentY = currentY + (targetY - currentY) * 0.1;
      
      // Apply easing to velocity (for momentum)
      dragVelocityX *= settings.friction;
      dragVelocityY *= settings.friction;
      
      // Add momentum if not dragging
      if (!isDragging) {
        targetX += dragVelocityX;
        targetY += dragVelocityY;
      }
      
      // Calculate grid dimensions for wrapping effect
      const cellWidth = settings.itemWidth + settings.gap;
      const cellHeight = settings.itemHeight + settings.gap;
      const totalGridWidth = cellWidth * gridColumns;
      const totalGridHeight = cellHeight * gridRows;
      
      // Check if we need to wrap the position (infinite scrolling effect)
      // Use a partial wrapping threshold for a smoother transition
      const wrapThreshold = 0.7;
      
      if (Math.abs(currentX) > totalGridWidth * wrapThreshold) {
        // Wrap X position
        const wrapDirection = currentX > 0 ? -1 : 1;
        currentX += wrapDirection * totalGridWidth;
        targetX += wrapDirection * totalGridWidth;
        
        // Apply a subtle fade effect during wrap
        const allItems = document.querySelectorAll('.gallery-item, .gallery-item-clone');
        gsap.to(allItems, {
          opacity: 0.7,
          duration: 0.2,
          onComplete: () => {
            gsap.to(allItems, { 
              opacity: 1, 
              duration: 0.3,
              stagger: 0.01
            });
          }
        });
      }
      
      if (Math.abs(currentY) > totalGridHeight * wrapThreshold) {
        // Wrap Y position
        const wrapDirection = currentY > 0 ? -1 : 1;
        currentY += wrapDirection * totalGridHeight;
        targetY += wrapDirection * totalGridHeight;
        
        // Apply a subtle fade effect during wrap
        const allItems = document.querySelectorAll('.gallery-item, .gallery-item-clone');
        gsap.to(allItems, {
          opacity: 0.7,
          duration: 0.2,
          onComplete: () => {
            gsap.to(allItems, { 
              opacity: 1, 
              duration: 0.3,
              stagger: 0.01
            });
          }
        });
      }
      
      // Update all items position (including clones)
      const allItems = Array.from(container.querySelectorAll('.gallery-item, .gallery-item-clone'));
      allItems.forEach((item) => {
        if (item === expandedItem) return;
        
        const el = item as HTMLElement;
        const originalX = Number(el.dataset.originalX || 0);
        const originalY = Number(el.dataset.originalY || 0);
        
        // Apply the global offset + the item's original position
        gsap.set(el, {
          x: originalX + currentX,
          y: originalY + currentY,
        });
      });
      
      // Continue animation loop
      if (animationEnabled) {
        requestAnimationFrame(updatePositions);
      }
    }
    
    // Check which items are visible and update their opacity/scale
    function updateVisibleItems() {
      const containerRect = container.getBoundingClientRect();
      
      // Update all items (original and clones)
      const allItems = Array.from(container.querySelectorAll('.gallery-item, .gallery-item-clone'));
      allItems.forEach((item) => {
        if (item === expandedItem) return;
        
        const el = item as HTMLElement;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Check if item is within viewport with some margin
        const margin = 200;
        const isVisible = (
          centerX > -margin &&
          centerX < window.innerWidth + margin &&
          centerY > -margin &&
          centerY < window.innerHeight + margin
        );
        
        // Update visibility with a more subtle effect
        gsap.to(el, {
          autoAlpha: isVisible ? 1 : 0.2,
          scale: isVisible ? 1 : 0.85,
          duration: 0.4,
          ease: "power2.out"
        });
      });
    }
    
    // Expand an item when clicked
    function expandItem(item: HTMLElement) {
      if (isExpanded) return;
      isExpanded = true;
      canDrag = false;
      setExpandedItem(item);
      
      // Store original position for later
      const rect = item.getBoundingClientRect();
      originalPosition = {
        x: parseInt(item.style.transform.replace('translate(', '').split('px')[0]),
        y: parseInt(item.style.transform.split(', ')[1]),
        width: rect.width,
        height: rect.height
      };
      
      // Show overlay
      if (overlay) {
        gsap.to(overlay, {
          autoAlpha: 1,
          duration: 0.5
        });
      }
      
      // Calculate target size based on viewport
      const viewportWidth = window.innerWidth;
      const targetWidth = viewportWidth * settings.expandedScale;
      // Maintain aspect ratio
      const aspectRatio = rect.height / rect.width;
      const targetHeight = targetWidth * aspectRatio;
      
      // Expand the item
      gsap.to(item, {
        x: (viewportWidth - targetWidth) / 2,
        y: (window.innerHeight - targetHeight) / 2,
        width: targetWidth,
        height: targetHeight,
        zIndex: 1000,
        duration: 0.5,
        ease: "power2.out"
      });
    }
    
    // Close expanded item
    function closeExpandedItem() {
      if (!isExpanded || !expandedItem) return;
      
      isExpanded = false;
      
      // Hide overlay
      if (overlay) {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: 0.3
        });
      }
      
      // Restore original position and size
      gsap.to(expandedItem, {
        x: originalPosition.x + currentX,
        y: originalPosition.y + currentY,
        width: settings.itemWidth,
        height: settings.itemHeight,
        zIndex: expandedItem.dataset.zIndex || 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          setExpandedItem(null);
          canDrag = true;
        }
      });
    }
    
    // Event listeners
    container.addEventListener("mousedown", (e) => {
      if (!canDrag) return;
      isDragging = true;
      mouseHasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      container.style.cursor = "grabbing";
    });
    
    window.addEventListener("mousemove", (e) => {
      if (!isDragging || !canDrag) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        mouseHasMoved = true;
      }
      
      // Calculate velocity for momentum
      dragVelocityX = (e.clientX - lastMouseX) * settings.dragSpeed;
      dragVelocityY = (e.clientY - lastMouseY) * settings.dragSpeed;
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      
      targetX += dx * settings.dragSpeed;
      targetY += dy * settings.dragSpeed;
      
      startX = e.clientX;
      startY = e.clientY;
    });
    
    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = "grab";
        
        // Apply momentum
        if (mouseHasMoved) {
          targetX += dragVelocityX * settings.momentumFactor;
          targetY += dragVelocityY * settings.momentumFactor;
        }
      }
    });
    
    if (overlay) {
      overlay.addEventListener("click", () => {
        if (isExpanded) closeExpandedItem();
      });
    }
    
    // Touch events for mobile
    container.addEventListener("touchstart", (e) => {
      if (!canDrag) return;
      isDragging = true;
      mouseHasMoved = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    });
    
    window.addEventListener("touchmove", (e) => {
      if (!isDragging || !canDrag) return;
      
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        mouseHasMoved = true;
      }
      
      // Calculate velocity for momentum
      dragVelocityX = (e.touches[0].clientX - lastMouseX) * settings.dragSpeed;
      dragVelocityY = (e.touches[0].clientY - lastMouseY) * settings.dragSpeed;
      
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
      
      targetX += dx * settings.dragSpeed;
      targetY += dy * settings.dragSpeed;
      
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    window.addEventListener("touchend", () => {
      isDragging = false;
      
      // Apply momentum
      if (mouseHasMoved) {
        targetX += dragVelocityX * settings.momentumFactor;
        targetY += dragVelocityY * settings.momentumFactor;
      }
    });
    
    // Item click events
    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        // Only treat as click if mouse hasn't moved much
        if (!mouseHasMoved) {
          e.preventDefault();
          expandItem(item as HTMLElement);
        }
      });
    });
    
    // Handle window resize
    window.addEventListener("resize", () => {
      if (isExpanded && expandedItem) {
        const viewportWidth = window.innerWidth;
        const targetWidth = viewportWidth * settings.expandedScale;
        
        // Maintain aspect ratio
        const aspectRatio = originalPosition.height / originalPosition.width;
        const targetHeight = targetWidth * aspectRatio;
        
        gsap.to(expandedItem, {
          width: targetWidth,
          height: targetHeight,
          x: (viewportWidth - targetWidth) / 2,
          y: (window.innerHeight - targetHeight) / 2,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        updateVisibleItems();
      }
    });
    
    // Initialize gallery
    initializePositions();
    updatePositions();
    updateVisibleItems();
    
    // Add cursor styling
    container.style.cursor = "grab";
    
    // Cleanup function
    return () => {
      window.removeEventListener("mousemove", (e: MouseEvent) => {});
      window.removeEventListener("mouseup", () => {});
      window.removeEventListener("touchmove", (e: TouchEvent) => {});
      window.removeEventListener("touchend", () => {});
      window.removeEventListener("resize", () => {});
    };
  }, [artworks, animationEnabled]);
  
  // Save refs to items for manipulation
  const setItemRef = (el: HTMLDivElement | null, id: string) => {
    if (el) {
      itemsRef.current.set(id, el);
    } else {
      itemsRef.current.delete(id);
    }
  };
  
  return (
    <div className="infinite-gallery-container relative w-full h-[70vh] overflow-hidden">
      {/* Overlay for expanded view */}
      <div 
        ref={overlayRef} 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[999] opacity-0 invisible"
      ></div>
      
      {/* Interactive hint */}
      <div className="infinite-gallery-hint">
        <Hand className="w-4 h-4" />
        <span>Click and drag to explore</span>
        <MousePointer className="w-4 h-4" />
      </div>
      
      {/* Background gradient animation */}
      <div className="gallery-gradient-bg"></div>
      
      {/* Gallery container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full"
      >
        {artworks.map((artwork) => (
          <div 
            key={artwork.id}
            ref={(el) => setItemRef(el, artwork.id)}
            className="gallery-item absolute"
          >
            <div className="w-full h-full overflow-hidden rounded-lg group">
              <img 
                src={artwork.thumbnail} 
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="inline-block px-2 py-1 bg-accent text-white text-xs rounded mb-2">
                  {artwork.category}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  {artwork.title}
                </h3>
                <div className="flex items-center text-white/80 text-sm">
                  <span>View Details</span>
                  <ArrowUpRight className="ml-1 w-4 h-4" />
                </div>
              </div>
              
              {/* Full size link - will only activate when item is expanded */}
              {expandedItem && 
                <Link 
                  to={`/artwork/${artwork.id}`}
                  className="absolute inset-0 z-[1001]"
                  onClick={(e) => e.stopPropagation()}
                />
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteDragImageGallery;