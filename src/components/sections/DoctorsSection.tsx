'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Doctor {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  specialization: string;
  bio?: string | null;
  avatar?: string | null;
  photo?: string | null;
  experience?: number | string | null;
  rating?: number | string | null;
  isActive?: boolean;
  availability?: string;
}

const defaultAvatars = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
];

export function DoctorsSection() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch('/api/doctors')
      .then((res) => res.json())
      .then(setDoctors)
      .catch(console.error);
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % doctors.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + doctors.length) % doctors.length);
  };

  return (
    <section id="doctors" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full glass text-sm text-[#FF8C42] mb-4">
            Our Team
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">
            Meet Our <span className="gradient-text font-semibold">Expert Doctors</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Our team of highly skilled dental professionals is dedicated to providing exceptional care with compassion and expertise.
          </p>
        </motion.div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="card-glass overflow-hidden hover-lift">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={doctor.avatar || doctor.photo || defaultAvatars[index % defaultAvatars.length]}
                    alt={`Dr. ${doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full glass">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-white">{(typeof doctor.rating === 'number' ? doctor.rating : parseFloat(String(doctor.rating)) || 4.8).toFixed(1)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Dr. {doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()}
                  </h3>
                  <p className="text-[#FF8C42] text-sm mb-3">{doctor.specialization}</p>
                  
                  <div className="flex items-center gap-4 text-white/50 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {(typeof doctor.experience === 'number' ? doctor.experience : parseInt(String(doctor.experience)) || 5)}+ years
                    </span>
                  </div>

                  <p className="text-white/60 text-sm line-clamp-2 mb-4">
                    {doctor.bio}
                  </p>

                  <Button
                    variant="outline"
                    className="w-full btn-secondary"
                    onClick={() => {
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '15+', label: 'Years Combined Experience' },
            { value: '5000+', label: 'Patients Treated' },
            { value: '20+', label: 'Specializations' },
            { value: '98%', label: 'Patient Satisfaction' },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center p-6 card-glass">
              <div className="text-3xl font-bold text-[#FF8C42] mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
