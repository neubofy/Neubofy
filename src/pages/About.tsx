import { Heart, Shield, Zap, Users, Award, Calendar, Instagram, Github, ExternalLink, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import founderAvatar from "@/assets/founder-avatar.jpg";
import GoToTop from "@/components/GoToTop";

const About = () => {
  const timeline = [
    {
      year: "2025",
      title: "Neubofy Founded",
      description: "Started by an ambitious 11th-grade student with a vision to democratize AI automation."
    },
    {
      year: "2025",
      title: "First Client Success",
      description: "Delivered our first custom AI automation solution, proving our concept works."
    },
    {
      year: "Future",
      title: "Global Expansion",
      description: "Planning to scale our innovative solutions worldwide while maintaining our core values."
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Student-First Mindset",
      description: "Built by a student, for students, professionals, and businesses who think differently."
    },
    {
      icon: Shield,
      title: "Privacy by Design",
      description: "Zero-knowledge architecture ensures your data remains yours and yours alone."
    },
    {
      icon: Zap,
      title: "Innovation Without Limits",
      description: "We don't follow trends—we create them through bold thinking and execution."
    },
    {
      icon: Users,
      title: "Partnership Approach",
      description: "We don't just build solutions; we build lasting relationships and partnerships."
    }
  ];

  const socialMedia = [
    {
      name: "Telegram",
      icon: Send,
      url: "https://t.me/neubofy",
      color: "from-blue-400 to-blue-500",
      hoverColor: "hover:from-blue-500 hover:to-blue-600",
      description: "Chat with us directly"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/neubofy",
      color: "from-pink-500 to-pink-600",
      hoverColor: "hover:from-pink-600 hover:to-pink-700",
      description: "Follow us on Instagram"
    },
    {
      name: "GitHub",
      icon: Github,
      url: "https://github.com/pawanwashudev-official",
      color: "from-black to-gray-800",
      hoverColor: "hover:from-gray-800 hover:to-black",
      description: "View our open-source code"
    }
  ];

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      
      <div className="container mx-auto px-4 py-32">
        {/* Hero Section */}
        <Reveal>
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 gradient-text">
              The Story Behind Neubofy
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Neubofy is a premier software development agency led by solo founder Pawan Washudev. We specialize in building custom AI-driven solutions, high-performance web applications, and system-level Android apps for business founders and entrepreneurs. Our portfolio includes diverse projects like the school management systems and utility apps such as Reality, LCLD (anti-theft security), and NF Watch. We leverage cutting-edge AI to turn complex ideas into scalable software tools. Visit our GitHub to see our open-source contributions and proven track record of delivering quality code for modern businesses.
            </p>
          </div>
        </Reveal>

        {/* Founder Story */}
        <Reveal>
        <div className="glass-card p-12 rounded-3xl shadow-elevated mb-20 card-3d">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={founderAvatar} 
                  alt="Neubofy Founder - Solo founder and entrepreneur"
                  className="w-20 h-20 rounded-2xl object-cover shadow-card card-3d"
                />
                <div>
                  <h2 className="text-3xl font-bold gradient-text">Pawan Washudev</h2>
                  <p className="text-muted-foreground">Solo Founder & CEO</p>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-6">A Badge of Courage, Not a Limitation</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                While others see youth as inexperience, we see it as our greatest asset. Being a student founder means 
                we understand the real challenges that students, young professionals, and growing businesses face because 
                we live them every day.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Neubofy was born from a simple belief: AI should adapt to people, not the other way around. 
                We're building the future of automation with fresh perspectives, unlimited creativity, and an 
                uncompromising commitment to privacy and innovation.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="font-bold gradient-text mb-3">Our Mission</h4>
                <p className="text-muted-foreground text-sm">
                  To democratize AI automation by making it accessible, secure, and genuinely useful for everyone—
                  from students to enterprises.
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="font-bold gradient-text mb-3">Our Vision</h4>
                <p className="text-muted-foreground text-sm">
                  A world where AI truly understands and adapts to human needs, empowering people to achieve 
                  more while maintaining complete control over their data.
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="font-bold gradient-text mb-3">Our Promise</h4>
                <p className="text-muted-foreground text-sm">
                  Custom-crafted solutions with 100% privacy guarantee. We build partnerships, not just products.
                </p>
              </div>
            </div>
          </div>
        </div>
        </Reveal>

        {/* Timeline */}
        <div className="mb-20">
          <Reveal>
            <h2 className="text-4xl font-display font-bold text-center mb-12 gradient-text">Our Journey</h2>
          </Reveal>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-button"></div>
            {timeline.map((item, index) => (
              <Reveal key={index} delay={index * 0.05}>
                <div className="relative flex items-center mb-12">
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left order-2'}`}>
                    <div className="glass-card p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="font-bold text-primary">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-button rounded-full border-4 border-background"></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <Reveal>
            <h2 className="text-4xl font-display font-bold text-center mb-12 gradient-text">Our Core Values</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Reveal key={index} delay={index * 0.05}>
                  <div 
                    className="glass-card p-8 rounded-2xl hover:shadow-elevated transition-all duration-500 group"
                  >
                    <div className="w-16 h-16 bg-gradient-button rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mb-20">
          <Reveal>
            <h2 className="text-4xl font-display font-bold text-center mb-12 gradient-text">Connect With Us</h2>
            <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              Follow our journey, get insights, and stay updated with the latest in AI automation and innovation.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {socialMedia.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <Reveal key={index} delay={index * 0.05}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden"
                  >
                    <div className="glass-card p-6 rounded-2xl hover:shadow-elevated transition-all duration-500 group-hover:scale-105">
                      {/* Animated Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      {/* Icon with Animation */}
                      <div className="relative z-10">
                        <div className={`w-12 h-12 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          {social.name}
                        </h3>
                        <p className="text-muted-foreground text-xs mb-3">
                          {social.description}
                        </p>
                        {/* Animated Arrow */}
                        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                          <span className="text-xs font-semibold">Follow</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                      {/* Floating Particles Effect */}
                      <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500"></div>
                      <div className="absolute bottom-3 left-3 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700 delay-100"></div>
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Partnership CTA */}
        <Reveal>
          <div className="glass-card p-12 rounded-3xl shadow-elevated text-center">
            <Award className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold gradient-text mb-4">Partner With Us</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're always open to collaborating with like-minded individuals and organizations 
              who share our vision of democratizing AI automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn-hero px-8 py-3 inline-block">
                Start a Partnership
              </a>
              <a href="mailto:support@neubofy.in" className="btn-outline-glow px-8 py-3 inline-block">
                Email Us
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <Footer />
      <GoToTop />
    </div>
  );
};

export default About;