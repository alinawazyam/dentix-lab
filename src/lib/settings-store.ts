import { create } from 'zustand';

export interface SiteSettings {
  // Clinic Info
  clinicName: string;
  clinicLogo: string;
  clinicEmail: string;
  clinicPhone: string;
  clinicPhone2: string;
  clinicAddress: string;
  clinicCity: string;
  clinicCountry: string;
  clinicPostalCode: string;
  clinicWebsite: string;
  appointmentsEmail: string;
  workingDays: string[];
  
  // Currency & Billing
  currency: string;
  currencySymbol: string;
  taxRate: string;
  
  // Working Hours
  openingTime: string;
  closingTime: string;
  saturdayOpening: string;
  saturdayClosing: string;
  sundayClosed: boolean;
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  heroVideoEnabled: boolean;
  
  // Social Media
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  
  // Google Map
  mapEnabled: boolean;
  mapLocation: string;
  mapLatitude: string;
  mapLongitude: string;
  mapZoom: string;
  
  // Features
  appointmentDuration: string;
  reminderTime: string;
}

interface SettingsState {
  settings: SiteSettings;
  loading: boolean;
  fetchSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  clinicName: 'Dentix Lab',
  clinicLogo: '',
  clinicEmail: 'contact@dentixlab.com',
  clinicPhone: '+1 (555) 123-4567',
  clinicPhone2: '',
  clinicAddress: '123 Dental Street',
  clinicCity: 'New York',
  clinicCountry: 'United States',
  clinicPostalCode: '10001',
  clinicWebsite: 'www.dentixlab.com',
  appointmentsEmail: 'appointments@dentixlab.com',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  currency: 'USD',
  currencySymbol: '$',
  taxRate: '10',
  openingTime: '09:00',
  closingTime: '18:00',
  saturdayOpening: '10:00',
  saturdayClosing: '14:00',
  sundayClosed: true,
  heroTitle: 'Your Smile, Our Passion',
  heroSubtitle: 'Experience world-class dental care with cutting-edge technology and a gentle touch.',
  heroVideoUrl: '',
  heroVideoEnabled: false,
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  linkedinUrl: '',
  mapEnabled: true,
  mapLocation: 'Barcelona, Spain',
  mapLatitude: '41.3851',
  mapLongitude: '2.1734',
  mapZoom: '15',
  appointmentDuration: '30',
  reminderTime: '24',
};

export const useSettings = create<SettingsState>((set) => ({
  settings: defaultSettings,
  loading: true,
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      set({ settings: { ...defaultSettings, ...data }, loading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ settings: defaultSettings, loading: false });
    }
  },
}));

// Format currency based on settings
export const formatCurrency = (amount: number, symbol: string = '$'): string => {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
