"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Developers", path: "/developers" },
    { name: "Support & Community", path: "https://neubofy.zohodesk.in/portal" }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "glass-card border-b rounded-none backdrop-blur-xl bg-background/80" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link 
            href="/" 
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300"
          >
            <Image
              src="/neubofylogo.png"
              alt="Neubofy Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-2xl font-bold text-foreground">
              Neubofy™
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              item.path.startsWith("http") ? (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium transition-colors duration-300 relative group text-muted-foreground hover:text-foreground"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 w-0 group-hover:w-full"></span>
                </a>
              ) : (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`font-medium transition-colors duration-300 relative group ${
                    pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${pathname === item.path ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                </Link>
              )
            ))}
            <Link href="/order">
              <Button className="btn-electric rounded-full px-6">
                Order App
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 glass-card border-x-0 rounded-none absolute top-full left-0 w-full animate-fade-in-up">
            <div className="flex flex-col space-y-2 px-4">
              {navItems.map((item) => (
                item.path.startsWith("http") ? (
                  <a
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 font-medium transition-all duration-300 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-3 font-medium transition-all duration-300 rounded-lg ${
                      pathname === item.path
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              <div className="pt-4 pb-2">
                <Link href="/order" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full btn-electric">
                    Order App
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
