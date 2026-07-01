import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";

const CTASection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
          <Reveal>
          <div className="relative">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-secondary/20 rounded-full blur-2xl"></div>
          </div>
          </div>
          </Reveal>

          <div className="glass-card p-12 md:p-16 rounded-3xl shadow-elevated text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Ready to <span className="gradient-text">Automate</span>
              <br />
              Your Success?
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Join thousands of students, professionals, and businesses who've already transformed 
              their productivity with Neubofy's AI automation solutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/contact">
                <Button className="btn-hero text-lg px-8 py-4 group">
                  <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <a 
                href="https://wa.me/pawanwashudev"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-medium text-secondary hover:text-secondary-glow transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>
              <a
                href="https://instagram.com/pawan_washudev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Follow on Instagram
              </a>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/20">
              <div className="text-center">
                <div className="text-lg font-bold gradient-text mb-1">Free Consultation</div>
                <div className="text-sm text-muted-foreground">No commitment required</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold gradient-text mb-1">Custom Solutions</div>
                <div className="text-sm text-muted-foreground">Tailored to your needs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold gradient-text mb-1">Privacy Guaranteed</div>
                <div className="text-sm text-muted-foreground">Your data stays secure</div>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};

export default CTASection;