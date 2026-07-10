import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";

const BlogDetail = () => {
  const { slug } = useParams();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const resDetail = await fetch(`/blog/${slug}.html`, { cache: 'no-cache' });
        if (resDetail.ok) {
          const detail = await resDetail.text();
          if (isMounted) setHtmlContent(detail);
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

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !htmlContent) {
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
          <div
            className="w-full mx-auto mb-12"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </Reveal>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;
