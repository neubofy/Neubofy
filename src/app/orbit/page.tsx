"use client";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Play, Code, Star, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Reveal from "@/components/Reveal";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ProductCard from "@/components/ProductCard";

const Orbit = () => {
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
    htmlPath?: string;
  };

  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        console.log('Loading product index...');
        const res = await fetch('/product_index.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to load product_index.json: ${res.status}`);
        const data = await res.json();
        console.log('Product index loaded:', data);
        
        const files = (data?.files as string[] | undefined) || [];
        if (!Array.isArray(files)) throw new Error('Invalid manifest format. Expected { files: [...] }');
        console.log('Files to load:', files);
        
        const detailPromises = files.map(async (entry) => {
          const fileName = entry;
          console.log(`Loading product file: ${fileName}`);
          try {
            const r = await fetch(`/metadata/product/${fileName}`, { cache: 'no-cache' });
            if (!r.ok) throw new Error(`Failed to load ${fileName}: ${r.status}`);
            const text = await r.text();
            try {
              const product = JSON.parse(text);
              console.log(`Successfully loaded ${fileName}:`, product);
              return product as CreationItem;
            } catch (parseError) {
              throw new Error(`Invalid JSON in ${fileName}: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
            }
          } catch (fetchError) {
            console.error(`Error with ${fileName}:`, fetchError);
            throw fetchError;
          }
        });
        
        const detailed = await Promise.all(detailPromises);
        console.log('All products loaded:', detailed);
        if (isMounted) setCreations(detailed);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error('Error loading products:', message);
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
              <div
                role="button"
                tabIndex={0}
                onClick={() => window.location.href = creation.htmlPath || `/product/${creation.slug}.html`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.location.href = creation.htmlPath || `/product/${creation.slug}.html`;
                  }
                }}
                className="text-left w-full glass-card rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-500 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
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
              </div>
            </Reveal>
          ))}
        </div>

        {/* Add New Project Section */}
        <Reveal>
          <div className="glass-card p-6 md:p-8 rounded-2xl text-center mt-12 md:mt-16">
            <Plus className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg md:text-xl font-bold mb-4">Have an amazing project?</h3>
            <p className="text-muted-foreground mb-6 text-sm md:text-base max-w-2xl mx-auto">
              We want to make adding new projects as easy as possible! Simply create an issue on our GitHub repository with your project details. Once cross-checked and approved by our team, your project will be featured live on Neubofy Orbit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button disabled className="btn-hero w-full sm:w-auto opacity-50 cursor-not-allowed">
                <Plus className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </div>
        </Reveal>
      </div>

    </div>
  );
};

export default Orbit;
