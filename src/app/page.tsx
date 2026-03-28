'use client';

import { useState, Suspense, lazy, useSyncExternalStore } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Service } from '@/lib/store';

// Lazy load sections that are below the fold
const ServicesSection = lazy(() => import('@/components/sections/ServicesSection').then(m => ({ default: m.ServicesSection })));
const AboutSection = lazy(() => import('@/components/sections/AboutSection').then(m => ({ default: m.AboutSection })));
const DoctorsSection = lazy(() => import('@/components/sections/DoctorsSection').then(m => ({ default: m.DoctorsSection })));
const TestimonialsSection = lazy(() => import('@/components/sections/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const BookingSection = lazy(() => import('@/components/sections/BookingSection').then(m => ({ default: m.BookingSection })));
const ContactSection = lazy(() => import('@/components/sections/ContactSection').then(m => ({ default: m.ContactSection })));

// Loading skeleton for sections
function SectionSkeleton() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-pulse text-white/50">Loading...</div>
    </div>
  );
}

// Safe way to check if mounted (SSR-safe)
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  const handleBookService = (service: Service) => {
    setPreselectedService(service);
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C73E1D] via-[#8B2500] to-[#4A1200]">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero loads immediately */}
        <HeroSection />
        
        {/* Other sections load lazily */}
        <Suspense fallback={<SectionSkeleton />}>
          <ServicesSection onBookService={handleBookService} />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <AboutSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <DoctorsSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <BookingSection preselectedService={preselectedService} />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <ContactSection />
        </Suspense>
      </main>
      
      <Footer />

      <GoogleLoginButton onAdminClick={() => setShowAdminPanel(true)} />
      <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
    </div>
  );
}
