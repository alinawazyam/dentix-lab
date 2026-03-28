'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Service } from '@/lib/store';
import { useSettings } from '@/lib/settings-store';

const categoryFilters = [
  { id: 'all', label: 'All Services' },
  { id: 'IMPLANTS', label: 'Implants' },
  { id: 'COSMETIC', label: 'Cosmetic' },
  { id: 'PREVENTIVE', label: 'Preventive' },
  { id: 'ORTHODONTICS', label: 'Orthodontics' },
  { id: 'SURGERY', label: 'Surgery' },
];

const serviceIcons: Record<string, string> = {
  IMPLANTS: '🦷',
  COSMETIC: '✨',
  PREVENTIVE: '🪥',
  ORTHODONTICS: '😁',
  SURGERY: '⚕️',
  RESTORATIVE: '🔧',
};

interface ServicesSectionProps {
  onBookService: (service: Service) => void;
}

export function ServicesSection({ onBookService }: ServicesSectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { settings } = useSettings();

  const formatCurrency = (amount: number) => {
    return `${settings.currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then(setServices)
      .catch(console.error);
  }, []);

  const filteredServices = activeFilter === 'all'
    ? services
    : services.filter((s) => s.category === activeFilter);

  return (
    <section id="services" ref={sectionRef} className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full glass text-sm text-[#FF8C42] mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">
            Comprehensive <span className="gradient-text font-semibold">Dental Care</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            From routine checkups to advanced procedures, we offer a complete range of dental services using the latest technology.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categoryFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                activeFilter === filter.id
                  ? 'bg-[#C73E1D] text-white glow'
                  : 'glass text-white/70 hover:text-white hover:border-[#FF8C42]/50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div
                className="card-glass p-6 h-full hover-lift cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF8C42]/20 to-[#C73E1D]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">
                    {serviceIcons[service.category] || '🦷'}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#FF8C42] transition-colors">
                  {service.name}
                </h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                  {service.shortDescription || service.description}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="text-xl font-bold text-[#FF8C42]">
                    {formatCurrency(service.price)}
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#C73E1D]/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" className="btn-secondary">
            View All Services
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Service Modal */}
      {selectedService && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedService(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl card-glass p-8"
          >
            {/* Close */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-white/60 hover:text-white"
            >
              ✕
            </button>

            {/* Content */}
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF8C42]/20 to-[#C73E1D]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">{serviceIcons[selectedService.category] || '🦷'}</span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-1">{selectedService.name}</h3>
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedService.duration} minutes
                  </span>
                  <span className="badge badge-primary">{selectedService.category}</span>
                </div>
              </div>
            </div>

            <p className="text-white/70 mb-6">{selectedService.description}</p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['Expert dentists', 'Latest technology', 'Pain-free procedures', 'Quick recovery'].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-white/60 text-sm">
                  <Check className="w-4 h-4 text-[#4ADE80]" />
                  {benefit}
                </div>
              ))}
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div>
                <span className="text-white/60 text-sm">Starting from</span>
                <div className="text-3xl font-bold text-[#FF8C42]">
                  {formatCurrency(selectedService.price)}
                </div>
              </div>
              <Button
                className="btn-primary glow"
                onClick={() => {
                  onBookService(selectedService);
                  setSelectedService(null);
                }}
              >
                Book This Service
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
