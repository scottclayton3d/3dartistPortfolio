import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useInView } from 'react-intersection-observer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ProcessSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });
  
  // Create timeline for process steps
  useEffect(() => {
    if (!containerRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
      }
    });
    
    // Animate title
    tl.from('.process-title', {
      opacity: 0,
      y: 50,
      duration: 0.8
    });
    
    // Animate process line
    tl.from('.process-line', {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 1.5,
      ease: 'power3.inOut'
    }, 0.3);
    
    // Animate process steps
    tl.from('.process-step', {
      opacity: 0,
      y: 30,
      stagger: 0.3,
      duration: 0.7,
      ease: 'back.out(1.2)'
    }, 0.5);
  }, []);
  
  // Process steps data
  const processSteps = [
    {
      number: '01',
      title: 'Concept & Research',
      description: 'Exploring ideas, gathering references, and defining the artistic direction for each piece.'
    },
    {
      number: '02',
      title: 'Digital Sketching',
      description: 'Creating preliminary 3D forms and establishing composition, scale, and spatial relationships.'
    },
    {
      number: '03',
      title: 'Modeling & Sculpting',
      description: 'Developing the primary 3D elements with attention to form, topology, and detail.'
    },
    {
      number: '04',
      title: 'Technical Development',
      description: 'Programming shaders, implementing interactivity, and optimizing for web performance.'
    },
    {
      number: '05',
      title: 'Refinement & Presentation',
      description: 'Polishing the final work with lighting, materials, and creating the perfect viewing experience.'
    }
  ];

  return (
    <section 
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #121212, #1a1a1a)' }}
      ref={(node) => {
        containerRef.current = node;
        inViewRef(node);
      }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="process-title section-title text-center text-secondary mb-20">Creative Process</h2>
        
        {/* Process timeline */}
        <div className="relative max-w-3xl mx-auto pl-12 md:pl-16">
          {/* Vertical line */}
          <div className="process-line absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent to-[#00FFD1]" style={{ height: 'calc(100% - 80px)' }}></div>
          
          {/* Process steps */}
          {processSteps.map((step, index) => (
            <div 
              key={index}
              className={`process-step relative mb-16 ${inView ? 'appear' : ''}`}
            >
              {/* Step number bubble */}
              <div className="absolute left-[-40px] md:left-[-50px] w-10 h-10 rounded-full bg-background flex items-center justify-center border-2 border-accent">
                <span className="text-accent text-sm font-bold">{step.number}</span>
              </div>
              
              {/* Step content */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-secondary/80">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Background gradient effect */}
      <div className="absolute -right-1/4 top-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[150px] -z-10"></div>
      <div className="absolute -left-1/4 bottom-1/4 w-1/2 h-1/2 bg-[#00FFD1]/10 rounded-full blur-[150px] -z-10"></div>
    </section>
  );
};

export default ProcessSection;
