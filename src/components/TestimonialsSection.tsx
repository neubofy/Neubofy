"use client";
import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      company: "MIT",
      content: "Neubofy's AI mentor completely transformed my study habits. The personalized guidance helped me ace my algorithms course and land my dream internship!",
      rating: 5,
      image: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Small Business Owner",
      company: "TechStart Solutions",
      content: "The business automation tools saved me 20+ hours per week. Now I can focus on growing my business instead of managing repetitive tasks.",
      rating: 5,
      image: "MR"
    },
    {
      name: "Dr. Emily Watson",
      role: "Research Director",
      company: "Innovation Labs",
      content: "The AI content tools are incredible. They help our team generate research summaries and technical documentation with unprecedented speed and accuracy.",
      rating: 5,
      image: "EW"
    },
    {
      name: "Alex Kim",
      role: "High School Student",
      company: "Westfield Academy",
      content: "As a student like the founder, I love how Neubofy understands our unique challenges. The AI mentor is like having a brilliant tutor available 24/7!",
      rating: 5,
      image: "AK"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
              <span className="gradient-text">What Our Users Say</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real stories from students, professionals, and businesses who've transformed their productivity
            </p>
          </div>
        </Reveal>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <Reveal>
          <div className="glass-card p-8 md:p-12 rounded-3xl shadow-elevated overflow-hidden">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === currentTestimonial
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 absolute inset-0 translate-x-full"
                  }`}
                >
                  <div className="text-center">
                    {/* Stars */}
                    <div className="flex justify-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-primary text-primary" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-button flex items-center justify-center text-xl font-bold text-primary-foreground">
                        {testimonial.image}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-lg">{testimonial.name}</div>
                        <div className="text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full border-primary/20 hover:bg-primary/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentTestimonial
                        ? "bg-primary scale-125"
                        : "bg-primary/30 hover:bg-primary/50"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full border-primary/20 hover:bg-primary/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;