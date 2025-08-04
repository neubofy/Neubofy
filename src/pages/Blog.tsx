import { useState } from "react";
import { Calendar, User, ArrowRight, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoToTop from "@/components/GoToTop";

const Blog = () => {
  // This would typically come from a CMS or markdown files for easy updates
  const [blogPosts] = useState([
    {
      id: 1,
      title: "The Future of AI Automation: A Student's Perspective",
      excerpt: "Exploring how young innovators are reshaping the AI automation landscape with fresh perspectives and bold ideas that challenge traditional approaches.",
      author: "Neubofy Team",
      date: "2025-01-08",
      readTime: "5 min read",
      tags: ["AI", "Innovation", "Future"],
      thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop",
      featured: true,
      category: "Innovation"
    },
    {
      id: 2,
      title: "Building Privacy-First AI: Why It Matters",
      excerpt: "Deep dive into zero-knowledge architecture and why privacy should be the foundation of every AI system, not an afterthought.",
      author: "Neubofy Team",
      date: "2025-01-05",
      readTime: "7 min read",
      tags: ["Privacy", "Security", "AI"],
      thumbnail: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop",
      featured: false,
      category: "Technology"
    },
    {
      id: 3,
      title: "From Student to CEO: Lessons in AI Entrepreneurship",
      excerpt: "The journey of building an AI company while still in high school, challenges faced, and insights gained along the way.",
      author: "Neubofy Founder",
      date: "2025-01-03",
      readTime: "6 min read",
      tags: ["Entrepreneurship", "Student", "Journey"],
      thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop",
      featured: true,
      category: "Entrepreneurship"
    },
    {
      id: 4,
      title: "Custom AI Solutions vs. Off-the-Shelf: Making the Right Choice",
      excerpt: "Understanding when to choose custom AI automation solutions over generic tools, and how to evaluate your specific needs.",
      author: "Neubofy Team",
      date: "2025-01-01",
      readTime: "4 min read",
      tags: ["Business", "AI Solutions", "Strategy"],
      thumbnail: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=400&fit=crop",
      featured: false,
      category: "Business"
    },
    {
      id: 5,
      title: "The Student Advantage in AI Innovation",
      excerpt: "How being a student founder provides unique advantages in understanding user needs and building innovative solutions.",
      author: "Neubofy Team",
      date: "2024-12-28",
      readTime: "5 min read",
      tags: ["Student", "Innovation", "Advantage"],
      thumbnail: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=400&fit=crop",
      featured: false,
      category: "Innovation"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const categories = ["All", "Innovation", "Technology", "Entrepreneurship", "Business"];
  
  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      
      <div className="container mx-auto px-4 py-32">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 gradient-text">
            Innovation Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Latest thoughts on AI automation, innovation, and the future of technology 
            from our young founder's perspective.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="glass-card rounded-3xl overflow-hidden mb-16 shadow-elevated">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative">
                <img 
                  src={featuredPost.thumbnail} 
                  alt={featuredPost.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
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
                
                <h2 className="text-3xl font-bold mb-4 gradient-text">
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
                
                <Button className="btn-hero w-fit group">
                  Read Full Article
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        )}

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

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPosts.map((post, index) => (
            <article
              key={post.id}
              className="glass-card rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-500 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <img 
                  src={post.thumbnail} 
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
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
                
                <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary-glow group">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Add New Post Section (for content management) */}
        <div className="glass-card p-8 rounded-2xl text-center">
          <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-4">Want to Contribute?</h3>
          <p className="text-muted-foreground mb-6">
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
      </div>

      <Footer />
      <GoToTop />
    </div>
  );
};

export default Blog;