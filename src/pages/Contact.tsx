import { useState } from "react";
import { Mail, MessageCircle, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { useToast } from "@/hooks/use-toast";
import GoToTop from "@/components/GoToTop";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    message: "",
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Your GAS Web App URL
  const gasWebAppUrl = "https://script.google.com/macros/s/AKfycbxY3I9v5kT1uzINBt9jvrgUnByyHq-DMoxvAftUf2k83M_OlYtD6WFj3aUKtYsmvu-b/exec";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to be contacted about Neubofy's solutions.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send data to GAS
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('whatsapp', formData.whatsapp);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('timestamp', new Date().toISOString());

      const response = await fetch(gasWebAppUrl, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Message Sent Successfully!",
          description: "Your request has been logged. We'll get back to you within 24 hours.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('GAS Error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive"
      });
    }

    setIsSubmitting(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", whatsapp: "", message: "", consent: false });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      
      <div className="container mx-auto px-4 py-32">
        <Reveal>
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 gradient-text">
            Let's Build Something Amazing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to transform your productivity with custom AI automation? 
            Let's discuss how Neubofy can help you achieve your goals.
          </p>
        </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Reveal>
          <div className="glass-card p-8 rounded-3xl shadow-elevated">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-semibold mb-2">
                    WhatsApp User ID
                  </label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="@pawanwashudev"
                    className="bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Tell us about your project, goals, or any questions you have..."
                    required
                    rows={5}
                    className="bg-background/50 border-primary/20 focus:border-primary resize-none"
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => handleInputChange("consent", checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                    I agree to be contacted about Neubofy's solutions and understand that my information will be handled according to the privacy policy.
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.message || !formData.consent}
                  className="btn-hero w-full text-lg py-4 group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-12 animate-scale-in">
                <div className="w-20 h-20 bg-gradient-button rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow">
                  <CheckCircle className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-4">Message Sent Successfully!</h3>
                <p className="text-muted-foreground">
                  Your request has been logged in our system. We'll get back to you within 24 hours.
                </p>
              </div>
            )}
          </div>
          </Reveal>

          {/* Contact Information */}
          <Reveal>
          <div className="space-y-8">
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold gradient-text mb-6">Get In Touch Directly</h3>
              
              <div className="space-y-6">
                <a 
                  href="mailto:support@neubofy.in"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 transition-colors group"
                >
                  <div className="w-12 h-12 bg-gradient-button rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">Email Us</div>
                    <div className="text-muted-foreground">support@neubofy.in</div>
                  </div>
                </a>

                <a
                  href="mailto:founder@neubofy.in"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 transition-colors group"
                >
                  <div className="w-12 h-12 bg-gradient-button rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">Email the Founder</div>
                    <div className="text-muted-foreground">founder@neubofy.in</div>
                  </div>
                </a>

                <a 
                  href="https://wa.me/pawanwashudev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/10 transition-colors group"
                >
                  <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-muted-foreground">Chat with us directly</div>
                  </div>
                </a>

                <a 
                  href="https://whatsapp.com/channel/0029Vb6TEDNE50UlJ3DDpo1b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-green-500/10 transition-colors group"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">WhatsApp Channel</div>
                    <div className="text-muted-foreground">Follow our official channel</div>
                  </div>
                </a>

                <a
                  href="https://instagram.com/pawan_washudev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-pink-600/10 transition-colors group"
                >
                  <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold">Instagram</div>
                    <div className="text-muted-foreground">@pawan_washudev</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Data Management Info */}
            <div className="glass-card p-6 rounded-2xl">
              <h4 className="font-bold mb-4">Enterprise Data Protection</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Google Cloud Platform security infrastructure
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  TLS 1.3 encrypted data transmission
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Role-based access control (RBAC)
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  SOC 2 Type II certified systems
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Automated data lifecycle management
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Zero-knowledge architecture principles
                </li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-primary/20">
                <p className="text-xs text-muted-foreground">
                  Your data is processed in accordance with our comprehensive privacy policy and industry best practices for data protection.
                </p>
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </div>

      <Footer />
      <GoToTop />
    </div>
  );
};

export default Contact;