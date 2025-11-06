import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Play, Code, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import GoToTop from "@/components/GoToTop";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link, useNavigate } from "react-router-dom";

const Creations = () => {
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
        const res = await fetch('/creations.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load creations.json: ${res.status}`);
        const data = await res.json();
        if (!data?.creations || !Array.isArray(data.creations)) {
          throw new Error('Invalid manifest format. Expected { creations: [...] }');
        }
        if (isMounted) setCreations(data.creations as CreationItem[]);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
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

  //

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
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <Reveal>
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 md:mb-6 gradient-text">
            Our Creations
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what Neubofy can build for you. Each solution is custom-crafted with privacy, 
            innovation, and your success in mind.
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
            Showing {filteredCreations.length} of {creations.length} creations
          </p>
        </div>
        </Reveal>

        {/* Creations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {filteredCreations.map((creation, index) => (
            <Reveal key={creation.slug} delay={index * 0.05}>
              <button
                onClick={() => navigate(`/creations/${creation.slug}`)}
                className="text-left glass-card rounded-2xl overflow-hidden border border-white/10 hover:shadow-elevated transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <AspectRatio ratio={4/5}>
                    <img
                      src={creation.thumbnailUrl}
                      alt={`${creation.name} - ${creation.shortDescription}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const t = e.currentTarget as HTMLImageElement;
                        if (t.src.includes('/placeholder.svg')) return;
                        t.src = '/placeholder.svg';
                      }}
                      loading="lazy"
                    />
                  </AspectRatio>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  {creation.status && (
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(creation.status)}`}>
                      {creation.status}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {creation.name}
                    </h3>
                    <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {creation.shortDescription}
                  </p>

                  {/* Tags */}
                  {creation.tags && creation.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {creation.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button size="sm" className="btn-hero flex-1 text-xs">
                      <Play className="w-3 h-3 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="btn-outline-glow text-xs">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {/* Add New Tool Section (for easy content management) */}
        <Reveal>
        <div className="glass-card p-8 rounded-2xl text-center">
          <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-4">Have a Custom Project in Mind?</h3>
          <p className="text-muted-foreground mb-6">
            We specialize in building custom AI automation solutions tailored to your needs.
            This isn't an ordinary contact form — you'll connect with us instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-hero" asChild>
              <Link to="/contact">
                <Plus className="w-4 h-4 mr-2" />
                Request Custom Solution
              </Link>
            </Button>
            <Button variant="outline" className="btn-outline-glow">
              <Code className="w-4 h-4 mr-2" />
              View Source Code
            </Button>
          </div>
        </div>
        </Reveal>
      </div>

      <Footer />
      <GoToTop />
    </div>
  );
};

export default Creations;