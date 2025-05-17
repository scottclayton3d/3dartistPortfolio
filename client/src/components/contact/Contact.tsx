import { useState, useRef, useEffect } from 'react';
import { Send, Mail, MapPin, Phone } from 'lucide-react';
import gsap from 'gsap';
import { useAudio } from '@/lib/stores/useAudio';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { playSuccess } = useAudio();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Set up animations
  useEffect(() => {
    if (!formRef.current) return;
    
    // Animate form elements
    gsap.from('.contact-title', {
      opacity: 0,
      y: 30,
      duration: 0.8
    });
    
    gsap.from('.contact-info-item', {
      opacity: 0,
      x: -20,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.3
    });
    
    gsap.from('.form-group', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.4
    });
  }, []);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Simulate form submission
    setIsSubmitting(true);
    
    // Mock successful submission after delay
    setTimeout(() => {
      setIsSubmitting(false);
      playSuccess();
      toast.success('Message sent successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="contact-title text-4xl md:text-5xl font-bold text-white mb-8 text-center">
          Get In Touch
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Contact info */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold text-secondary mb-6">
              Contact Information
            </h3>
            
            <div className="space-y-6">
              <div className="contact-info-item flex items-start">
                <Mail className="w-5 h-5 text-accent mt-1 mr-3" />
                <div>
                  <h4 className="font-medium text-secondary">Email</h4>
                  <p className="text-muted-foreground">hello@artportfolio.com</p>
                </div>
              </div>
              
              <div className="contact-info-item flex items-start">
                <MapPin className="w-5 h-5 text-accent mt-1 mr-3" />
                <div>
                  <h4 className="font-medium text-secondary">Location</h4>
                  <p className="text-muted-foreground">New York, NY</p>
                </div>
              </div>
              
              <div className="contact-info-item flex items-start">
                <Phone className="w-5 h-5 text-accent mt-1 mr-3" />
                <div>
                  <h4 className="font-medium text-secondary">Phone</h4>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact form */}
          <div className="col-span-1 md:col-span-2">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name field */}
                <div className="form-group">
                  <label htmlFor="name" className="block text-secondary mb-2">
                    Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-muted text-secondary rounded-md border border-border focus:border-accent focus:outline-none transition-colors"
                    required
                  />
                </div>
                
                {/* Email field */}
                <div className="form-group">
                  <label htmlFor="email" className="block text-secondary mb-2">
                    Email <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-muted text-secondary rounded-md border border-border focus:border-accent focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
              
              {/* Subject field */}
              <div className="form-group">
                <label htmlFor="subject" className="block text-secondary mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-muted text-secondary rounded-md border border-border focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              
              {/* Message field */}
              <div className="form-group">
                <label htmlFor="message" className="block text-secondary mb-2">
                  Message <span className="text-accent">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-muted text-secondary rounded-md border border-border focus:border-accent focus:outline-none transition-colors resize-none"
                  required
                ></textarea>
              </div>
              
              {/* Submit button */}
              <div className="form-group">
                <button
                  type="submit"
                  className="btn-primary flex items-center justify-center w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
