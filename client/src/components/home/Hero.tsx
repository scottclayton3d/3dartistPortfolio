import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const HeroSection = () => {
  const mountRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Scene setup
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      currentMount.clientWidth / currentMount.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;

    // Renderer setup with WebGL
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    currentMount.appendChild(renderer.domElement);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    composer.addPass(bloomPass);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Particles background
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Main 3D model
    const gltfLoader = new GLTFLoader();
    let model;

    gltfLoader.load(
      '/path/to/your/3d-model.glb', // Replace with your model path
      (gltf) => {
        model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        model.position.y = -1;
        scene.add(model);

        // Animation once model is loaded
        gsap.to(model.rotation, {
          y: Math.PI * 2,
          duration: 20,
          ease: "none",
          repeat: -1
        });

        setModelLoaded(true);
      },
      (progress) => {
        console.log(`Loading progress: ${(progress.loaded / progress.total) * 100}%`);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;

    // Mouse interaction
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      // Calculate normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Move point light based on mouse
      gsap.to(pointLight.position, {
        x: mouse.x * 3,
        y: mouse.y * 3,
        duration: 0.5
      });

      // Slightly rotate camera based on mouse position
      gsap.to(camera.position, {
        x: mouse.x * 0.3,
        y: mouse.y * 0.3,
        duration: 0.5
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      composer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;

      controls.update();
      composer.render();
    };

    animate();

    // Text animations with GSAP
    gsap.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1.2,
      delay: 0.5,
      ease: "power3.out"
    });

    gsap.from(subtitleRef.current, {
      y: 30,
      opacity: 0,
      duration: 1.2,
      delay: 0.8,
      ease: "power3.out"
    });

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      currentMount.removeChild(renderer.domElement);

      // Dispose resources
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  // Effect for hover animation
  useEffect(() => {
    if (hovering && titleRef.current) {
      gsap.to(titleRef.current, {
        scale: 1.05,
        duration: 0.3,
        color: '#ff00ff',
        ease: "power2.out"
      });
    } else if (titleRef.current) {
      gsap.to(titleRef.current, {
        scale: 1,
        duration: 0.3,
        color: '#ffffff',
        ease: "power2.out"
      });
    }
  }, [hovering]);

  return (
    <div className="hero-container">
      <div 
        ref={mountRef} 
        className="canvas-container"
        style={{
          width: '100%',
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />

      <div className="content-overlay" style={{
        position: 'relative',
        zIndex: 2,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        padding: '0 2rem'
      }}>
        <h1 
          ref={titleRef}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            fontSize: '4rem',
            margin: '0',
            textShadow: '0 0 10px rgba(255,0,255,0.5)'
          }}
        >
          3D Art Portfolio
        </h1>

        <p 
          ref={subtitleRef}
          style={{
            fontSize: '1.5rem',
            maxWidth: '600px',
            textAlign: 'center',
            margin: '1rem 0'
          }}
        >
          Exploring the intersection of imagination and technology
        </p>

        {!modelLoaded && (
          <div className="loading-indicator">
            <p>Loading 3D experience...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;