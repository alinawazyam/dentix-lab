'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useAdminData } from '@/lib/admin-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function AdminPatients() {
  const { patients, isLoading, isRefreshing, refreshPatients } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const filteredPatients = useMemo(() => {
    return patients.filter((p: any) =>
      `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  const handleAddPatient = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await fetch('/api/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      toast.success('Patient added');
      setShowAddModal(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '' });
      refreshPatients();
    } catch { toast.error('Failed'); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-white/60">Loading...</div></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshPatients} disabled={isRefreshing} size="sm" className="btn-secondary"><RefreshCw className={isRefreshing ? 'animate-spin' : ''} /></Button>
          <Button onClick={() => setShowAddModal(true)} size="sm" className="btn-primary"><Plus className="w-4 h-4 mr-2" />Add</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
        {filteredPatients.map((patient: any) => (
          <div key={patient.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#C73E1D]/20 flex items-center justify-center text-white font-bold">
                {patient.firstName?.[0]}{patient.lastName?.[0]}
              </div>
              <div>
                <div className="font-medium text-white">{patient.firstName} {patient.lastName}</div>
                <div className="text-xs text-white/50">{patient.email}</div>
              </div>
            </div>
            {patient.phone && <div className="text-xs text-white/40">📞 {patient.phone}</div>}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#2D0A05] rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Add Patient</h3>
            <div className="space-y-3">
              <input placeholder="First Name *" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm" />
              <input placeholder="Last Name *" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm" />
              <input placeholder="Email *" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm" />
              <input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm" />
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1 btn-secondary">Cancel</Button>
              <Button onClick={handleAddPatient} className="flex-1 btn-primary">Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
