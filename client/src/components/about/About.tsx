import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up scroll animations
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Animate section parts as they come into view
    gsap.from('.about-title', {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: '.about-title',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
    
    gsap.from('.about-text', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.about-text-container',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
    
    gsap.from('.skill-item', {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.skills-container',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
    
    gsap.from('.contact-button', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: '.contact-button',
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });
  }, []);

  // Skills list
  const skills = [
    '3D Modeling', 'Digital Sculpture', 'WebGL', 'Three.js',
    'Procedural Generation', 'Shader Programming', 'Animation',
    'Texture Creation', 'Lighting Design', 'Interactive Art'
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12" ref={containerRef}>
      <div className="max-w-4xl mx-auto">
        <h1 className="about-title text-4xl md:text-5xl font-bold text-white mb-8">
          About the Artist
        </h1>
        
        <div className="about-text-container space-y-6 mb-12">
          <p className="about-text text-lg text-secondary/90">
            Welcome to my digital art portfolio. I'm a 3D artist and creative coder focused on the intersection of art, technology, and interactive experiences. My work explores digital spaces, abstract forms, and the relationship between traditional artistic principles and emerging technologies.
          </p>
          
          <p className="about-text text-lg text-secondary/90">
            Through my art, I aim to create immersive digital experiences that challenge our perception of space, form, and movement. I'm particularly interested in how digital art can create emotional responses and new ways of seeing the world around us.
          </p>
          
          <p className="about-text text-lg text-secondary/90">
            My process combines traditional art techniques with cutting-edge software and custom code. Each piece begins with research and conceptual development, followed by extensive experimentation with tools and techniques to realize the final vision.
          </p>
        </div>
        
        {/* Skills */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Technical Skills</h2>
          
          <div className="skills-container flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span 
                key={skill}
                className="skill-item px-3 py-2 bg-muted rounded-md text-secondary/80 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        {/* Call to action */}
        <div className="text-center">
          <p className="about-text text-lg text-secondary/90 mb-6">
            Interested in collaborating or commissioning work? I'm available for art projects, digital installations, and creative coding assignments.
          </p>
          
          <Link to="/contact" className="contact-button btn-primary">
            Get In Touch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
