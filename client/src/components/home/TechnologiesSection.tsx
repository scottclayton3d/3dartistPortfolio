import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code, LucideShapes, Zap, Cpu, Layers, PenTool } from 'lucide-react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const TechnologiesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Set up animations
  useEffect(() => {
    if (!sectionRef.current) return;
    
    // Animate section title
    gsap.from('.tech-title', {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: '.tech-title',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
    
    // Animate tech cards
    gsap.from('.tech-card', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.tech-grid',
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    });
  }, []);
  
  // Technologies data
  const technologies = [
    {
      title: 'WebGL & Three.js',
      description: 'Creating immersive 3D scenes and interactive models with GPU acceleration',
      icon: <LucideShapes className="w-8 h-8 text-accent mb-4" />
    },
    {
      title: 'GLSL Shaders',
      description: 'Custom fragment and vertex shaders for unique visual effects',
      icon: <Code className="w-8 h-8 text-accent mb-4" />
    },
    {
      title: 'GSAP Animations',
      description: 'Smooth, performant animations and transitions between states',
      icon: <Zap className="w-8 h-8 text-accent mb-4" />
    },
    {
      title: 'React & React Three Fiber',
      description: 'Component-based development for efficient 3D scene management',
      icon: <Layers className="w-8 h-8 text-accent mb-4" />
    },
    {
      title: 'Procedural Generation',
      description: 'Algorithmically created forms, textures and particle systems',
      icon: <Cpu className="w-8 h-8 text-accent mb-4" />
    },
    {
      title: 'Digital Sculpting',
      description: 'Organic form creation and high-detail model manipulation',
      icon: <PenTool className="w-8 h-8 text-accent mb-4" />
    }
  ];

  return (
    <section 
      className="section-padding bg-primary"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="tech-title section-title text-center text-secondary mb-16">Technologies & Tools</h2>
        
        {/* Technologies grid */}
        <div className="tech-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologies.map((tech, index) => (
            <div 
              key={index}
              className="tech-card p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-300 border border-border hover:border-accent/30"
            >
              {tech.icon}
              <h3 className="text-xl font-bold text-secondary mb-3">{tech.title}</h3>
              <p className="text-muted-foreground">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologiesSection;
