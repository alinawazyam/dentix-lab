'use client';

import { useState, useRef } from 'react';
import { Plus, Edit, Trash2, RefreshCw, X, Loader2, Camera } from 'lucide-react';
import { useAdminData } from '@/lib/admin-context';
import { useSettings } from '@/lib/settings-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const categories = [
  'PREVENTIVE',
  'COSMETIC',
  'IMPLANTS',
  'ORTHODONTICS',
  'RESTORATIVE',
  'EMERGENCY',
];

interface ServiceForm {
  id?: string;
  name: string;
  price: string;
  duration: string;
  category: string;
  description: string;
  image: string;
}

export function AdminServices() {
  const { services, isLoading, isRefreshing, refreshServices } = useAdminData();
  const { settings } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ServiceForm>({ 
    name: '', 
    price: '', 
    duration: '30', 
    category: 'PREVENTIVE', 
    description: '',
    image: ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'service');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success('Image uploaded!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/services';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { id: editingId, ...formData, price: parseFloat(formData.price), duration: parseInt(formData.duration) || 30 }
        : { ...formData, price: parseFloat(formData.price), duration: parseInt(formData.duration) || 30 };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(editingId ? 'Service updated!' : 'Service added!');
      closeModal();
      refreshServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setFormData({
      id: service.id,
      name: service.name || '',
      price: String(service.price || ''),
      duration: String(service.duration || '30'),
      category: service.category || 'PREVENTIVE',
      description: service.description || '',
      image: service.image || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Service deleted');
        refreshServices();
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
    setFormData({ name: '', price: '', duration: '30', category: 'PREVENTIVE', description: '', image: '' });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'PREVENTIVE': 'text-green-400',
      'COSMETIC': 'text-pink-400',
      'IMPLANTS': 'text-blue-400',
      'ORTHODONTICS': 'text-purple-400',
      'RESTORATIVE': 'text-yellow-400',
      'EMERGENCY': 'text-red-400',
    };
    return colors[category] || 'text-white/50';
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
          <h3 className="text-lg font-semibold text-white">Services Management</h3>
          <p className="text-xs text-white/50">Manage dental services and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshServices} disabled={isRefreshing} size="sm" className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowModal(true)} size="sm" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/50">No services added yet</p>
          <Button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            <Plus className="w-4 h-4 mr-2" /> Add First Service
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {services.map((service: any) => (
            <div key={service.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF8C42]/30 transition-colors">
              {service.image && (
                <div className="mb-3 h-24 rounded-lg overflow-hidden bg-white/5">
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-white truncate flex-1">{service.name}</div>
                <span className="text-green-400 font-bold ml-2">{settings.currencySymbol}{service.price}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${getCategoryColor(service.category)}`}>
                  {service.category}
                </span>
                <span className="text-xs text-white/30">•</span>
                <span className="text-xs text-white/40">{service.duration} min</span>
              </div>
              
              {service.description && (
                <p className="text-xs text-white/50 line-clamp-2 mt-2">{service.description}</p>
              )}

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                <Button 
                  onClick={() => handleEdit(service)} 
                  size="sm" 
                  variant="outline" 
                  className="text-xs px-3 text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                >
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button 
                  onClick={() => handleDelete(service.id)} 
                  size="sm" 
                  variant="outline" 
                  className="text-xs px-3 text-red-400 border-red-400/30 hover:bg-red-400/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-[#2D0A05] rounded-xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={closeModal} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-xs text-white/70 mb-2">Service Image</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-white/30" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    type="button"
                    className="btn-secondary text-sm"
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                      </span>
                    ) : (
                      'Upload Image'
                    )}
                  </Button>
                  {formData.image && (
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="block text-xs text-red-400 mt-2 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">Service Name *</label>
                <input 
                  placeholder="e.g., Dental Crowns" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF8C42]/50 focus:outline-none" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Price ({settings.currencySymbol}) *</label>
                  <input 
                    placeholder="1200" 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF8C42]/50 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Duration (min)</label>
                  <input 
                    placeholder="30" 
                    type="number" 
                    value={formData.duration} 
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })} 
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF8C42]/50 focus:outline-none" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-white/70 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF8C42]/50 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#2D0A05]">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Description</label>
                <textarea 
                  placeholder="Brief description of the service..." 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-[#FF8C42]/50 focus:outline-none resize-none" 
                />
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
                  editingId ? 'Update' : 'Add Service'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
