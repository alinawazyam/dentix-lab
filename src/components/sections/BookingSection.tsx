'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Clock, User, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBookingStore, Service, Doctor } from '@/lib/store';
import { toast } from 'sonner';
import { useSettings } from '@/lib/settings-store';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const steps = [
  { id: 1, title: 'Service', icon: CreditCard },
  { id: 2, title: 'Doctor', icon: User },
  { id: 3, title: 'Date & Time', icon: Calendar },
  { id: 4, title: 'Details', icon: Clock },
];

interface BookingSectionProps {
  preselectedService?: Service | null;
}

export function BookingSection({ preselectedService }: BookingSectionProps) {
  const {
    step,
    selectedService,
    selectedDoctor,
    selectedDate,
    selectedTime,
    patientInfo,
    setStep,
    setSelectedService,
    setSelectedDoctor,
    setSelectedDate,
    setSelectedTime,
    setPatientInfo,
    reset,
  } = useBookingStore();

  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { settings } = useSettings();

  const formatCurrency = (amount: number) => {
    return `${settings.currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then((r) => r.json()),
      fetch('/api/doctors').then((r) => r.json()),
    ])
      .then(([servicesData, doctorsData]) => {
        setServices(servicesData);
        setDoctors(doctorsData);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      setStep(2);
    }
  }, [preselectedService, setSelectedService, setStep]);

  const handleSubmit = async () => {
    if (!selectedService || !selectedDoctor || !selectedDate || !selectedTime || !patientInfo) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const [year, month, day] = selectedDate.toISOString().split('T')[0].split('-');
      const [hours, minutes] = selectedTime.split(':');
      const dateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientFirstName: patientInfo.firstName,
          patientLastName: patientInfo.lastName,
          patientEmail: patientInfo.email,
          patientPhone: patientInfo.phone,
          doctorId: selectedDoctor.id,
          serviceId: selectedService.id,
          dateTime: dateTime.toISOString(),
          duration: selectedService.duration,
          notes: patientInfo.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to create appointment');

      setIsSuccess(true);
      toast.success('Appointment booked successfully!');
      
      setTimeout(() => {
        reset();
        setIsSuccess(false);
      }, 5000);
    } catch {
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedService?.id === service.id
                    ? 'bg-[#C73E1D] border-2 border-[#FF8C42] glow'
                    : 'glass hover:border-[#FF8C42]/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-white">{service.name}</h4>
                    <p className="text-sm text-white/60 mt-1">{service.duration} min</p>
                  </div>
                  <div className="text-lg font-bold text-[#FF8C42]">
                    {formatCurrency(service.price)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="grid md:grid-cols-2 gap-4">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedDoctor(doctor)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedDoctor?.id === doctor.id
                    ? 'bg-[#C73E1D] border-2 border-[#FF8C42] glow'
                    : 'glass hover:border-[#FF8C42]/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF8C42]/20 to-[#C73E1D]/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-white/60" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h4>
                    <p className="text-sm text-[#FF8C42]">{doctor.specialization}</p>
                    <p className="text-sm text-white/60">{doctor.experience}+ years exp</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4">Select Date</h4>
              <input
                type="date"
                value={selectedDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF8C42] focus:outline-none"
              />
            </div>

            {/* Time Slots */}
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4">Select Time</h4>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-[#C73E1D] text-white glow'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-md mx-auto space-y-6">
            <div className="glass rounded-xl p-6 space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-white/80">First Name *</Label>
                <Input
                  id="firstName"
                  value={patientInfo?.firstName || ''}
                  onChange={(e) => setPatientInfo({ ...patientInfo!, firstName: e.target.value })}
                  placeholder="John"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-white/80">Last Name *</Label>
                <Input
                  id="lastName"
                  value={patientInfo?.lastName || ''}
                  onChange={(e) => setPatientInfo({ ...patientInfo!, lastName: e.target.value })}
                  placeholder="Doe"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white/80">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={patientInfo?.email || ''}
                  onChange={(e) => setPatientInfo({ ...patientInfo!, email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-white/80">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={patientInfo?.phone || ''}
                  onChange={(e) => setPatientInfo({ ...patientInfo!, phone: e.target.value })}
                  placeholder="+34 612 345 678"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-white/80">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={patientInfo?.notes || ''}
                  onChange={(e) => setPatientInfo({ ...patientInfo!, notes: e.target.value })}
                  placeholder="Any special requests or concerns..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Service:</span>
                  <span className="text-white">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Doctor:</span>
                  <span className="text-white">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Date:</span>
                  <span className="text-white">{selectedDate?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Time:</span>
                  <span className="text-white">{selectedTime}</span>
                </div>
                <div className="border-t border-white/10 my-2 pt-2 flex justify-between font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-[#FF8C42]">{selectedService ? formatCurrency(selectedService.price) : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="booking" className="py-24 relative">
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
            Book Now
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">
            Schedule Your <span className="gradient-text font-semibold">Appointment</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Book your visit in just a few clicks. Select your service, choose your doctor, and pick a time that works for you.
          </p>
        </motion.div>

        {/* Booking Wizard */}
        <div className="max-w-3xl mx-auto">
          {/* Steps Indicator */}
          <div className="flex items-center justify-center mb-12">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                    step >= s.id
                      ? 'bg-[#C73E1D] text-white glow'
                      : 'bg-white/5 text-white/40'
                  }`}
                >
                  {step > s.id ? <Check className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 md:w-24 h-1 transition-all ${
                      step > s.id ? 'bg-[#FF8C42]' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                {steps[step - 1].title}
              </h3>
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="btn-secondary"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !selectedService) ||
                  (step === 2 && !selectedDoctor) ||
                  (step === 3 && (!selectedDate || !selectedTime))
                }
                className="btn-primary glow"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !patientInfo?.firstName || !patientInfo?.email || !patientInfo?.phone}
                className="btn-primary glow"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Success Message */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 rounded-xl glass text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Booking Confirmed!</h4>
              <p className="text-white/60">
                We&apos;ve sent a confirmation email to {patientInfo?.email}. See you soon!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
