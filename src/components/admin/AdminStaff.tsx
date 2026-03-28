'use client';

import { useState, useRef } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Camera, X, Loader2 } from 'lucide-react';
import { useAdminData } from '@/lib/admin-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const specializations = [
  'General Dentist',
  'Implant Specialist',
  'Cosmetic Dentist',
  'Orthodontist',
  'Periodontist',
  'Endodontist',
  'Oral Surgeon',
  'Pediatric Dentist',
];

interface DoctorForm {
  id?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  photo: string;
}

export function AdminStaff() {
  const { doctors, isLoading, isRefreshing, refreshDoctors } = useAdminData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DoctorForm>({ 
    name: '', 
    email: '', 
    phone: '', 
    specialization: 'General Dentist', 
    photo: '' 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'doctor');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, photo: data.url }));
        toast.success('Photo uploaded!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.specialization) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      // Use /api/doctors to match admin-context
      const url = '/api/doctors';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { id: editingId, ...formData }
        : formData;

      console.log('Saving doctor:', { method, body });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('API response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(editingId ? 'Doctor updated!' : 'Doctor added!');
      closeModal();
      // Force refresh doctors list
      await refreshDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error('Failed to save doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (doctor: any) => {
    console.log('Editing doctor:', doctor);
    setEditingId(doctor.id);
    
    // Handle both name formats: {name} or {firstName, lastName}
    const doctorName = doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    // Handle both photo formats: {photo} or {avatar}
    const doctorPhoto = doctor.photo || doctor.avatar || '';
    
    setFormData({
      id: doctor.id,
      name: doctorName,
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialization: doctor.specialization || 'General Dentist',
      photo: doctorPhoto,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      const res = await fetch(`/api/doctors?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Doctor deleted');
        refreshDoctors();
      } else {
        throw new Error(data.error);
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', specialization: 'General Dentist', photo: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#FF8C42] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Staff Management</h3>
          <p className="text-xs text-white/50">Manage doctors and their profiles</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshDoctors} disabled={isRefreshing} size="sm" className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowModal(true)} size="sm" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Add Doctor
          </Button>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/50">No doctors added yet</p>
          <Button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            <Plus className="w-4 h-4 mr-2" /> Add First Doctor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {doctors.map((doctor: any) => {
            const doctorPhoto = doctor.photo || doctor.avatar;
            const doctorName = doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
            
            return (
              <div key={doctor.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF8C42]/30 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#C73E1D] flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                      {doctorPhoto ? (
                        <img src={doctorPhoto} alt={doctorName} className="w-full h-full object-cover" />
                      ) : (
                        doctorName?.charAt(0)?.toUpperCase() || 'D'
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{doctorName}</div>
                    <div className="text-xs text-[#FF8C42]">{doctor.specialization}</div>
                  </div>
                </div>
                
                <div className="space-y-1 text-xs text-white/60 mb-3">
                  <div className="truncate">📧 {doctor.email}</div>
                  {doctor.phone && <div className="truncate">📱 {doctor.phone}</div>}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <Button 
                    onClick={() => handleEdit(doctor)} 
                    size="sm" 
                    variant="outline" 
                    className="text-xs px-3 text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                  >
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(doctor.id)} 
                    size="sm" 
                    variant="outline" 
                    className="text-xs px-3 text-red-400 border-red-400/30 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-[#2D0A05] rounded-xl p-6 w-full max-w-md border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Doctor' : 'Add New Doctor'}
              </h3>
              <button onClick={closeModal} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Upload */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#C73E1D] flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    formData.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#C73E1D] border-2 border-[#2D0A05] text-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Name *</label>
                <input 
                  placeholder="Dr. John Smith" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF8C42]/50 focus:outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Email *</label>
                <input 
                  placeholder="doctor@clinic.com" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF8C42]/50 focus:outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Phone</label>
                <input 
                  placeholder="+1 (555) 123-4567" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF8C42]/50 focus:outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Specialization *</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF8C42]/50 focus:outline-none"
                >
                  {specializations.map((spec) => (
                    <option key={spec} value={spec} className="bg-[#2D0A05]">{spec}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={closeModal} variant="outline" className="flex-1 btn-secondary">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 btn-primary">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  editingId ? 'Update' : 'Add Doctor'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
