'use client';

import { useRef, useEffect, useState, memo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Star, Users, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { icon: Users, value: '5000+', label: 'Happy Patients' },
  { icon: Award, value: '15+', label: 'Years Experience' },
  { icon: Star, value: '98%', label: 'Success Rate' },
  { icon: Clock, value: '24/7', label: 'Support' },
];

// Reduced particles for better performance
const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 2,
}));

// Safe way to check if mounted (SSR-safe)
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export const HeroSection = memo(function HeroSection() {
  const toothRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking && toothRef.current) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (scrollY < 1000 && toothRef.current) {
            toothRef.current.style.transform = `rotate(${scrollY * 0.05}deg)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isVisible = mounted;

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Simplified Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FF8C42]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#C73E1D]/20 rounded-full blur-3xl" />
        
        {/* Reduced floating particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/80">Now Accepting New Patients</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight">
              Modern Care for a{' '}
              <span className="gradient-text font-semibold">Perfect Smile</span>
            </h1>

            <p className="text-lg text-white/70 mb-8 max-w-lg">
              Experience world-class dental services with cutting-edge technology. 
              Our expert team delivers personalized care for your healthiest, most confident smile.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="#booking">
                <Button className="btn-primary glow text-lg px-8 py-6 h-auto">
                  Book Consultation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" className="btn-secondary text-lg px-8 py-6 h-auto">
                <Play className="mr-2 w-5 h-5" />
                Watch Video
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-xl glass hover-lift cursor-default"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-[#FF8C42]" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tooth Visual - Simplified */}
          <div 
            ref={toothRef}
            className={`relative hidden lg:block transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          >
            <div className="relative w-96 h-96 mx-auto animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C42]/30 to-[#C73E1D]/30 rounded-full blur-3xl" />
              
              <svg
                viewBox="0 0 200 300"
                className="w-full h-full drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 40px rgba(255, 140, 66, 0.5))' }}
              >
                <defs>
                  <linearGradient id="toothGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF8F0" />
                    <stop offset="50%" stopColor="#FFE4D6" />
                    <stop offset="100%" stopColor="#FFD0B8" />
                  </linearGradient>
                </defs>
                
                <path
                  d="M100 10 C130 10 160 40 160 80 C160 120 150 150 140 180 C130 210 120 250 110 280 C105 290 95 290 90 280 C80 250 70 210 60 180 C50 150 40 120 40 80 C40 40 70 10 100 10 Z"
                  fill="url(#toothGradient)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                />
                
                <ellipse cx="80" cy="60" rx="20" ry="30" fill="rgba(255,255,255,0.4)" />
                
                <path d="M70 180 Q75 220 85 260" stroke="rgba(199, 62, 29, 0.2)" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M100 190 Q100 230 100 280" stroke="rgba(199, 62, 29, 0.2)" strokeWidth="10" fill="none" strokeLinecap="round" />
                <path d="M130 180 Q125 220 115 260" stroke="rgba(199, 62, 29, 0.2)" strokeWidth="8" fill="none" strokeLinecap="round" />
              </svg>

              <div className="absolute -top-4 -right-4 w-20 h-20 glass rounded-xl flex items-center justify-center animate-bounce">
                <span className="text-3xl">🦷</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
});
