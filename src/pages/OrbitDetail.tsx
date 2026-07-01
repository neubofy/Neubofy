import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";

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
  mainUrl?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
};

const OrbitDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<CreationItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const autoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const resDetail = await fetch(`/product/${slug}.json`, { cache: 'no-cache' });
        if (resDetail.ok) {
          const detail = await resDetail.json();
          if (isMounted) setItem(detail as CreationItem);
          return;
        }
        throw new Error('Not found');
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
  }, [slug]);

  const publishedDate = useMemo(() => {
    if (!item?.publishedAt) return '';
    const d = new Date(item.publishedAt);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }, [item?.publishedAt]);

  useEffect(() => {
    if (!carouselApi) return;
    const play = () => carouselApi.scrollNext();
    autoTimerRef.current = window.setInterval(play, 3000);
    return () => {
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
    };
  }, [carouselApi]);

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen animated-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Solution not found</h1>
          <p className="text-muted-foreground mb-6">The requested solution does not exist or failed to load.</p>
          <Button asChild>
            <Link to="/orbit">Back to Neubofy Orbit</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      <div className="container mx-auto px-4 py-32">
        <Reveal>
          <div className="max-w-4xl mx-auto mb-10">
            <Link to="/orbit" className="text-sm text-primary hover:underline">← Back to Neubofy Orbit</Link>
          </div>
        </Reveal>

        <Reveal>
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 gradient-text">{item.name}</h1>
            <p className="text-muted-foreground text-lg">{item.shortDescription}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              {item.category && <Badge variant="secondary">{item.category}</Badge>}
              {item.status && <Badge>{item.status}</Badge>}
              {publishedDate && <span className="text-muted-foreground">Published {publishedDate}</span>}
            </div>
            {(item.mainUrl || item.demoUrl || item.caseStudyUrl) && (
              <div className="mt-6">
                <Button asChild className="btn-hero">
                  <a href={(item.mainUrl || item.demoUrl || item.caseStudyUrl) as string} target="_blank" rel="noopener noreferrer">Visit Solution</a>
                </Button>
              </div>
            )}
          </div>
        </Reveal>

        {/* Gallery */}
        <Reveal>
          <div className="max-w-5xl mx-auto mb-12">
            <Carousel className="w-full" opts={{ loop: true, align: "start" }} setApi={setCarouselApi}>
              <CarouselContent>
                {item.imageUrls
                  .filter((u) => typeof u === 'string' && u.trim().length > 0)
                  .slice(0, 10)
                  .map((url, idx) => (
                    <CarouselItem key={idx} className="basis-11/12 md:basis-1/2 lg:basis-1/3">
                      <div className="rounded-xl overflow-hidden glass-card cursor-pointer h-[400px]" onClick={() => carouselApi?.scrollTo(idx)}>
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`${item.name} image ${idx+1}`}
                            className="w-full h-full object-contain bg-black/5"
                            loading="lazy"
                            style={{ objectPosition: 'center center' }}
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (!img.src.includes('/placeholder.svg')) {
                                img.src = '/placeholder.svg';
                                console.log('Image error, switched to placeholder:', url);
                              }
                            }}
                          />
                      </div>
                    </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </Reveal>

        {/* Detail description */}
        <Reveal>
          <div className="max-w-3xl mx-auto glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-6">About this solution</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.detailDescription}
              </ReactMarkdown>
            </div>
          </div>
        </Reveal>
      </div>
      <Footer />
    </div>
  );
};

export default OrbitDetail;