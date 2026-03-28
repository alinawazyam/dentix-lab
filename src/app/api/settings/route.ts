import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

// Helper to fetch from Google Sheets
async function fetchFromSheets<T>(action: string, sheet: string): Promise<T> {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('Google Script URL not configured');
  }
  
  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('sheet', sheet);
  
  const response = await fetch(url.toString());
  return response.json();
}

// GET - Fetch all settings as object
export async function GET() {
  try {
    const result = await fetchFromSheets<{ success: boolean; data?: Array<{ id: string; key: string; value: string; description?: string }> }>('getAll', 'Settings');
    
    // Convert array to object
    const settings: Record<string, string> = {};
    
    if (result.success && result.data) {
      result.data.forEach((item) => {
        settings[item.key] = item.value;
      });
    }
    
    // Default values for missing settings
    const defaults: Record<string, string> = {
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
      workingDays: '["Monday","Tuesday","Wednesday","Thursday","Friday"]',
      currency: 'USD',
      currencySymbol: '$',
      taxRate: '10',
      openingTime: '09:00',
      closingTime: '18:00',
      saturdayOpening: '10:00',
      saturdayClosing: '14:00',
      sundayClosed: 'true',
      heroTitle: 'Your Smile, Our Passion',
      heroSubtitle: 'Experience world-class dental care with cutting-edge technology and a gentle touch.',
      heroVideoUrl: '',
      heroVideoEnabled: 'false',
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      linkedinUrl: '',
      tiktokUrl: '',
      youtubeUrl: '',
      mapEnabled: 'true',
      mapLocation: 'New York, USA',
      mapLatitude: '40.7128',
      mapLongitude: '-74.0060',
      mapZoom: '15',
      appointmentDuration: '30',
      reminderTime: '24',
    };
    
    // Merge with defaults
    const merged = { ...defaults, ...settings };
    
    return NextResponse.json(merged);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({});
  }
}

// POST - Update settings (FAST batch update!)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!GOOGLE_SCRIPT_URL) {
      return NextResponse.json({ 
        success: false, 
        error: 'Google Script URL not configured' 
      }, { status: 500 });
    }
    
    // Use batch update - single API call for all settings!
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.set('action', 'batchUpdateSettings');
    url.searchParams.set('sheet', 'Settings');
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const result = await response.json();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Settings saved successfully!',
        updated: result.updated || 0,
        created: result.created || 0
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to save settings' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save settings. Please try again.' 
    }, { status: 500 });
  }
}
