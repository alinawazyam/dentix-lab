'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// Types
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  photo?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  dateTime: string;
  status: string;
  duration: number;
  patient?: Patient;
  doctor?: Doctor;
  service?: Service;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  amount: number;
  status: string;
  patient?: Patient;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
}

interface Settings {
  clinicName: string;
  clinicEmail: string;
  clinicPhone: string;
  clinicAddress: string;
  currencySymbol: string;
  [key: string]: string;
}

interface AdminContextType {
  patients: Patient[];
  doctors: Doctor[];
  services: Service[];
  appointments: Appointment[];
  invoices: Invoice[];
  messages: Message[];
  settings: Settings;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshAll: () => Promise<void>;
  refreshPatients: () => Promise<void>;
  refreshDoctors: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdminData() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
}

export const useAdmin = useAdminData;

const defaultSettings: Settings = {
  clinicName: 'Dentix Lab',
  clinicEmail: '',
  clinicPhone: '',
  clinicAddress: '',
  currencySymbol: '$',
};

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch all data in parallel
      const [patientsRes, doctorsRes, servicesRes, appointmentsRes, invoicesRes, messagesRes, settingsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/doctors'),
        fetch('/api/services'),
        fetch('/api/appointments'),
        fetch('/api/invoices'),
        fetch('/api/messages'),
        fetch('/api/settings'),
      ]);

      const [patientsData, doctorsData, servicesData, appointmentsData, invoicesData, messagesData, settingsData] = await Promise.all([
        patientsRes.json(),
        doctorsRes.json(),
        servicesRes.json(),
        appointmentsRes.json(),
        invoicesRes.json(),
        messagesRes.json(),
        settingsRes.json(),
      ]);

      setPatients(Array.isArray(patientsData) ? patientsData : (patientsData.patients || []));
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      
      if (Array.isArray(settingsData)) {
        const s: Settings = { ...defaultSettings };
        settingsData.forEach((item: { key: string; value: string }) => {
          s[item.key] = item.value;
        });
        setSettings(s);
      } else if (settingsData && typeof settingsData === 'object') {
        setSettings({ ...defaultSettings, ...settingsData });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    // Add cache-busting parameter
    await fetchData();
  }, [fetchData]);

  const refreshPatients = refreshAll;
  const refreshDoctors = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error refreshing doctors:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);
  const refreshServices = refreshAll;
  const refreshAppointments = refreshAll;
  const refreshInvoices = refreshAll;
  const refreshMessages = refreshAll;

  return (
    <AdminContext.Provider value={{
      patients,
      doctors,
      services,
      appointments,
      invoices,
      messages,
      settings,
      isLoading,
      isRefreshing,
      refreshAll,
      refreshPatients,
      refreshDoctors,
      refreshServices,
      refreshAppointments,
      refreshInvoices,
      refreshMessages,
    }}>
      {children}
    </AdminContext.Provider>
  );
}
