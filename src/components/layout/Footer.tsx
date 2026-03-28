'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useSettings } from '@/lib/settings-store';

const footerLinks = {
  services: [
    { label: 'Dental Implants', href: '#services' },
    { label: 'Teeth Whitening', href: '#services' },
    { label: 'Dental Crowns', href: '#services' },
    { label: 'Invisalign', href: '#services' },
    { label: 'Root Canal', href: '#services' },
  ],
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Our Doctors', href: '#doctors' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ],
  support: [
    { label: 'FAQ', href: '#faq' },
    { label: 'Book Appointment', href: '#booking' },
    { label: 'Emergency', href: 'tel:+34932123456' },
  ],
};

export function Footer() {
  const { settings, fetchSettings } = useSettings();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const socialLinks = [
    { icon: Facebook, href: settings.facebookUrl || '#', label: 'Facebook', enabled: !!settings.facebookUrl },
    { icon: Instagram, href: settings.instagramUrl || '#', label: 'Instagram', enabled: !!settings.instagramUrl },
    { icon: Twitter, href: settings.twitterUrl || '#', label: 'Twitter', enabled: !!settings.twitterUrl },
    { icon: Linkedin, href: settings.linkedinUrl || '#', label: 'LinkedIn', enabled: !!settings.linkedinUrl },
  ].filter((s) => s.enabled);

  const getWorkingDaysText = () => {
    const days = settings.workingDays || [];
    if (!Array.isArray(days) || days.length === 0) return 'Mon-Fri';
    if (days.length === 5 && days.includes('Monday') && days.includes('Friday')) {
      return 'Mon-Fri';
    }
    return days.slice(0, 3).join(', ') + (days.length > 3 ? '...' : '');
  };

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-black/20">
      {/* Gradient Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#FF8C42] to-transparent" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              {settings.clinicLogo ? (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                  <img 
                    src={settings.clinicLogo} 
                    alt={settings.clinicName} 
                    width={40} 
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C42] to-[#C73E1D] rounded-lg rotate-45 transform" />
                  <div className="absolute inset-1 bg-[#2D0A05] rounded-md rotate-45 transform" />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                    {settings.clinicName?.charAt(0) || 'D'}
                  </span>
                </div>
              )}
              <span className="text-xl font-semibold text-white">{settings.clinicName}</span>
            </Link>
            <p className="text-white/60 mb-6 max-w-sm">
              Premium dental care with state-of-the-art technology. Your smile is our priority.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white hover:border-[#FF8C42]/50 transition-all"
                    aria-label={social.label}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60">
                <MapPin size={18} className="flex-shrink-0 mt-0.5 text-[#FF8C42]" />
                <span>
                  {settings.clinicAddress}<br />
                  {settings.clinicCity}, {settings.clinicCountry} {settings.clinicPostalCode}
                </span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Phone size={18} className="flex-shrink-0 text-[#FF8C42]" />
                <a href={`tel:${settings.clinicPhone}`} className="hover:text-white transition-colors">
                  {settings.clinicPhone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Mail size={18} className="flex-shrink-0 text-[#FF8C42]" />
                <a href={`mailto:${settings.clinicEmail}`} className="hover:text-white transition-colors">
                  {settings.clinicEmail}
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Clock size={18} className="flex-shrink-0 text-[#FF8C42]" />
                <span>{getWorkingDaysText()}: {settings.openingTime} - {settings.closingTime}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} {settings.clinicName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-white/40 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-white/40 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
