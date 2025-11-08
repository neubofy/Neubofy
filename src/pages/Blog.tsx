import { useMemo, useState, useEffect } from "react";
import { Calendar, User, ArrowRight, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import GoToTop from "@/components/GoToTop";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";

interface BlogPost {
  id?: number;
  slug?: string;
  name?: string;
  title?: string;
  shortDescription?: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  date?: string;
  readTime?: string;
  tags?: string[];
  thumbnailUrl?: string;
  thumbnail?: string;
  featured?: boolean;
  category?: string;
  content?: Array<{
    type: "paragraph" | "image";
    text?: string;
    src?: string;
    caption?: string;
  }>;
}

// Thin auto-sliding banner component for featured posts
const FeaturedBannerSlider = ({ posts, navigate }: { posts: BlogPost[]; navigate: any }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!posts || posts.length === 0) return;
    if (isPaused) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % posts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [posts, isPaused]);

  useEffect(() => {
    // ensure index stays valid if posts change
    if (index >= posts.length) setIndex(0);
  }, [posts, index]);

  if (!posts || posts.length === 0) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setIndex((i) => (i - 1 + posts.length) % posts.length);
    } else if (e.key === 'ArrowRight') {
      setIndex((i) => (i + 1) % posts.length);
    }
  };

  return (
    <div
      className="w-full h-20 md:h-24 relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured posts"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full h-full overflow-hidden">
        <div
          className="flex h-full"
          style={{ width: `${posts.length * 100}%`, transform: `translateX(-${index * (100 / posts.length)}%)`, transition: 'transform 700ms ease-in-out' }}
        >
          {posts.map((p, i) => (
            <div
              key={p.id ?? i}
              className="w-full flex-shrink-0 flex items-center justify-between px-4 md:px-8"
              aria-hidden={i !== index}
            >
              <div className="flex-1 pr-4 md:pr-8">
                <div className="text-xs text-muted-foreground mb-0">Featured</div>
                <div className="font-semibold text-sm md:text-lg line-clamp-1">{p.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</div>
              </div>

              <div className="flex items-center">
                <Button variant="outline" onClick={() => navigate(`/blog/${p.slug}`)} aria-label={`Visit ${p.title}`}>
                  Visit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* indicators */}
      <div className="absolute right-3 bottom-2 flex gap-2">
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to featured ${i + 1}`}
            aria-current={i === index}
            className={`w-2 h-2 rounded-full ${i === index ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  );
};

const Blog = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let mounted = true;

    const loadBlogPosts = async () => {
      try {
        // Get list of blog posts from index
        const indexResponse = await fetch('/blog_index.json');
        if (!indexResponse.ok) {
          throw new Error('Failed to load blog index');
        }
        const { blogPosts: blogFiles } = await indexResponse.json();

        const posts = await Promise.all(
          blogFiles.map(async (fileName) => {
            if (!fileName) return null;
            try {
              const response = await fetch(`/blog/${fileName}`);
              if (!response.ok) return null;
              const post = await response.json();
              return {
                id: post.id ?? Date.now(),
                slug: post.slug ?? fileName.replace('.json', ''),
                title: post.name ?? post.title ?? 'Untitled',
                excerpt: post.shortDescription ?? post.excerpt ?? '',
                author: post.author ?? 'Neubofy Team',
                date: post.publishedAt ?? post.date ?? new Date().toISOString(),
                readTime: post.readTime ?? '5 min read',
                tags: post.tags ?? [],
                thumbnail: post.thumbnailUrl ?? post.thumbnail ?? '/placeholder.svg',
                featured: !!post.featured,
                category: post.category ?? 'Uncategorized',
                content: post.content ?? []
              };
            } catch (e) {
              console.error(`Error loading blog post ${fileName}:`, e);
              return null;
            }
          })
        );

        if (!mounted) return;

        const validPosts = posts
          .filter((post): post is NonNullable<typeof post> => post !== null)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setBlogPosts(validPosts);
      } catch (e) {
        console.error('Error loading blog posts:', e);
        setBlogPosts([]);
      }
    };

    loadBlogPosts();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogPosts.map((p) => p.category).filter(Boolean)));
    return ["All", ...cats];
  }, [blogPosts]);

  const filteredPosts = selectedCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);

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

        {/* Featured posts - thin auto-sliding banner (no thumbnails) */}
        {blogPosts.some(p => p.featured) && (
          <Reveal>
            <div className="mb-8 md:mb-12">
              <div className="relative glass-card rounded-xl overflow-hidden shadow-elevated">
                {/* Slider viewport */}
                <div className="overflow-hidden">
                  <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-0%)` }}>
                    {/* We'll render items via JS-controlled translate (see useEffect below) */}
                  </div>
                </div>
                {/* Actual slider implemented below using React to control translate */}
                <FeaturedBannerSlider posts={blogPosts.filter(p => p.featured)} navigate={navigate} />
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
                    {post.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags && post.tags.length > 2 && (
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

        {/* Add New Post Section */}
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