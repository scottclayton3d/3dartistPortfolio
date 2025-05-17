import * as THREE from 'three';

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

/**
 * Check if device is mobile based on screen width
 */
export function isMobileDevice(): boolean {
  return window.innerWidth < 768;
}

/**
 * Generate random number between min and max
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Map value from one range to another
 */
export function map(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Create a THREE.Color from hex string
 */
export function createColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

/**
 * Create points for 3D particle system
 */
export function createParticlePositions(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;
    
    positions[i3] = Math.cos(angle) * r;
    positions[i3 + 1] = (Math.random() - 0.5) * radius * 0.5;
    positions[i3 + 2] = Math.sin(angle) * r;
  }
  
  return positions;
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Create a random ID
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Lerp (Linear interpolation) between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

/**
 * Check if WebGL is supported
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/**
 * Get normalized device coordinates (-1 to 1) from mouse/touch position
 */
export function getNormalizedMousePos(
  event: MouseEvent | TouchEvent,
  element: HTMLElement
): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  
  // Get client position depending on whether it's a mouse or touch event
  const clientX = 'touches' in event 
    ? event.touches[0].clientX 
    : (event as MouseEvent).clientX;
  
  const clientY = 'touches' in event 
    ? event.touches[0].clientY 
    : (event as MouseEvent).clientY;
  
  // Convert to normalized device coordinates (-1 to 1)
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((clientY - rect.top) / rect.height) * 2 + 1;
  
  return { x, y };
}
