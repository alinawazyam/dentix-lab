import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  duration: number;
  price: number;
  category: string;
  image: string | null;
  icon: string | null;
  isActive: boolean;
  featured: boolean;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  specialization: string;
  bio: string | null;
  avatar: string | null;
  experience: number | null;
  rating: number | null;
  isActive: boolean;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  avatar: string | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  dateTime: string;
  duration: number;
  status: string;
  notes: string | null;
  patient?: Patient;
  doctor?: Doctor;
  service?: Service;
}

export interface Testimonial {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  avatar: string | null;
  treatment: string | null;
}

// Booking Store
interface BookingState {
  step: number;
  selectedService: Service | null;
  selectedDoctor: Doctor | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  patientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
  } | null;
  setStep: (step: number) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedDoctor: (doctor: Doctor | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  setPatientInfo: (info: BookingState['patientInfo']) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      step: 1,
      selectedService: null,
      selectedDoctor: null,
      selectedDate: null,
      selectedTime: null,
      patientInfo: null,
      setStep: (step) => set({ step }),
      setSelectedService: (service) => set({ selectedService: service }),
      setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedTime: (time) => set({ selectedTime: time }),
      setPatientInfo: (info) => set({ patientInfo: info }),
      reset: () =>
        set({
          step: 1,
          selectedService: null,
          selectedDoctor: null,
          selectedDate: null,
          selectedTime: null,
          patientInfo: null,
        }),
    }),
    {
      name: 'denta-booking',
    }
  )
);

// Admin Store
interface AdminState {
  currentView: 'dashboard' | 'patients' | 'appointments' | 'services' | 'doctors' | 'billing' | 'settings';
  sidebarCollapsed: boolean;
  setCurrentView: (view: AdminState['currentView']) => void;
  toggleSidebar: () => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  currentView: 'dashboard',
  sidebarCollapsed: false,
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

// UI Store
interface UIState {
  isMenuOpen: boolean;
  activeSection: string;
  scrollProgress: number;
  toggleMenu: () => void;
  setMenuOpen: (open: boolean) => void;
  setActiveSection: (section: string) => void;
  setScrollProgress: (progress: number) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isMenuOpen: false,
  activeSection: 'hero',
  scrollProgress: 0,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setActiveSection: (section) => set({ activeSection: section }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
}));
