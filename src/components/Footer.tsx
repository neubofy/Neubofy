import { Link } from "react-router-dom";
import { Mail, MessageCircle, Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 border-t border-border/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-3xl font-display font-bold gradient-text">
              Neubofy
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              AI automation for every ambition. Transforming productivity through 
              secure, innovative solutions.
            </p>
            <div className="flex space-x-4">
              <a 
                href="mailto:neubofie@gmail.com" 
                className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:shadow-glow transition-all group"
              >
                <Mail className="w-5 h-5 group-hover:text-primary transition-colors" />
              </a>
              <a 
                href="https://wa.me/919287457489" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:shadow-glow transition-all group"
              >
                <MessageCircle className="w-5 h-5 group-hover:text-primary transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:shadow-glow transition-all group"
              >
                <Twitter className="w-5 h-5 group-hover:text-primary transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:shadow-glow transition-all group"
              >
                <Linkedin className="w-5 h-5 group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 gradient-text">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/creations" className="text-muted-foreground hover:text-foreground transition-colors">
                  Our Creations
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-6 gradient-text">Services</h3>
            <ul className="space-y-3">
              <li className="text-muted-foreground">AI Automation</li>
              <li className="text-muted-foreground">Student Mentorship</li>
              <li className="text-muted-foreground">Business Solutions</li>
              <li className="text-muted-foreground">Custom Development</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6 gradient-text">Get in Touch</h3>
            <div className="space-y-3">
              <a 
                href="mailto:neubofie@gmail.com" 
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                neubofie@gmail.com
              </a>
              <a 
                href="https://wa.me/919287457489" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                +91 9287457489
              </a>
            </div>
            <div className="mt-6">
              <Link to="/contact">
                <button className="btn-outline-glow w-full">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Neubofy. All rights reserved. Built with ❤️ by a passionate student.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;