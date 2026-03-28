'use client';

import { motion } from 'framer-motion';
import { Award, Heart, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Expert Team',
    description: 'Board-certified specialists with decades of combined experience in dental care.',
  },
  {
    icon: Zap,
    title: 'Latest Technology',
    description: 'State-of-the-art equipment for precise diagnoses and comfortable treatments.',
  },
  {
    icon: Heart,
    title: 'Patient-Centered Care',
    description: 'Your comfort and satisfaction are our top priorities throughout your journey.',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Strict sterilization protocols and safety standards for your peace of mind.',
  },
];

const milestones = [
  { year: '2008', title: 'Founded', description: 'Dentix Lab was established' },
  { year: '2012', title: 'Expansion', description: 'Opened our second location' },
  { year: '2018', title: 'Innovation', description: 'Introduced digital dentistry' },
  { year: '2024', title: 'Recognition', description: 'Named Best Dental Clinic' },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 relative">
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
            About Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">
            Your Trusted <span className="gradient-text font-semibold">Dental Partner</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Since 2008, we&apos;ve been committed to providing exceptional dental care with a gentle touch and the latest technology.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden glass">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C73E1D]/30 to-[#8B2500]/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🏥</div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Modern Facility</h3>
                  <p className="text-white/60">State-of-the-art dental clinic in the heart of Barcelona</p>
                </div>
              </div>
            </div>
            
            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -right-6 glass rounded-xl p-4"
            >
              <div className="text-3xl font-bold text-[#FF8C42]">15+</div>
              <div className="text-sm text-white/60">Years of Excellence</div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-white mb-4">
              Leading Dental Care Since 2008
            </h3>
            <p className="text-white/70 mb-6">
              At Dentix Lab, we believe everyone deserves a healthy, beautiful smile. Our team of highly trained professionals uses cutting-edge technology and techniques to provide personalized care in a comfortable, welcoming environment.
            </p>
            <p className="text-white/70 mb-8">
              From routine checkups to complex procedures, we&apos;re here to help you achieve optimal oral health and the confident smile you&apos;ve always wanted.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3 p-4 rounded-xl glass"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF8C42]/20 to-[#C73E1D]/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-[#FF8C42]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{feature.title}</h4>
                    <p className="text-sm text-white/60">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h3 className="text-2xl font-semibold text-white text-center mb-12">Our Journey</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF8C42]/50 to-transparent" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full glass flex items-center justify-center relative z-10">
                    <span className="text-lg font-bold text-[#FF8C42]">{milestone.year}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">{milestone.title}</h4>
                  <p className="text-sm text-white/60">{milestone.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
