'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Building2,
  Clock,
  DollarSign,
  Bell,
  MapPin,
  Palette,
  Globe,
  Mail,
  Phone,
  Save,
  Camera,
  Trash2,
  Database,
  Download,
  Upload,
  Video,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Loader2,
  X,
  Image as ImageIcon,
  Map,
  Youtube,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ClinicSettings {
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
  currency: string;
  currencySymbol: string;
  taxRate: string;
  openingTime: string;
  closingTime: string;
  saturdayOpening: string;
  saturdayClosing: string;
  sundayClosed: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  heroVideoEnabled: boolean;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  mapEnabled: boolean;
  mapLocation: string;
  mapLatitude: string;
  mapLongitude: string;
  mapZoom: string;
  appointmentDuration: string;
  reminderTime: string;
}

const defaultSettings: ClinicSettings = {
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
  tiktokUrl: '',
  youtubeUrl: '',
  mapEnabled: true,
  mapLocation: 'Barcelona, Spain',
  mapLatitude: '41.3851',
  mapLongitude: '2.1734',
  mapZoom: '15',
  appointmentDuration: '30',
  reminderTime: '24',
};

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
];

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings({ ...defaultSettings, ...data });
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Settings saved! Updated: ${data.updated || 0}, Created: ${data.created || 0}`);
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        updateSetting('clinicLogo', data.url);
        toast.success('Logo uploaded successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const updateSetting = <K extends keyof ClinicSettings>(key: K, value: ClinicSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'hours', label: 'Hours', icon: Clock },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'hero', label: 'Hero', icon: Video },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'social', label: 'Social', icon: Globe },
    { id: 'data', label: 'Data', icon: Database },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#FF8C42] animate-spin" />
      </div>
    );
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-8 p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="relative group mx-auto sm:mx-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-[#FF8C42] to-[#C73E1D] flex items-center justify-center overflow-hidden">
            {settings.clinicLogo ? (
              <img 
                src={settings.clinicLogo} 
                alt="Clinic Logo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {settings.clinicName?.charAt(0) || 'D'}
              </span>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingLogo}
            className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C73E1D] border-2 border-[#2D0A05] text-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
          >
            {uploadingLogo ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-base md:text-lg font-semibold text-white">Clinic Logo</h3>
          <p className="text-xs md:text-sm text-white/50 mb-3">Upload your clinic logo (PNG, JPG, WebP - Max 5MB)</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="btn-primary text-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
            </Button>
            {settings.clinicLogo && (
              <Button 
                onClick={() => updateSetting('clinicLogo', '')}
                variant="outline"
                className="text-sm text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Clinic Name *</label>
          <Input
            value={settings.clinicName}
            onChange={(e) => updateSetting('clinicName', e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={settings.clinicWebsite}
              onChange={(e) => updateSetting('clinicWebsite', e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Primary Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="email"
              value={settings.clinicEmail}
              onChange={(e) => updateSetting('clinicEmail', e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Appointments Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              type="email"
              value={settings.appointmentsEmail}
              onChange={(e) => updateSetting('appointmentsEmail', e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
              placeholder="appointments@yourclinic.com"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Primary Phone *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={settings.clinicPhone}
              onChange={(e) => updateSetting('clinicPhone', e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Secondary Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={settings.clinicPhone2}
              onChange={(e) => updateSetting('clinicPhone2', e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
              placeholder="+1 (555) 123-4568"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-1">Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={settings.clinicAddress}
            onChange={(e) => updateSetting('clinicAddress', e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">City</label>
          <Input
            value={settings.clinicCity}
            onChange={(e) => updateSetting('clinicCity', e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Country</label>
          <Input
            value={settings.clinicCountry}
            onChange={(e) => updateSetting('clinicCountry', e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Postal Code</label>
          <Input
            value={settings.clinicPostalCode}
            onChange={(e) => updateSetting('clinicPostalCode', e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderHoursSettings = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-medium text-white mb-4">Weekdays (Mon-Fri)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Opening Time</label>
            <Input
              type="time"
              value={settings.openingTime}
              onChange={(e) => updateSetting('openingTime', e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Closing Time</label>
            <Input
              type="time"
              value={settings.closingTime}
              onChange={(e) => updateSetting('closingTime', e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-medium text-white mb-4">Saturday</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Opening Time</label>
            <Input
              type="time"
              value={settings.saturdayOpening}
              onChange={(e) => updateSetting('saturdayOpening', e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Closing Time</label>
            <Input
              type="time"
              value={settings.saturdayClosing}
              onChange={(e) => updateSetting('saturdayClosing', e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <label className="flex items-start sm:items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.sundayClosed}
            onChange={(e) => updateSetting('sundayClosed', e.target.checked)}
            className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#C73E1D] focus:ring-[#C73E1D]/50 mt-0.5 sm:mt-0"
          />
          <div>
            <span className="text-white font-medium">Sunday Closed</span>
            <p className="text-sm text-white/50">Check if clinic is closed on Sundays</p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-1">Default Appointment Duration (minutes)</label>
        <Input
          type="number"
          value={settings.appointmentDuration}
          onChange={(e) => updateSetting('appointmentDuration', e.target.value)}
          className="bg-white/5 border-white/10 text-white w-32"
        />
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-[#FF8C42]/10 border border-[#FF8C42]/20">
        <h4 className="font-medium text-[#FF8C42] mb-2">💰 Currency Settings</h4>
        <p className="text-xs md:text-sm text-white/50 mb-4">This currency will be used throughout the website (billing, services, invoices)</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => {
                const selected = currencies.find((c) => c.code === e.target.value);
                if (selected) {
                  updateSetting('currency', selected.code);
                  updateSetting('currencySymbol', selected.symbol);
                }
              }}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FF8C42]/50"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} - {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Currency Symbol</label>
            <Input
              value={settings.currencySymbol}
              onChange={(e) => updateSetting('currencySymbol', e.target.value)}
              className="bg-white/5 border-white/10 text-white w-24"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-1">Tax Rate (%)</label>
        <Input
          type="number"
          value={settings.taxRate}
          onChange={(e) => updateSetting('taxRate', e.target.value)}
          className="bg-white/5 border-white/10 text-white w-32"
        />
      </div>
    </div>
  );

  const renderHeroSettings = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-medium text-white mb-3">Hero Section Content</h4>
        <p className="text-xs md:text-sm text-white/50 mb-4">This will appear on the homepage hero section</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Hero Title</label>
            <Input
              value={settings.heroTitle}
              onChange={(e) => updateSetting('heroTitle', e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Hero Subtitle</label>
            <Textarea
              value={settings.heroSubtitle}
              onChange={(e) => updateSetting('heroSubtitle', e.target.value)}
              className="bg-white/5 border-white/10 text-white resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#FF8C42]/10 border border-[#FF8C42]/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-medium text-[#FF8C42]">🎬 Video Background</h4>
            <p className="text-xs md:text-sm text-white/50">Add a video URL to display in hero section</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.heroVideoEnabled}
              onChange={(e) => updateSetting('heroVideoEnabled', e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#C73E1D] focus:ring-[#C73E1D]/50"
            />
            <span className="text-white/70 text-sm">Enable Video</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm text-white/70 mb-1">Video URL (YouTube, Vimeo, or MP4)</label>
          <Input
            value={settings.heroVideoUrl}
            onChange={(e) => updateSetting('heroVideoUrl', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderMapSettings = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-medium text-white">🗺️ Google Map</h4>
            <p className="text-xs md:text-sm text-white/50">Enable/disable map on contact section</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.mapEnabled}
              onChange={(e) => updateSetting('mapEnabled', e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#C73E1D] focus:ring-[#C73E1D]/50"
            />
            <span className="text-white/70 text-sm font-medium">
              {settings.mapEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {settings.mapEnabled && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Location Name</label>
              <Input
                value={settings.mapLocation}
                onChange={(e) => updateSetting('mapLocation', e.target.value)}
                placeholder="Barcelona, Spain"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Latitude</label>
                <Input
                  value={settings.mapLatitude}
                  onChange={(e) => updateSetting('mapLatitude', e.target.value)}
                  placeholder="41.3851"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Longitude</label>
                <Input
                  value={settings.mapLongitude}
                  onChange={(e) => updateSetting('mapLongitude', e.target.value)}
                  placeholder="2.1734"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Zoom Level (1-20)</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={settings.mapZoom}
                onChange={(e) => updateSetting('mapZoom', e.target.value)}
                className="bg-white/5 border-white/10 text-white w-24"
              />
            </div>
            <p className="text-xs text-white/40">
              💡 Tip: Get coordinates from Google Maps by right-clicking on your location
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSocialSettings = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-medium text-white mb-4">Social Media Links</h4>
        <p className="text-xs md:text-sm text-white/50 mb-4">These links will appear in the footer</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-1">
              <Facebook className="w-4 h-4 text-blue-500" />
              Facebook
            </label>
            <Input
              value={settings.facebookUrl}
              onChange={(e) => updateSetting('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/yourclinic"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-1">
              <Instagram className="w-4 h-4 text-pink-500" />
              Instagram
            </label>
            <Input
              value={settings.instagramUrl}
              onChange={(e) => updateSetting('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/yourclinic"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-1">
              <Twitter className="w-4 h-4 text-sky-500" />
              Twitter / X
            </label>
            <Input
              value={settings.twitterUrl}
              onChange={(e) => updateSetting('twitterUrl', e.target.value)}
              placeholder="https://twitter.com/yourclinic"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-1">
              <Linkedin className="w-4 h-4 text-blue-600" />
              LinkedIn
            </label>
            <Input
              value={settings.linkedinUrl}
              onChange={(e) => updateSetting('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/company/yourclinic"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-1">
              <Youtube className="w-4 h-4 text-red-500" />
              YouTube
            </label>
            <Input
              value={settings.youtubeUrl}
              onChange={(e) => updateSetting('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/@yourclinic"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-1">
              <Music className="w-4 h-4 text-black dark:text-white" />
              TikTok
            </label>
            <Input
              value={settings.tiktokUrl}
              onChange={(e) => updateSetting('tiktokUrl', e.target.value)}
              placeholder="https://tiktok.com/@yourclinic"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-medium text-white mb-3">Backup Database</h4>
        <p className="text-xs md:text-sm text-white/50 mb-4">Download a backup of your database</p>
        <Button className="btn-primary">
          <Download className="w-4 h-4 mr-2" />
          Download Backup
        </Button>
      </div>

      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
        <h4 className="font-medium text-red-400 mb-3">⚠️ Danger Zone</h4>
        <p className="text-xs md:text-sm text-white/50 mb-4">
          Permanently delete all data. This action cannot be undone.
        </p>
        <Button variant="destructive" className="bg-red-500/20 hover:bg-red-500/30 text-red-400">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete All Data
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
      {/* Mobile Tabs - Horizontal Scrollable */}
      <div className="lg:hidden overflow-x-auto pb-2 -mx-3 px-3">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#C73E1D] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/10'
              }`}
            >
              <tab.icon size={16} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar Tabs */}
      <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#C73E1D]/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#FF8C42]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Settings</h2>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-[#C73E1D] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto min-w-0">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10"
        >
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'contact' && renderContactSettings()}
          {activeTab === 'hours' && renderHoursSettings()}
          {activeTab === 'billing' && renderBillingSettings()}
          {activeTab === 'hero' && renderHeroSettings()}
          {activeTab === 'map' && renderMapSettings()}
          {activeTab === 'social' && renderSocialSettings()}
          {activeTab === 'data' && renderDataSettings()}

          <div className="flex justify-end mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/10">
            <Button onClick={handleSave} disabled={saving} className="btn-primary w-full sm:w-auto sm:min-w-40">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
