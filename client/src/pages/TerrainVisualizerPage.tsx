import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clamp } from '@/lib/helpers';

// TerrainVisualizerPage component
const TerrainVisualizerPage = () => {
  const [activeTab, setActiveTab] = useState('view');
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">3D Terrain Visualizer</h1>
        <p className="text-muted-foreground mb-8">
          Interactive WebGL terrain visualization with real-time heightmap editing
        </p>
        
        <Tabs 
          defaultValue="view" 
          className="w-full" 
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="view">View Terrain</TabsTrigger>
            <TabsTrigger value="edit">Edit Heightmap</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="pt-4">
            <TerrainViewer />
          </TabsContent>
          
          <TabsContent value="edit" className="pt-4">
            <HeightmapEditor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Terrain visualization component 
const TerrainViewer = () => {
  const [terrainSettings, setTerrainSettings] = useState({
    resolution: 64, // Reduced for better performance
    height: 4,
    scale: 20,
    wireframe: false,
    material: 'phong', // Changed to phong for better performance
    seed: Math.random() * 1000,
    roughness: 0.7,
    metalness: 0.1,
    displacementScale: 1.0,
    smoothShading: true,
    rotation: 0
  });
  
  const [heightmapImage, setHeightmapImage] = useState<string | null>(null);
  
  // Generate random heightmap
  const generateRandomTerrain = () => {
    const newSeed = Math.random() * 1000;
    setTerrainSettings(prev => ({
      ...prev,
      seed: newSeed
    }));
  };
  
  // Update settings handler
  const updateSettings = (key: string, value: any) => {
    setTerrainSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle heightmap upload
  const handleHeightmapUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setHeightmapImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 3D Visualization */}
        <div className="flex-1 bg-muted rounded-lg overflow-hidden h-[500px] md:h-[600px]">
          <Canvas
            shadows={false} 
            gl={{
              powerPreference: "high-performance",
              antialias: false,
              stencil: false,
              depth: true
            }}
            camera={{ position: [0, 8, 12], fov: 45 }}
            performance={{ min: 0.5 }}
            dpr={[1, 1.5]}
          >
            <color attach="background" args={[0x111111]} />
            <ambientLight intensity={0.4} />
            <directionalLight 
              intensity={1} 
              position={[10, 10, 5]} 
              castShadow={false}
            />
            <fog attach="fog" args={['#111111', 15, 30]} />
            <Suspense fallback={null}>
              <TerrainMesh 
                {...terrainSettings} 
                heightmapImage={heightmapImage}
              />
            </Suspense>
            <OrbitControls 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 2.1} 
              enablePan={true} 
              enableZoom={true} 
              zoomSpeed={0.5}
              maxDistance={25}
            />
          </Canvas>
        </div>
        
        {/* Controls Panel */}
        <div className="lg:w-[300px] bg-muted/30 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-4">Terrain Settings</h3>
          
          <div className="mb-4">
            <Button 
              onClick={generateRandomTerrain} 
              variant="outline" 
              className="w-full mb-4"
            >
              Generate Random Terrain
            </Button>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Upload Heightmap</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeightmapUpload}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-accent file:text-white hover:file:bg-accent/80 cursor-pointer"
              />
              <p className="text-muted-foreground text-xs mt-1">
                Grayscale images work best for heightmaps
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Resolution</label>
              <Select 
                value={terrainSettings.resolution.toString()} 
                onValueChange={(value) => updateSettings('resolution', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="32">32 x 32</SelectItem>
                  <SelectItem value="64">64 x 64</SelectItem>
                  <SelectItem value="128">128 x 128</SelectItem>
                  <SelectItem value="256">256 x 256</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Height: {terrainSettings.height.toFixed(1)}
              </label>
              <Slider 
                value={[terrainSettings.height]} 
                min={0.1} 
                max={10} 
                step={0.1} 
                onValueChange={(value) => updateSettings('height', value[0])}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Scale: {terrainSettings.scale.toFixed(1)}
              </label>
              <Slider 
                value={[terrainSettings.scale]} 
                min={5} 
                max={50} 
                step={1} 
                onValueChange={(value) => updateSettings('scale', value[0])}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Roughness: {terrainSettings.roughness.toFixed(2)}
              </label>
              <Slider 
                value={[terrainSettings.roughness]} 
                min={0} 
                max={1} 
                step={0.01} 
                onValueChange={(value) => updateSettings('roughness', value[0])}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Metalness: {terrainSettings.metalness.toFixed(2)}
              </label>
              <Slider 
                value={[terrainSettings.metalness]} 
                min={0} 
                max={1} 
                step={0.01} 
                onValueChange={(value) => updateSettings('metalness', value[0])}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="wireframe"
                checked={terrainSettings.wireframe}
                onChange={(e) => updateSettings('wireframe', e.target.checked)}
                className="rounded text-accent focus:ring-accent"
              />
              <label htmlFor="wireframe">Wireframe</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smoothShading"
                checked={terrainSettings.smoothShading}
                onChange={(e) => updateSettings('smoothShading', e.target.checked)}
                className="rounded text-accent focus:ring-accent"
              />
              <label htmlFor="smoothShading">Smooth Shading</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Material</label>
              <Select 
                value={terrainSettings.material} 
                onValueChange={(value) => updateSettings('material', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="phong">Phong</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Terrain mesh component
interface TerrainMeshProps {
  resolution: number;
  height: number;
  scale: number;
  wireframe: boolean;
  material: string;
  seed: number;
  roughness: number;
  metalness: number;
  displacementScale: number;
  smoothShading: boolean;
  rotation: number;
  heightmapImage: string | null;
}

const TerrainMesh = ({
  resolution,
  height,
  scale,
  wireframe,
  material,
  seed,
  roughness,
  metalness,
  displacementScale,
  smoothShading,
  rotation,
  heightmapImage
}: TerrainMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  
  // Use memo to optimize geometry creation
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(scale, scale, Math.min(resolution - 1, 64), Math.min(resolution - 1, 64));
  }, [scale, resolution]);
  
  // Generate terrain heights based on simplex noise - optimized
  const generateTerrainHeights = useCallback(() => {
    if (!geometryRef.current) return;
    
    // If we have a heightmap image, use that instead of procedural generation
    if (heightmapImage && textureRef.current) {
      return;
    }
    
    // Simple noise-based terrain generation
    const positions = geometryRef.current.attributes.position;
    
    // Use a more efficient approach by limiting the number of operations
    const positionArray = positions.array as Float32Array;
    const vertexCount = positions.count;
    
    // Process in smaller batches to avoid long frames
    const batchSize = 1000;
    let currentIndex = 0;
    
    const processVertexBatch = () => {
      const endIndex = Math.min(currentIndex + batchSize, vertexCount);
      
      for (let i = currentIndex; i < endIndex; i++) {
        const idx = i * 3; // position array has x,y,z values
        const x = positionArray[idx];
        const z = positionArray[idx + 2];
        
        // Simple noise function
        const nx = x / scale;
        const nz = z / scale;
        
        // Generate height using multiple octaves of noise (simplified)
        let y = 0;
        const octaves = Math.min(4, Math.max(1, Math.floor(8 / (resolution / 32))));
        
        let amplitude = 1;
        let frequency = 1;
        
        for (let o = 0; o < octaves; o++) {
          // More efficient noise calculation
          const sx = Math.sin(nx * frequency + seed * 0.1);
          const cz = Math.cos(nz * frequency + seed * 0.2);
          const noiseVal = sx * cz * 0.5;
          
          y += noiseVal * amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }
        
        positionArray[idx + 1] = y * height;
      }
      
      currentIndex = endIndex;
      
      if (currentIndex < vertexCount) {
        // Process next batch in the next frame
        requestAnimationFrame(processVertexBatch);
      } else {
        // All vertices processed
        positions.needsUpdate = true;
        geometryRef.current?.computeVertexNormals();
      }
    };
    
    // Start processing
    processVertexBatch();
  }, [geometryRef, height, scale, seed, resolution, heightmapImage, textureRef]);
  
  // Handle heightmap texture loading - optimized
  useEffect(() => {
    if (!heightmapImage || !geometryRef.current) return;
    
    let isMounted = true;
    
    const texture = new THREE.TextureLoader().load(heightmapImage, (loadedTexture) => {
      if (!isMounted || !geometryRef.current) return;
      
      // Process the heightmap in a more efficient way
      try {
        // Create a temporary canvas with smaller dimensions
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const image = loadedTexture.image;
        
        // Limit the size of the canvas to improve performance
        const maxSize = 256;
        const scaleFactor = Math.min(1, maxSize / Math.max(image.width, image.height));
        
        canvas.width = Math.floor(image.width * scaleFactor);
        canvas.height = Math.floor(image.height * scaleFactor);
        
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        // Get the image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const heightData = imageData.data;
        
        // Update geometry based on heightmap
        const positions = geometryRef.current.attributes.position;
        const positionArray = positions.array as Float32Array;
        
        // Process in smaller batches
        const batchSize = 1000;
        const vertexCount = positions.count;
        let currentIndex = 0;
        
        const processHeightmapBatch = () => {
          if (!isMounted || !geometryRef.current) return;
          
          const endIndex = Math.min(currentIndex + batchSize, vertexCount);
          
          for (let i = currentIndex; i < endIndex; i++) {
            const idx = i * 3; // position array has x,y,z values
            const x = positionArray[idx];
            const z = positionArray[idx + 2];
            
            // Convert from world space to heightmap space (simplified)
            const halfSize = scale / 2;
            const tx = (x + halfSize) / scale;
            const tz = (z + halfSize) / scale;
            
            // Get pixel coordinates (clamped to valid range)
            const pixelX = Math.min(canvas.width - 1, Math.max(0, Math.floor(tx * canvas.width)));
            const pixelZ = Math.min(canvas.height - 1, Math.max(0, Math.floor(tz * canvas.height)));
            
            // Get height from red channel (grayscale image)
            const pixelIndex = (pixelZ * canvas.width + pixelX) * 4;
            const heightValue = heightData[pixelIndex] / 255; // Normalize to 0-1
            
            // Set the height
            positionArray[idx + 1] = heightValue * height;
          }
          
          currentIndex = endIndex;
          
          if (currentIndex < vertexCount) {
            // Process next batch in the next frame
            setTimeout(processHeightmapBatch, 0);
          } else {
            // All vertices processed
            positions.needsUpdate = true;
            geometryRef.current?.computeVertexNormals();
          }
        };
        
        // Start processing
        processHeightmapBatch();
      } catch (error) {
        console.error("Error processing heightmap:", error);
        generateTerrainHeights();
      }
    });
    
    textureRef.current = texture;
    
    return () => {
      isMounted = false;
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, [heightmapImage, resolution, height, scale, generateTerrainHeights]);
  
  // Update terrain when parameters change - optimized with debounce
  useEffect(() => {
    if (heightmapImage || !geometryRef.current) return;
    
    // Use a timeout to debounce rapid changes
    const timeoutId = setTimeout(() => {
      generateTerrainHeights();
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [resolution, height, scale, seed, generateTerrainHeights, heightmapImage]);
  
  // Rotate terrain
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation;
    }
  }, [rotation]);
  
  // Create material based on selection
  let terrainMaterial;
  
  switch (material) {
    case 'phong':
      terrainMaterial = <meshPhongMaterial
        color="#6b8e23"
        shininess={30}
        flatShading={!smoothShading}
        wireframe={wireframe}
      />;
      break;
    case 'basic':
      terrainMaterial = <meshBasicMaterial
        color="#555555"
        wireframe={wireframe}
      />;
      break;
    case 'normal':
      terrainMaterial = <meshNormalMaterial
        flatShading={!smoothShading}
        wireframe={wireframe}
      />;
      break;
    case 'standard':
    default:
      terrainMaterial = <meshStandardMaterial
        color="#6b8e23"
        roughness={roughness}
        metalness={metalness}
        flatShading={!smoothShading}
        wireframe={wireframe}
      />;
  }
  
  // Use the memoized geometry instead of creating a new one every render
  useEffect(() => {
    geometryRef.current = geometry;
  }, [geometry]);
  
  return (
    <mesh 
      ref={meshRef} 
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow={false}
      castShadow={false}
      position={[0, 0, 0]}
    >
      <primitive object={geometry} ref={geometryRef} />
      {terrainMaterial}
    </mesh>
  );
};

// Heightmap editor component
const HeightmapEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolMode, setToolMode] = useState<'draw' | 'smooth' | 'flatten'>('draw');
  const [brushSize, setBrushSize] = useState(20);
  const [brushStrength, setBrushStrength] = useState(0.2);
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 512 });
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Fill with a gray background (mid-height)
    context.fillStyle = '#808080';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasSize]);
  
  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Get mouse/touch position
    let x: number, y: number;
    
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      const rect = canvas.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    // Apply different tools
    switch (toolMode) {
      case 'draw':
        // Draw with brush
        drawHeightBrush(context, x, y);
        break;
      case 'smooth':
        // Smooth heights
        smoothHeightBrush(context, x, y);
        break;
      case 'flatten':
        // Flatten heights
        flattenHeightBrush(context, x, y);
        break;
    }
  };
  
  // Draw height brush (raise or lower terrain)
  const drawHeightBrush = (context: CanvasRenderingContext2D, x: number, y: number) => {
    const radius = brushSize;
    const strength = brushStrength * 255; // Scale to pixel values
    
    // Get the image data to modify
    const imageData = context.getImageData(
      Math.max(0, x - radius), 
      Math.max(0, y - radius), 
      radius * 2, 
      radius * 2
    );
    
    for (let py = 0; py < imageData.height; py++) {
      for (let px = 0; px < imageData.width; px++) {
        // Calculate distance from brush center
        const dx = px - Math.min(radius, x);
        const dy = py - Math.min(radius, y);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Apply brush based on distance (falloff)
        if (distance < radius) {
          const falloff = 1 - (distance / radius);
          const index = (py * imageData.width + px) * 4;
          
          // Calculate new height value
          let newVal = imageData.data[index] + strength * falloff;
          // Clamp to valid range (0-255)
          newVal = clamp(newVal, 0, 255);
          
          // Set all RGB channels to the same value (grayscale)
          imageData.data[index] = newVal;     // Red
          imageData.data[index + 1] = newVal; // Green
          imageData.data[index + 2] = newVal; // Blue
          // Alpha stays at 255 (fully opaque)
        }
      }
    }
    
    // Put the modified image data back
    context.putImageData(
      imageData, 
      Math.max(0, x - radius), 
      Math.max(0, y - radius)
    );
  };
  
  // Smooth heights
  const smoothHeightBrush = (context: CanvasRenderingContext2D, x: number, y: number) => {
    const radius = brushSize;
    
    // Get a slightly larger area to sample neighbors for smoothing
    const imageData = context.getImageData(
      Math.max(0, x - radius - 1), 
      Math.max(0, y - radius - 1), 
      radius * 2 + 2, 
      radius * 2 + 2
    );
    
    // Create a copy for reading while we modify the original
    const originalData = new Uint8ClampedArray(imageData.data);
    
    // Apply a simple box blur
    for (let py = 1; py < imageData.height - 1; py++) {
      for (let px = 1; px < imageData.width - 1; px++) {
        // Calculate distance from brush center
        const dx = px - Math.min(radius + 1, x);
        const dy = py - Math.min(radius + 1, y);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < radius) {
          const falloff = brushStrength * (1 - (distance / radius));
          const index = (py * imageData.width + px) * 4;
          
          // Simple box blur (average of 9 surrounding pixels)
          let sum = 0;
          for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
              const sampleIndex = ((py + oy) * imageData.width + (px + ox)) * 4;
              sum += originalData[sampleIndex];
            }
          }
          const average = sum / 9;
          
          // Blend between original and smoothed value based on falloff
          const original = originalData[index];
          const smoothed = original * (1 - falloff) + average * falloff;
          
          // Set the new value
          imageData.data[index] = smoothed;     // Red
          imageData.data[index + 1] = smoothed; // Green
          imageData.data[index + 2] = smoothed; // Blue
        }
      }
    }
    
    // Put the modified image data back
    context.putImageData(
      imageData, 
      Math.max(0, x - radius - 1), 
      Math.max(0, y - radius - 1)
    );
  };
  
  // Flatten heights
  const flattenHeightBrush = (context: CanvasRenderingContext2D, x: number, y: number) => {
    const radius = brushSize;
    
    // Get the image data to modify
    const imageData = context.getImageData(
      Math.max(0, x - radius), 
      Math.max(0, y - radius), 
      radius * 2, 
      radius * 2
    );
    
    // Sample the center point value (what we'll flatten to)
    const centerX = Math.min(radius, x);
    const centerY = Math.min(radius, y);
    const centerIndex = (centerY * imageData.width + centerX) * 4;
    const targetValue = imageData.data[centerIndex];
    
    for (let py = 0; py < imageData.height; py++) {
      for (let px = 0; px < imageData.width; px++) {
        // Calculate distance from brush center
        const dx = px - centerX;
        const dy = py - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Apply brush based on distance (falloff)
        if (distance < radius) {
          const falloff = brushStrength * (1 - (distance / radius));
          const index = (py * imageData.width + px) * 4;
          
          // Blend toward target value
          const original = imageData.data[index];
          const flattened = original * (1 - falloff) + targetValue * falloff;
          
          // Set all RGB channels to the same value (grayscale)
          imageData.data[index] = flattened;     // Red
          imageData.data[index + 1] = flattened; // Green
          imageData.data[index + 2] = flattened; // Blue
        }
      }
    }
    
    // Put the modified image data back
    context.putImageData(
      imageData, 
      Math.max(0, x - radius), 
      Math.max(0, y - radius)
    );
  };
  
  // Export heightmap
  const exportHeightmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Convert to PNG and trigger download
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'heightmap.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Reset heightmap
  const resetHeightmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Fill with a gray background (mid-height)
    context.fillStyle = '#808080';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  // Create some preset patterns
  const applyPreset = (preset: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    switch (preset) {
      case 'mountains':
        // Create a mountain range pattern
        context.fillStyle = '#505050'; // Dark gray base
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw some mountain peaks
        for (let i = 0; i < 10; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = 50 + Math.random() * 100;
          
          // Create a radial gradient for mountains
          const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, '#ffffff'); // White at peak
          gradient.addColorStop(0.6, '#a0a0a0'); // Gray for mid-slopes
          gradient.addColorStop(1, '#505050'); // Back to base
          
          context.fillStyle = gradient;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
        break;
        
      case 'canyon':
        // Create a canyon/valley pattern
        context.fillStyle = '#b0b0b0'; // Light gray base (high ground)
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a meandering river/canyon
        context.strokeStyle = '#303030'; // Dark for low areas
        context.lineWidth = 50;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        context.beginPath();
        let x = 0;
        let y = canvas.height / 2;
        context.moveTo(x, y);
        
        // Create a meandering path
        while (x < canvas.width) {
          x += Math.random() * 80 + 20;
          y += (Math.random() - 0.5) * 100;
          y = Math.max(50, Math.min(canvas.height - 50, y)); // Keep within bounds
          context.lineTo(x, y);
        }
        
        context.stroke();
        
        // Add some erosion patterns
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const length = 20 + Math.random() * 40;
          const angle = Math.random() * Math.PI * 2;
          
          context.lineWidth = 5 + Math.random() * 15;
          context.strokeStyle = '#505050';
          
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(
            x + Math.cos(angle) * length,
            y + Math.sin(angle) * length
          );
          context.stroke();
        }
        break;
        
      case 'crater':
        // Create a crater pattern
        context.fillStyle = '#a0a0a0'; // Medium gray base
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a main crater
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const craterRadius = Math.min(canvas.width, canvas.height) * 0.3;
        
        // Crater rim (higher than surroundings)
        context.fillStyle = '#d0d0d0';
        context.beginPath();
        context.arc(centerX, centerY, craterRadius, 0, Math.PI * 2);
        context.fill();
        
        // Crater depression (lower than surroundings)
        context.fillStyle = '#505050';
        context.beginPath();
        context.arc(centerX, centerY, craterRadius * 0.8, 0, Math.PI * 2);
        context.fill();
        
        // Add some smaller craters
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = 5 + Math.random() * 20;
          
          // Crater rim
          context.fillStyle = '#c0c0c0';
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
          
          // Crater depression
          context.fillStyle = '#707070';
          context.beginPath();
          context.arc(x, y, radius * 0.7, 0, Math.PI * 2);
          context.fill();
        }
        break;
    }
  };
  
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Canvas editor */}
        <div className="flex-1 bg-muted rounded-lg overflow-hidden p-4">
          <div className="relative bg-[#333] border border-border">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="w-full h-auto touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button 
              onClick={exportHeightmap}
              variant="default"
            >
              Export Heightmap
            </Button>
            <Button 
              onClick={resetHeightmap}
              variant="outline"
            >
              Reset Canvas
            </Button>
            <Button
              onClick={() => {
                const img = canvasRef.current?.toDataURL('image/png');
                if (img) setHeightmapImage(img);
              }}
              variant="outline"
              className="bg-accent/10 hover:bg-accent/20"
            >
              Use in 3D View
            </Button>
          </div>
        </div>
        
        {/* Editor controls */}
        <div className="lg:w-[300px] bg-muted/30 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-4">Heightmap Editor</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tool</label>
              <div className="flex rounded-md border border-input overflow-hidden">
                <button
                  className={`flex-1 px-3 py-2 text-center ${toolMode === 'draw' ? 'bg-accent text-white' : 'bg-transparent hover:bg-muted'}`}
                  onClick={() => setToolMode('draw')}
                >
                  Draw
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-center ${toolMode === 'smooth' ? 'bg-accent text-white' : 'bg-transparent hover:bg-muted'}`}
                  onClick={() => setToolMode('smooth')}
                >
                  Smooth
                </button>
                <button
                  className={`flex-1 px-3 py-2 text-center ${toolMode === 'flatten' ? 'bg-accent text-white' : 'bg-transparent hover:bg-muted'}`}
                  onClick={() => setToolMode('flatten')}
                >
                  Flatten
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Brush Size: {brushSize}px
              </label>
              <Slider 
                value={[brushSize]} 
                min={1} 
                max={50} 
                step={1} 
                onValueChange={(value) => setBrushSize(value[0])}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Brush Strength: {Math.round(brushStrength * 100)}%
              </label>
              <Slider 
                value={[brushStrength]} 
                min={0.01} 
                max={1} 
                step={0.01} 
                onValueChange={(value) => setBrushStrength(value[0])}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Terrain Presets</label>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => applyPreset('mountains')}
                  variant="outline"
                  className="justify-start"
                >
                  Mountains
                </Button>
                <Button 
                  onClick={() => applyPreset('canyon')}
                  variant="outline"
                  className="justify-start"
                >
                  Canyon
                </Button>
                <Button 
                  onClick={() => applyPreset('crater')}
                  variant="outline"
                  className="justify-start"
                >
                  Crater
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Instructions</label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Use the Draw tool to raise/lower terrain</p>
                <p>• Use Smooth to blend sharp edges</p>
                <p>• Use Flatten to level areas</p>
                <p>• Export creates a PNG heightmap</p>
                <p>• Switch to the View tab to visualize in 3D</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerrainVisualizerPage;