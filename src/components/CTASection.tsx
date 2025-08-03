import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-secondary/20 rounded-full blur-2xl"></div>
          </div>

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
                href="https://wa.me/919287457489" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-medium text-secondary hover:text-secondary-glow transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp: +91 9287457489
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
      </div>
    </section>
  );
};

export default CTASection;