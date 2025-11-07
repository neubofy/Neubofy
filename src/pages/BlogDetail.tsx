import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; caption?: string };

type BlogItem = {
  slug: string;
  name: string;
  shortDescription?: string;
  detailDescription?: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
  content?: ContentBlock[];
  publishedAt?: string;
  tags?: string[];
  author?: string;
  readTime?: string;
  category?: string;
};

const BlogDetail = () => {
  const { slug } = useParams();

  const item = useMemo(() => {
    const modules = import.meta.glob('../content/blog/*.json', { eager: true }) as Record<string, any>;
    const values = Object.values(modules).map((m: any) => (m && m.default) || m) as BlogItem[];
    return values.find((b) => b.slug === slug) ?? null;
  }, [slug]);

  if (!item) {
    return (
      <div className="min-h-screen animated-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Blog not found</h1>
          <p className="text-muted-foreground mb-6">The requested blog post does not exist.</p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const publishedDate = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      <div className="container mx-auto px-4 py-24 md:py-32">
        <Reveal>
          <div className="max-w-4xl mx-auto mb-8">
            <Link to="/blog" className="text-sm text-primary hover:underline">← Back to Blog</Link>
          </div>
        </Reveal>

        <Reveal>
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-3xl md:text-6xl font-display font-bold mb-4 gradient-text">{item.name}</h1>
            <p className="text-muted-foreground text-base md:text-lg">{item.shortDescription}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {item.category && <Badge variant="secondary">{item.category}</Badge>}
              {item.author && <span className="text-muted-foreground">By {item.author}</span>}
              {publishedDate && <span className="text-muted-foreground">Published {publishedDate}</span>}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="max-w-4xl mx-auto mb-12">
              {/* Render ordered content blocks if provided (paragraphs and inline images) */}
              <div className="flex flex-col gap-6">
                {Array.isArray(item.content) && item.content.length > 0 ? (
                  item.content.map((block, idx) => {
                    if (block.type === "paragraph") {
                      return (
                        <div key={idx} className="glass-card p-5 md:p-6 rounded-xl">
                          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{block.text}</p>
                        </div>
                      );
                    }
                    if (block.type === "image") {
                      return (
                        <div key={idx} className="rounded-xl overflow-hidden glass-card">
                          <img src={block.src} alt={block.caption ?? `${item.name} image ${idx + 1}`} className="w-full h-auto object-contain" />
                          {block.caption && <div className="p-3 text-center text-sm text-muted-foreground">{block.caption}</div>}
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  /* fallback: show imageUrls if content blocks not provided */
                  (item.imageUrls || []).map((url, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden glass-card">
                      <img src={url} alt={`${item.name} ${idx+1}`} className="w-full h-auto object-contain" />
                    </div>
                  ))
                )}
              </div>
            </div>
        </Reveal>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;
