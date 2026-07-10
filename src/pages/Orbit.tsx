import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Play, Code, Star, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import GoToTop from "@/components/GoToTop";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";

const Orbit = () => {
  const navigate = useNavigate();

  type CreationItem = {
    slug: string;
    name: string;
    shortDescription: string;
    detailDescription: string;
    thumbnailUrl: string;
    imageUrls: string[];
    publishedAt: string;
    status?: string;
    category?: string;
    tags?: string[];
    features?: string[];
    demoUrl?: string;
    caseStudyUrl?: string;
  };

  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        console.log('Loading project index...');
        const res = await fetch('/project.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load project.json: ${res.status}`);
        const data = await res.json();
        console.log('Project index loaded:', data);
        
        if (!Array.isArray(data)) throw new Error('Invalid manifest format. Expected an array.');
        
        if (isMounted) setCreations(data as CreationItem[]);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error('Error loading projects:', message);
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);
  
  const uniqueCategories = useMemo(() => {
    const cats = creations
      .map(c => c.category)
      .filter((c): c is string => Boolean(c));
    return ["All", ...Array.from(new Set(cats))];
  }, [creations]);
  
  const filteredCreations = useMemo(() => {
    return selectedCategory === "All"
      ? creations
      : creations.filter(creation => creation.category === selectedCategory);
  }, [creations, selectedCategory]);

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <Reveal>
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 md:mb-6 gradient-text">
            Neubofy Orbit
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our curated collection of AI solutions and automation tools. Each solution is 
            custom-crafted with privacy, innovation, and your success in mind.
          </p>
        </div>
        </Reveal>

        {/* Category Filter */}
        <Reveal>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8 md:mb-10">
          {uniqueCategories.map((category) => (
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
        </Reveal>

        {/* Results Count */}
        <Reveal>
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCreations.length} of {creations.length} solutions
          </p>
        </div>
        </Reveal>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {filteredCreations.map((creation, index) => (
            <Reveal key={creation.slug} delay={index * 0.05}>
              <button
                onClick={() => navigate(`/orbit/${creation.slug}`)}
                className="text-left w-full glass-card rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-500 group"
              >
                <div className="relative">
                  <div className="h-[300px] bg-black/5 rounded-t-2xl">
                    <img
                      src={creation.thumbnailUrl || "/placeholder.svg"}
                      alt={creation.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      style={{ objectPosition: 'center center' }}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (!img.src.includes('/placeholder.svg')) {
                          img.src = '/placeholder.svg';
                        }
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-2xl"></div>
                  
                  {creation.category && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary">{creation.category}</Badge>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {creation.name}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {creation.shortDescription}
                  </p>

                  {creation.tags && creation.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {creation.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-auto">
                    <Button variant="outline" className="group">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

      </div>

      <Footer />
      <GoToTop />
    </div>
  );
};

export default Orbit;