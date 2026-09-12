import { Mail, MessageCircle, Twitter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className || "w-5 h-5 text-white"} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="glass-card mt-20 rounded-none border-b-0 border-x-0">
      <div className="container mx-auto px-4 py-16 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/neubofylogo.png"
                alt="Neubofy Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <h3 className="text-2xl font-bold text-gradient-electric">Neubofy™</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Neubofy is a technology department for founders and businesses. We orchestrate independent technology specialists, coordinate delivery, and help businesses build the right technology without building an internal technology department.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">Pages</h3>
            <div className="space-y-3">
              <Link href="/" className="block text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link href="/developers" className="block text-muted-foreground hover:text-primary transition-colors">Partners</Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">Portals</h3>
            <div className="space-y-3">
              <Link href="/consultation" className="block text-muted-foreground hover:text-primary transition-colors">
                <div className="font-medium">Consultation</div>
                <div className="text-xs opacity-75">Book a Consultation</div>
              </Link>
              <a href="https://neubofy.zohodesk.in/portal" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-primary transition-colors">Help Desk</a>
              <a href="https://neubofy.zohorecruit.in/" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-primary transition-colors">Career</a>
              <a href="https://books.zohosecure.in/portal/neubofy" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-primary transition-colors">Customer Portal</a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-foreground">Contact</h3>
            <div className="space-y-4">
              <a href="mailto:support@neubofy.in" className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </span>
                <span className="transform group-hover:translate-x-1 transition-transform">Support Email</span>
              </a>
              <a href="https://t.me/neubofy" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-muted-foreground hover:text-[#0088cc] transition-all duration-300">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0088cc]/10 group-hover:bg-[#0088cc]/20 transition-colors">
                  <MessageCircle className="w-4 h-4 text-[#0088cc]" />
                </span>
                <span className="transform group-hover:translate-x-1 transition-transform">Telegram @neubofy</span>
              </a>
              <a href="https://twitter.com/neubofy" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Twitter className="w-4 h-4 text-primary" />
                </span>
                <span className="transform group-hover:translate-x-1 transition-transform">Twitter @neubofy</span>
              </a>
              <a href="https://instagram.com/neubofy" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-muted-foreground hover:text-[#E1306C] transition-all duration-300">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E1306C]/10 group-hover:bg-[#E1306C]/20 transition-colors">
                  <svg className="w-4 h-4 text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </span>
                <span className="transform group-hover:translate-x-1 transition-transform">Instagram @neubofy</span>
              </a>
              <a href="https://linkedin.com/company/neubofy" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-muted-foreground hover:text-[#0077b5] transition-all duration-300">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0077b5]/10 group-hover:bg-[#0077b5]/20 transition-colors">
                  <LinkedinIcon className="w-4 h-4 text-[#0077b5]" />
                </span>
                <span className="transform group-hover:translate-x-1 transition-transform">LinkedIn @neubofy</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Neubofy™. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;