'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  avatar: string | null;
  treatment: string | null;
}

const defaultAvatars = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then(setTestimonials)
      .catch(console.error);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Auto-slide
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, nextSlide]);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-transparent" />
      
      {/* Decorative Quote */}
      <Quote className="absolute top-20 left-10 w-32 h-32 text-white/5" />
      <Quote className="absolute bottom-20 right-10 w-32 h-32 text-white/5 rotate-180" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full glass text-sm text-[#FF8C42] mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">
            What Our <span className="gradient-text font-semibold">Patients Say</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Real stories from real patients. See how we've transformed smiles and lives.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="card-glass p-8 md:p-12 text-center"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < testimonials[activeIndex].rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-white font-light mb-8 leading-relaxed">
                  &ldquo;{testimonials[activeIndex].comment}&rdquo;
                </blockquote>

                {/* Patient Info */}
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={defaultAvatars[activeIndex % defaultAvatars.length]}
                    alt={testimonials[activeIndex].patientName}
                    className="w-14 h-14 rounded-full border-2 border-[#FF8C42]/50"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-white">
                      {testimonials[activeIndex].patientName}
                    </div>
                    <div className="text-sm text-white/60">
                      {testimonials[activeIndex].treatment}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white hover:border-[#FF8C42]/50 transition-all"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeIndex
                        ? 'w-8 bg-[#FF8C42]'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full glass flex items-center justify-center text-white/60 hover:text-white hover:border-[#FF8C42]/50 transition-all"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8"
        >
          {[
            { value: '4.9', label: 'Google Rating' },
            { value: '500+', label: '5-Star Reviews' },
            { value: 'Top Rated', label: 'Healthgrades' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                <Star className="w-6 h-6 text-[#FF8C42] fill-[#FF8C42]" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{badge.value}</div>
                <div className="text-sm text-white/60">{badge.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
