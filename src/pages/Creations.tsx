import { useState } from "react";
import { ExternalLink, Play, Code, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import studentMentor from "@/assets/student-mentor-mockup.jpg";
import inventoryAI from "@/assets/inventory-ai-mockup.jpg";
import contentCreator from "@/assets/content-creator-mockup.jpg";

const Creations = () => {
  // This would typically come from a CMS or config file for easy updates
  const [creations] = useState([
    {
      id: 1,
      title: "AI Study Mentor",
      description: "Personalized AI-powered study companion that adapts to your learning style, tracks progress, and provides intelligent recommendations for academic success.",
      image: studentMentor,
      tags: ["Education", "AI Mentor", "Study Assistant"],
      category: "Student Tools",
      status: "Live",
      features: [
        "Personalized study plans",
        "Progress tracking",
        "AI-powered recommendations",
        "Performance analytics"
      ],
      demoUrl: "#",
      caseStudyUrl: "#"
    },
    {
      id: 2,
      title: "SmartInventory Pro",
      description: "Advanced inventory management system with AI-powered demand forecasting, automated reordering, and comprehensive analytics for businesses.",
      image: inventoryAI,
      tags: ["Business", "Inventory", "Analytics"],
      category: "Business Solutions",
      status: "Live",
      features: [
        "Demand forecasting",
        "Automated reordering",
        "Real-time analytics",
        "Multi-location support"
      ],
      demoUrl: "#",
      caseStudyUrl: "#"
    },
    {
      id: 3,
      title: "ContentCraft AI",
      description: "Intelligent content creation platform that generates, edits, and optimizes content across multiple formats while maintaining your unique brand voice.",
      image: contentCreator,
      tags: ["Content", "AI Writing", "Marketing"],
      category: "Content Tools",
      status: "Live",
      features: [
        "Multi-format content generation",
        "Brand voice consistency",
        "SEO optimization",
        "Content calendar integration"
      ],
      demoUrl: "#",
      caseStudyUrl: "#"
    },
    {
      id: 4,
      title: "AutoFlow Workspace",
      description: "Custom workflow automation platform that connects your favorite tools and eliminates repetitive tasks through intelligent process automation.",
      image: studentMentor,
      tags: ["Automation", "Productivity", "Workflows"],
      category: "Productivity",
      status: "In Development",
      features: [
        "Custom workflow builder",
        "App integrations",
        "Task automation",
        "Performance monitoring"
      ],
      demoUrl: "#",
      caseStudyUrl: "#"
    },
    {
      id: 5,
      title: "PrivacyGuard Suite",
      description: "Comprehensive privacy protection toolkit that secures your digital presence while enabling seamless AI automation across all your tools.",
      image: inventoryAI,
      tags: ["Privacy", "Security", "Data Protection"],
      category: "Privacy Tools",
      status: "Coming Soon",
      features: [
        "Zero-knowledge encryption",
        "Privacy audit tools",
        "Secure AI processing",
        "Compliance monitoring"
      ],
      demoUrl: "#",
      caseStudyUrl: "#"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const categories = ["All", "Student Tools", "Business Solutions", "Content Tools", "Productivity", "Privacy Tools"];
  
  const filteredCreations = selectedCategory === "All" 
    ? creations 
    : creations.filter(creation => creation.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "In Development": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Coming Soon": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      
      <div className="container mx-auto px-4 py-32">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 gradient-text">
            Our Creations
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what Neubofy can build for you. Each solution is custom-crafted with privacy, 
            innovation, and your success in mind.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={selectedCategory === category 
                ? "btn-hero" 
                : "btn-outline-glow"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Creations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredCreations.map((creation, index) => (
            <div
              key={creation.id}
              className="glass-card rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-500 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={creation.image} 
                  alt={`${creation.title} - ${creation.description}`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(creation.status)}`}>
                  {creation.status}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {creation.title}
                  </h3>
                  <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {creation.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {creation.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {creation.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button size="sm" className="btn-hero flex-1 text-xs">
                    <Play className="w-3 h-3 mr-2" />
                    View Demo
                  </Button>
                  <Button size="sm" variant="outline" className="btn-outline-glow text-xs">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Tool Section (for easy content management) */}
        <div className="glass-card p-8 rounded-2xl text-center">
          <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-4">Have a Custom Project in Mind?</h3>
          <p className="text-muted-foreground mb-6">
            We specialize in building custom AI automation solutions tailored to your specific needs. 
            Let's discuss how we can help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-hero">
              <Plus className="w-4 h-4 mr-2" />
              Request Custom Solution
            </Button>
            <Button variant="outline" className="btn-outline-glow">
              <Code className="w-4 h-4 mr-2" />
              View Source Code
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Creations;