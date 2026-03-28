'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Clock, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#doctors', label: 'Doctors' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#contact', label: 'Contact' },
];

interface Settings {
  clinicName: string;
  clinicLogo: string;
  clinicPhone: string;
  clinicAddress: string;
  clinicCity: string;
  openingTime: string;
  closingTime: string;
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const clinicName = settings?.clinicName || 'Dentix Lab';
  const clinicLogo = settings?.clinicLogo || '';
  const clinicPhone = settings?.clinicPhone || '+34 932 123 456';
  const clinicCity = settings?.clinicCity || 'Barcelona, Spain';
  const openingTime = settings?.openingTime || '09:00';
  const closingTime = settings?.closingTime || '18:00';

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-strong py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-[#FF8C42] animate-spin" />
                </div>
              ) : clinicLogo ? (
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                    <img 
                      src={clinicLogo} 
                      alt={clinicName} 
                      width={40} 
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xl font-semibold text-white">
                    {clinicName}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C42] to-[#C73E1D] rounded-lg rotate-45 transform" />
                    <div className="absolute inset-1 bg-[#2D0A05] rounded-md rotate-45 transform" />
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                      {clinicName?.charAt(0) || 'D'}
                    </span>
                  </div>
                  <span className="text-xl font-semibold text-white">
                    {clinicName}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-white/80 hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#FF8C42] transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="#booking">
                <Button className="btn-primary glow">
                  Book Appointment
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 h-full w-80 glass-strong p-6 pt-20"
            >
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white/80 hover:text-white py-2 text-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="#booking" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="btn-primary w-full mt-4">
                    Book Appointment
                  </Button>
                </Link>
              </nav>

              {/* Contact Info */}
              <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-white/70">
                  <Phone size={18} />
                  <span>{clinicPhone}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Clock size={18} />
                  <span>Mon-Fri: {formatTime(openingTime)}-{formatTime(closingTime)}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin size={18} />
                  <span>{clinicCity}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
