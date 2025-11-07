import { useMemo, useState } from "react";
import { Calendar, User, ArrowRight, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import GoToTop from "@/components/GoToTop";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";

const Blog = () => {
  // Load blog JSON files from src/content/blog/*.json (add new files here)
  // Vite's import.meta.glob with eager:true will bundle these at build time.
  const navigate = useNavigate();
  const blogPosts = useMemo(() => {
    const modules = import.meta.glob('../content/blog/*.json', { eager: true }) as Record<string, any>;
    const values = Object.values(modules).map((m: any) => (m && m.default) || m);
    // normalize some fields and sort by publishedAt desc
    return values
      .map((p: any, i: number) => ({
        id: p.id ?? i + 1,
        slug: p.slug ?? p.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: p.name ?? p.title ?? 'Untitled',
        excerpt: p.shortDescription ?? p.excerpt ?? '',
        author: p.author ?? 'Neubofy Team',
        date: p.publishedAt ?? p.date ?? new Date().toISOString(),
        readTime: p.readTime ?? '5 min read',
        tags: p.tags ?? [],
        thumbnail: p.thumbnailUrl ?? p.thumbnail ?? '/placeholder.svg',
        featured: !!p.featured,
        category: p.category ?? 'Uncategorized',
        raw: p
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogPosts.map((p) => p.category).filter(Boolean)));
    return ["All", ...cats];
  }, [blogPosts]);
  
  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 md:py-32">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-7xl font-display font-bold mb-4 md:mb-6 gradient-text">
              Innovation Insights
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Latest thoughts on AI automation, innovation, and the future of technology 
              from our young founder's perspective.
            </p>
          </div>
        </Reveal>

        {/* Featured Post */}
        {featuredPost && (
          <Reveal>
          <div className="glass-card rounded-2xl md:rounded-3xl overflow-hidden mb-12 md:mb-16 shadow-elevated">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative">
                <AspectRatio ratio={4/5}>
                  <img
                    src={featuredPost.thumbnail}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                <div className="absolute top-3 left-3 md:top-4 md:left-4">
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                </div>
              </div>
              <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredPost.date).toLocaleDateString()}
                  </div>
                  <span>{featuredPost.readTime}</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-4 gradient-text">
                  {featuredPost.title}
                </h2>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredPost.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button className="btn-hero w-fit group" onClick={() => navigate(`/blog/${featuredPost.slug}`)}>
                  Read Full Article
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
          </Reveal>
        )}

        {/* Category Filter */}
        <Reveal>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`${selectedCategory === category 
                ? "btn-hero" 
                : "btn-outline-glow"} text-sm md:text-base`}
            >
              {category}
            </Button>
          ))}
        </div>
        </Reveal>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {filteredPosts.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.05}>
            <button
              type="button"
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="w-full text-left glass-card rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-500 group focus:outline-none focus:ring-2 focus:ring-primary"
              tabIndex={0}
            >
              <div className="relative">
                <AspectRatio ratio={4/5}>
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <span>{post.readTime}</span>
                </div>
                
                <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 2}
                    </Badge>
                  )}
                </div>
                
                <span className="inline-flex items-center font-medium text-primary group-hover:text-primary-glow text-sm">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>
            </Reveal>
          ))}
        </div>

        {/* Add New Post Section (for content management) */}
        <Reveal>
        <div className="glass-card p-6 md:p-8 rounded-2xl text-center">
          <Plus className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg md:text-xl font-bold mb-4">Want to Contribute?</h3>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            We welcome guest posts and insights from fellow innovators, students, and AI enthusiasts. 
            Share your story and help inspire the next generation of builders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-hero">
              <Plus className="w-4 h-4 mr-2" />
              Submit Guest Post
            </Button>
            <Button variant="outline" className="btn-outline-glow">
              Contact Editorial Team
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

export default Blog;