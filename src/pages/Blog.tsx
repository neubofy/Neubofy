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

interface BlogContent {
  type: "paragraph" | "image";
  text?: string;
  src?: string;
  caption?: string;
}

interface BlogPost {
  id: number;
  slug: string;
  name?: string;
  title?: string;
  shortDescription?: string;
  excerpt?: string;
  author: string;
  publishedAt?: string;
  date: string;
  readTime: string;
  tags: string[];
  thumbnailUrl?: string;
  thumbnail: string;
  featured: boolean;
  category: string;
  content?: BlogContent[];
  htmlPath?: string;
}

// Featured posts grid component
const FeaturedPostsGrid = ({ posts, navigate }: { posts: BlogPost[]; navigate: any }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {posts.map((post, index) => (
        <button
          key={post.id ?? index}
          onClick={() => window.location.href = `/blog/${post.slug}.html`}
          className="w-full text-left glass-card rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-500 group focus:outline-none focus:ring-2 focus:ring-primary relative"
        >
          <div className="aspect-w-16 aspect-h-9 relative">
            <img
              src={post.thumbnail}
              alt={post.title ?? "Blog post thumbnail"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-white font-semibold">Featured</Badge>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.date ?? "").toLocaleDateString()}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {post.title ?? post.name ?? "Untitled"}
            </h3>

            <p className="text-muted-foreground mb-4 line-clamp-2">
              {post.excerpt ?? post.shortDescription ?? ""}
            </p>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {post.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <span className="inline-flex items-center text-primary group-hover:text-primary-glow">
                Read More
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </button>
      ))}
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
        const indexResponse = await fetch('/blog_index.json');
        if (!indexResponse.ok) {
          throw new Error('Failed to load blog index');
        }
        const data = await indexResponse.json();
        const blogFiles = data.blogPosts || [];

        const posts = await Promise.all(
          blogFiles.map(async (fileName: string) => {
            if (!fileName) return null;
            try {
              const response = await fetch(`/metadata/blog/${fileName}`);
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
              } as BlogPost;
            } catch (e) {
              console.error(`Error loading blog post ${fileName}:`, e);
              return null;
            }
          })
        );

        if (!mounted) return;

        const validPosts = posts
          .filter((post): post is BlogPost => post !== null)
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

  // Filter out featured posts from the main grid
  const nonFeaturedPosts = blogPosts.filter(post => !post.featured);

  const filteredPosts = selectedCategory === "All"
    ? nonFeaturedPosts
    : nonFeaturedPosts.filter(post => post.category === selectedCategory);

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

        {/* Featured Posts Grid */}
        {blogPosts.some(p => p.featured) && (
          <Reveal>
            <div className="mb-8 md:mb-12">
              <h2 className="text-2xl font-bold mb-6 gradient-text">Featured Articles</h2>
              <FeaturedPostsGrid posts={blogPosts.filter(p => p.featured)} navigate={navigate} />
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
                onClick={() => window.location.href = `/blog/${post.slug}.html`}
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