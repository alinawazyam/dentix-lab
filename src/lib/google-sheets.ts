/**
 * Google Sheets Database Service with Caching
 * 
 * This service communicates with the Google Apps Script Web App
 * to perform CRUD operations on Google Sheets.
 */

// The URL of your deployed Google Apps Script Web App
// Use NEXT_PUBLIC_ prefix so it's available on both client and server
const getGoogleScriptUrl = (): string => {
  // Try multiple ways to get the URL
  if (typeof window !== 'undefined') {
    // Client side - check window env
    return (window as unknown as { ENV?: { NEXT_PUBLIC_GOOGLE_SCRIPT_URL?: string } })?.ENV?.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';
  }
  // Server side
  return process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';
};

// ==========================================
// SIMPLE IN-MEMORY CACHE (server-side only)
// ==========================================
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const serverCache = new Map<string, CacheItem<unknown>>();
const CACHE_TTL = 300000; // 5 minutes cache for much better performance

function getCached<T>(key: string): T | null {
  // Only use cache on server
  if (typeof window !== 'undefined') return null;

  const item = serverCache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data as T;
  }
  serverCache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  // Only cache on server
  if (typeof window !== 'undefined') return;
  serverCache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(pattern: string): void {
  for (const key of serverCache.keys()) {
    if (key.includes(pattern)) {
      serverCache.delete(key);
    }
  }
}

// ==========================================
// TYPES
// ==========================================
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  medicalHistory?: string;
  createdAt?: string;
  updatedAt?: string;
  _row?: number;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  photo?: string;
  availability?: string;
  createdAt?: string;
  updatedAt?: string;
  _row?: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  duration: number | string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
  _row?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  _row?: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  services?: string;
  amount: number | string;
  currency?: string;
  status: string;
  dueDate?: string;
  paidDate?: string;
  createdAt?: string;
  updatedAt?: string;
  _row?: number;
}

export interface Testimonial {
  id: string;
  patientName: string;
  rating: number;
  review: string;
  photo?: string;
  approved: boolean;
  createdAt?: string;
  updatedAt?: string;
  _row?: number;
}

export interface SettingItem {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt?: string;
  _row?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// BASE FETCH FUNCTION
// ==========================================
interface FetchOptions {
  action: 'getAll' | 'getById' | 'create' | 'update' | 'delete' | 'initialize';
  sheet: string;
  id?: string;
  body?: Record<string, unknown>;
}

async function sheetsFetch<T>(options: FetchOptions): Promise<ApiResponse<T>> {
  const GOOGLE_SCRIPT_URL = getGoogleScriptUrl();
  
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('Google Script URL not configured - returning empty data');
    // Return empty success instead of throwing error
    if (options.action === 'getAll') {
      return { success: true, data: [] as unknown as T };
    }
    return { success: false, error: 'Google Script URL not configured' };
  }

  const { action, sheet, id, body } = options;
  
  // Check cache for getAll requests
  if (action === 'getAll' && !body) {
    const cacheKey = `${sheet}:getAll`;
    const cached = getCached<T>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }
  }
  
  // Build URL with query params
  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('sheet', sheet);
  if (id) {
    url.searchParams.set('id', id);
  }

  const fetchOptions: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    const data = await response.json();
    
    // Cache getAll responses
    if (action === 'getAll' && data.data) {
      setCache(`${sheet}:getAll`, data.data);
    }
    
    // Invalidate cache on create/update/delete
    if (action === 'create' || action === 'update' || action === 'delete') {
      invalidateCache(sheet);
    }
    
    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`Google Sheets API error (${sheet}):`, error);
    // Return empty data instead of throwing
    if (options.action === 'getAll') {
      return { success: false, data: [] as unknown as T, error: String(error) };
    }
    return { success: false, error: String(error) };
  }
}

// ==========================================
// SERVICES API
// ==========================================
export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const result = await sheetsFetch<Service[]>({ action: 'getAll', sheet: 'Services' });
    return result.data || [];
  },
  
  getById: async (id: string): Promise<Service | null> => {
    const result = await sheetsFetch<Service>({ action: 'getById', sheet: 'Services', id });
    return result.data || null;
  },
  
  create: async (data: Partial<Service>): Promise<Service | null> => {
    const result = await sheetsFetch<Service>({ action: 'create', sheet: 'Services', body: data });
    return result.data || null;
  },
  
  update: async (id: string, data: Partial<Service>): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'update', sheet: 'Services', id, body: data });
    return result.success;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'delete', sheet: 'Services', id });
    return result.success;
  },
};

// ==========================================
// DOCTORS/STAFF API
// ==========================================
export const doctorsApi = {
  getAll: async (): Promise<Doctor[]> => {
    const result = await sheetsFetch<Doctor[]>({ action: 'getAll', sheet: 'Doctors' });
    return result.data || [];
  },
  
  getById: async (id: string): Promise<Doctor | null> => {
    const result = await sheetsFetch<Doctor>({ action: 'getById', sheet: 'Doctors', id });
    return result.data || null;
  },
  
  create: async (data: Partial<Doctor>): Promise<Doctor | null> => {
    const result = await sheetsFetch<Doctor>({ action: 'create', sheet: 'Doctors', body: data });
    return result.data || null;
  },
  
  update: async (id: string, data: Partial<Doctor>): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'update', sheet: 'Doctors', id, body: data });
    return result.success;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'delete', sheet: 'Doctors', id });
    return result.success;
  },
};

// Alias for compatibility
export const staffApi = doctorsApi;

// ==========================================
// PATIENTS API
// ==========================================
export const patientsApi = {
  getAll: async (): Promise<Patient[]> => {
    const result = await sheetsFetch<Patient[]>({ action: 'getAll', sheet: 'Patients' });
    return result.data || [];
  },
  
  getById: async (id: string): Promise<Patient | null> => {
    const result = await sheetsFetch<Patient>({ action: 'getById', sheet: 'Patients', id });
    return result.data || null;
  },
  
  create: async (data: Partial<Patient>): Promise<Patient | null> => {
    const result = await sheetsFetch<Patient>({ action: 'create', sheet: 'Patients', body: data });
    return result.data || null;
  },
  
  update: async (id: string, data: Partial<Patient>): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'update', sheet: 'Patients', id, body: data });
    return result.success;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'delete', sheet: 'Patients', id });
    return result.success;
  },
};

// ==========================================
// APPOINTMENTS API
// ==========================================
export const appointmentsApi = {
  getAll: async (): Promise<Appointment[]> => {
    const result = await sheetsFetch<Appointment[]>({ action: 'getAll', sheet: 'Appointments' });
    return result.data || [];
  },
  
  getById: async (id: string): Promise<Appointment | null> => {
    const result = await sheetsFetch<Appointment>({ action: 'getById', sheet: 'Appointments', id });
    return result.data || null;
  },
  
  create: async (data: Partial<Appointment>): Promise<Appointment | null> => {
    const result = await sheetsFetch<Appointment>({ action: 'create', sheet: 'Appointments', body: data });
    return result.data || null;
  },
  
  update: async (id: string, data: Partial<Appointment>): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'update', sheet: 'Appointments', id, body: data });
    return result.success;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'delete', sheet: 'Appointments', id });
    return result.success;
  },
};

// ==========================================
// INVOICES API
// ==========================================
export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    const result = await sheetsFetch<Invoice[]>({ action: 'getAll', sheet: 'Invoices' });
    return result.data || [];
  },
  
  getById: async (id: string): Promise<Invoice | null> => {
    const result = await sheetsFetch<Invoice>({ action: 'getById', sheet: 'Invoices', id });
    return result.data || null;
  },
  
  create: async (data: Partial<Invoice>): Promise<Invoice | null> => {
    const result = await sheetsFetch<Invoice>({ action: 'create', sheet: 'Invoices', body: data });
    return result.data || null;
  },
  
  update: async (id: string, data: Partial<Invoice>): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'update', sheet: 'Invoices', id, body: data });
    return result.success;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'delete', sheet: 'Invoices', id });
    return result.success;
  },
};

// ==========================================
// TESTIMONIALS API
// ==========================================
export const testimonialsApi = {
  getAll: async (): Promise<Testimonial[]> => {
    const result = await sheetsFetch<Testimonial[]>({ action: 'getAll', sheet: 'Testimonials' });
    return result.data || [];
  },
  
  getApproved: async (): Promise<Testimonial[]> => {
    const all = await testimonialsApi.getAll();
    return all.filter(t => t.approved === true);
  },
  
  create: async (data: Partial<Testimonial>): Promise<Testimonial | null> => {
    const result = await sheetsFetch<Testimonial>({ action: 'create', sheet: 'Testimonials', body: data });
    return result.data || null;
  },
  
  update: async (id: string, data: Partial<Testimonial>): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'update', sheet: 'Testimonials', id, body: data });
    return result.success;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'delete', sheet: 'Testimonials', id });
    return result.success;
  },
};

// ==========================================
// SETTINGS API
// ==========================================
export const settingsApi = {
  getAll: async (): Promise<SettingItem[]> => {
    const result = await sheetsFetch<SettingItem[]>({ action: 'getAll', sheet: 'Settings' });
    return result.data || [];
  },
  
  getAsObject: async (): Promise<Record<string, string>> => {
    const items = await settingsApi.getAll();
    const settings: Record<string, string> = {};
    items.forEach(item => {
      settings[item.key] = item.value;
    });
    return settings;
  },
  
  getByKey: async (key: string): Promise<string | null> => {
    const items = await settingsApi.getAll();
    const item = items.find(i => i.key === key);
    return item?.value || null;
  },
  
  upsert: async (key: string, value: string, description?: string): Promise<boolean> => {
    const items = await settingsApi.getAll();
    const existing = items.find(i => i.key === key);
    
    if (existing && existing.id) {
      return await settingsApi.update(existing.id, { value, description });
    } else {
      const result = await sheetsFetch<SettingItem>({ 
        action: 'create', 
        sheet: 'Settings', 
        body: { key, value, description } 
      });
      return result.success;
    }
  },
  
  update: async (id: string, data: Partial<SettingItem>): Promise<boolean> => {
    const result = await sheetsFetch<null>({ action: 'update', sheet: 'Settings', id, body: data });
    return result.success;
  },
};

// ==========================================
// INITIALIZE SHEETS
// ==========================================
export const initializeSheets = async (): Promise<boolean> => {
  const result = await sheetsFetch<null>({ action: 'initialize', sheet: 'Settings' });
  return result.success;
};

// Clear all cache (useful for manual refresh)
export const clearCache = (): void => {
  serverCache.clear();
};
