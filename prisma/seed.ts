import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { slug: 'dental-implants' },
      update: {},
      create: {
        name: 'Dental Implants',
        slug: 'dental-implants',
        description: 'Permanent tooth replacement solution that looks and functions like natural teeth. Our state-of-the-art implant procedure uses titanium posts surgically placed into the jawbone, providing a strong foundation for artificial teeth.',
        shortDescription: 'Permanent tooth replacement with natural look and feel',
        duration: 120,
        price: 2500,
        category: 'IMPLANTS',
        featured: true,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'teeth-whitening' },
      update: {},
      create: {
        name: 'Teeth Whitening',
        slug: 'teeth-whitening',
        description: 'Professional whitening treatment for a brighter, more confident smile. Our advanced LED-accelerated system can lighten teeth by up to 8 shades in a single session.',
        shortDescription: 'Professional whitening for a brighter smile',
        duration: 60,
        price: 350,
        category: 'COSMETIC',
        featured: true,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'dental-crowns' },
      update: {},
      create: {
        name: 'Dental Crowns',
        slug: 'dental-crowns',
        description: 'Custom-made caps that cover damaged teeth, restoring their shape, size, and strength. Made from high-quality porcelain or ceramic for a natural appearance.',
        shortDescription: 'Custom caps for damaged teeth restoration',
        duration: 90,
        price: 1200,
        category: 'RESTORATIVE',
        featured: true,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'root-canal' },
      update: {},
      create: {
        name: 'Root Canal Treatment',
        slug: 'root-canal',
        description: 'Pain-relieving procedure to save infected teeth. We use advanced rotary instruments and microscopic technology for precise, comfortable treatment.',
        shortDescription: 'Pain-relieving treatment for infected teeth',
        duration: 90,
        price: 800,
        category: 'SURGERY',
        featured: false,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'invisalign' },
      update: {},
      create: {
        name: 'Invisalign',
        slug: 'invisalign',
        description: 'Clear aligner system for straightening teeth without traditional braces. Virtually invisible, removable, and more comfortable than metal braces.',
        shortDescription: 'Invisible aligners for teeth straightening',
        duration: 45,
        price: 4500,
        category: 'ORTHODONTICS',
        featured: true,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'dental-veneers' },
      update: {},
      create: {
        name: 'Dental Veneers',
        slug: 'dental-veneers',
        description: 'Thin porcelain shells bonded to the front of teeth to improve appearance. Perfect for correcting chips, gaps, stains, and misshapen teeth.',
        shortDescription: 'Porcelain shells for perfect smile',
        duration: 120,
        price: 1500,
        category: 'COSMETIC',
        featured: true,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'routine-cleaning' },
      update: {},
      create: {
        name: 'Routine Cleaning & Checkup',
        slug: 'routine-cleaning',
        description: 'Comprehensive dental cleaning and examination. Includes professional cleaning, polishing, fluoride treatment, and oral health assessment.',
        shortDescription: 'Professional cleaning and oral health check',
        duration: 45,
        price: 150,
        category: 'PREVENTIVE',
        featured: true,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'wisdom-teeth-removal' },
      update: {},
      create: {
        name: 'Wisdom Teeth Removal',
        slug: 'wisdom-teeth-removal',
        description: 'Safe and comfortable extraction of wisdom teeth. Performed under local anesthesia or sedation for your comfort.',
        shortDescription: 'Expert wisdom tooth extraction',
        duration: 60,
        price: 600,
        category: 'SURGERY',
        featured: false,
        isActive: true,
      },
    }),
  ]);

  // Create Doctors
  const doctors = await Promise.all([
    prisma.doctor.upsert({
      where: { email: 'clara@denta.com' },
      update: {},
      create: {
        firstName: 'Clara',
        lastName: 'Collins',
        email: 'clara@denta.com',
        phone: '+34 932 123 456',
        specialization: 'Implant Specialist',
        bio: 'Dr. Clara Collins is a board-certified implantologist with over 15 years of experience. She has successfully placed over 5,000 dental implants and is known for her gentle approach and precision.',
        experience: 15,
        rating: 4.9,
        isActive: true,
        qualifications: JSON.stringify(['DDS', 'MSc Implantology', 'Board Certified']),
      },
    }),
    prisma.doctor.upsert({
      where: { email: 'mason@denta.com' },
      update: {},
      create: {
        firstName: 'Mason',
        lastName: 'Reed',
        email: 'mason@denta.com',
        phone: '+34 932 123 457',
        specialization: 'Cosmetic Dentist',
        bio: 'Dr. Mason Reed specializes in cosmetic dentistry and smile makeovers. His artistic eye and attention to detail have transformed thousands of smiles.',
        experience: 12,
        rating: 4.8,
        isActive: true,
        qualifications: JSON.stringify(['DDS', 'AACD Member', 'Invisalign Certified']),
      },
    }),
    prisma.doctor.upsert({
      where: { email: 'sarah@denta.com' },
      update: {},
      create: {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah@denta.com',
        phone: '+34 932 123 458',
        specialization: 'Orthodontist',
        bio: 'Dr. Sarah Chen is an expert orthodontist who creates beautiful, healthy smiles using the latest techniques including Invisalign and lingual braces.',
        experience: 10,
        rating: 4.9,
        isActive: true,
        qualifications: JSON.stringify(['DDS', 'MSc Orthodontics', 'Invisalign Diamond Provider']),
      },
    }),
    prisma.doctor.upsert({
      where: { email: 'james@denta.com' },
      update: {},
      create: {
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james@denta.com',
        phone: '+34 932 123 459',
        specialization: 'General Dentist',
        bio: 'Dr. James Wilson provides comprehensive dental care for patients of all ages. His gentle manner makes even anxious patients feel at ease.',
        experience: 8,
        rating: 4.7,
        isActive: true,
        qualifications: JSON.stringify(['DDS', 'General Practice Residency']),
      },
    }),
  ]);

  // Create Schedules for Doctors
  for (const doctor of doctors) {
    // Monday to Friday
    for (let day = 1; day <= 5; day++) {
      await prisma.schedule.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId: doctor.id,
            dayOfWeek: day,
          },
        },
        update: {},
        create: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true,
        },
      });
    }
    // Saturday
    await prisma.schedule.upsert({
      where: {
        doctorId_dayOfWeek: {
          doctorId: doctor.id,
          dayOfWeek: 6,
        },
      },
      update: {},
      create: {
        doctorId: doctor.id,
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '14:00',
        isActive: true,
      },
    });
  }

  // Create Testimonials
  await Promise.all([
    prisma.testimonial.upsert({
      where: { id: 'testimonial-1' },
      update: {},
      create: {
        id: 'testimonial-1',
        patientName: 'Maria Garcia',
        rating: 5,
        comment: 'Dr. Clara Collins transformed my smile completely. The dental implant procedure was painless, and the results are amazing. I can finally eat and smile with confidence!',
        treatment: 'Dental Implants',
        approved: true,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'testimonial-2' },
      update: {},
      create: {
        id: 'testimonial-2',
        patientName: 'John Smith',
        rating: 5,
        comment: 'The teeth whitening results exceeded my expectations. My teeth are now 8 shades whiter! The staff was incredibly professional and made me feel comfortable throughout.',
        treatment: 'Teeth Whitening',
        approved: true,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'testimonial-3' },
      update: {},
      create: {
        id: 'testimonial-3',
        patientName: 'Emma Johnson',
        rating: 5,
        comment: 'Dr. Sarah Chen is an amazing orthodontist. My Invisalign treatment was seamless, and I love my new straight smile. Highly recommend!',
        treatment: 'Invisalign',
        approved: true,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'testimonial-4' },
      update: {},
      create: {
        id: 'testimonial-4',
        patientName: 'Carlos Rodriguez',
        rating: 4,
        comment: 'Great experience with my dental crowns. The team explained everything clearly and the procedure was quick and painless. Very satisfied with the natural look.',
        treatment: 'Dental Crowns',
        approved: true,
      },
    }),
  ]);

  // Create Settings
  await prisma.setting.upsert({
    where: { key: 'clinic_info' },
    update: {},
    create: {
      key: 'clinic_info',
      value: JSON.stringify({
        name: 'Denta Premium Dental Care',
        address: 'Carrer de Pau Claris, 123',
        city: 'Barcelona',
        country: 'Spain',
        postalCode: '08009',
        phone: '+34 932 123 456',
        email: 'info@denta.com',
        workingHours: {
          weekdays: '09:00 - 20:00',
          saturday: '10:00 - 14:00',
          sunday: 'Closed',
        },
      }),
    },
  });

  console.log('Seed data created successfully!');
  console.log(`Created ${services.length} services`);
  console.log(`Created ${doctors.length} doctors`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
