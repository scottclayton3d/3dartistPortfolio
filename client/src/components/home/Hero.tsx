import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import styled from 'styled-components';

const HeroContainer = styled.div`
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #0a0a0a;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
  padding: 0 5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  
  @media (max-width: 768px) {
    padding: 0 2rem;
  }
`;

const Title = styled(motion.h1)`
  font-size: 5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1;
  background: linear-gradient(45deg, #ff3366, #ff9933, #33ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  max-width: 600px;
  margin: 2rem 0;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Button = styled(motion.button)`
  background: transparent;
  border: 2px solid #ff3366;
  color: white;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 200px;
  margin-top: 1rem;
  
  &:hover {
    background: #ff3366;
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(255, 51, 102, 0.3);
  }
`;

const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    opacity: 0.7;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const HeroSection = () => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1
    });
  };
  
  useEffect(() => {
    // Initialize Three.js scene
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(new THREE.Color(`hsl(var(--electric-blue))`), 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(new THREE.Color(`hsl(var(--soft-gold))`), 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(new THREE.Color(`hsl(var(--neon-pink))`), 1.2, 100);
    pointLight.position.set(0, 3, 3);
    scene.add(pointLight);
    
    // Create abstract 3D objects
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(`hsl(var(--cyan))`),
      metalness: 0.35,
      roughness: 0.08,
      wireframe: true,
      emissive: new THREE.Color(`hsl(var(--neon-purple))`),
      emissiveIntensity: 0.35
    });
    
    const meshObject = new THREE.Mesh(geometry, material);
    scene.add(meshObject);
    
    // Particles for background
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.018,
      color: new THREE.Color(`hsl(var(--electric-blue))`),
      transparent: true,
      opacity: 0.7
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      meshObject.rotation.x += 0.002;
      meshObject.rotation.y += 0.003;
      
      // React to mouse movement
      meshObject.rotation.x += mousePosition.y * 0.01;
      meshObject.rotation.y += mousePosition.x * 0.01;
      
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      
      // Post-processing: Bloom effect
      if (!renderer.toneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
      }
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      // Dispose resources
      geometry.dispose();
      material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <HeroContainer onMouseMove={handleMouseMove}>
      <Canvas ref={canvasRef} />
      
      <Content>
        <Title
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          CREATIVE 3D PORTFOLIO
        </Title>
        
        <Subtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Showcasing immersive 3D environments, character designs, and digital sculptures
          that push the boundaries of imagination.
        </Subtitle>
        
        <Button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Work
        </Button>
      </Content>
      
      <ScrollIndicator
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        animate={{
          y: [0, 10, 0],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
          opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        }}
      >
        <span>Scroll Down</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </ScrollIndicator>
    </HeroContainer>
  );
};

export default HeroSection;