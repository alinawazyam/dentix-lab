'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { useAdminData } from '@/lib/admin-context';
import { useSettings } from '@/lib/settings-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/skeleton-loader';

export function AdminAppointments() {
  const { appointments, isLoading, isRefreshing, refreshAppointments } = useAdminData();
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const dateRef = useRef(currentDate);

  const stats = useMemo(() => ({
    total: appointments.length,
    pending: appointments.filter((a: any) => a.status === 'PENDING').length,
    confirmed: appointments.filter((a: any) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a: any) => a.status === 'COMPLETED').length,
    cancelled: appointments.filter((a: any) => a.status === 'CANCELLED').length,
  }), [appointments]);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(dateRef.current);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
    dateRef.current = newDate;
    setCurrentDate(newDate);
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      await fetch('/api/appointments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      refreshAppointments();
      toast.success('Updated');
    } catch { toast.error('Failed'); }
  }, [refreshAppointments]);

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isLoading) return <TableSkeleton rows={5} />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-xs text-white/50">Total</div><div className="text-xl font-bold text-white">{stats.total}</div></div>
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20"><div className="text-xs text-green-400/60">Confirmed</div><div className="text-xl font-bold text-green-400">{stats.confirmed}</div></div>
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"><div className="text-xs text-yellow-400/60">Pending</div><div className="text-xl font-bold text-yellow-400">{stats.pending}</div></div>
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"><div className="text-xs text-red-400/60">Cancelled</div><div className="text-xl font-bold text-red-400">{stats.cancelled}</div></div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateDate('prev')} className="p-2 rounded-lg hover:bg-white/10 text-white/60">◀</button>
          <span className="text-sm text-white">{formatDate(currentDate)}</span>
          <button onClick={() => navigateDate('next')} className="p-2 rounded-lg hover:bg-white/10 text-white/60">▶</button>
          <Button onClick={refreshAppointments} disabled={isRefreshing} size="sm" className="btn-secondary text-xs px-2">{isRefreshing ? '⟳' : '↻'}</Button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded text-sm ${viewMode === 'list' ? 'bg-[#C73E1D] text-white' : 'bg-white/10 text-white/70'}`}>List</button>
          <button onClick={() => setViewMode('calendar')} className={`px-3 py-2 rounded text-sm ${viewMode === 'calendar' ? 'bg-[#C73E1D] text-white' : 'bg-white/10 text-white/70'}`}>Calendar</button>
        </div>
      </div>

      {/* List */}
      {viewMode === 'list' && (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {appointments.length === 0 ? <div className="text-center py-12 text-white/40">No appointments</div> : appointments.map((apt: any) => (
            <div key={apt.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between mb-1">
                <div className="font-bold text-white">{formatTime(apt.dateTime)}</div>
                <span className={`px-2 py-0.5 rounded text-xs ${apt.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : apt.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'}`}>{apt.status}</span>
              </div>
              <div className="text-sm text-white/70">👤 {apt.patient?.firstName} {apt.patient?.lastName}</div>
              <div className="text-xs text-white/50">🦷 {apt.service?.name} • {settings.currencySymbol}{apt.service?.price}</div>
              <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-xs text-white/40">Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</span>
                <select value={apt.status} onChange={(e) => handleStatusChange(apt.id, e.target.value)} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/70">
                  <option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar */}
      {viewMode === 'calendar' && (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden max-h-[50vh] overflow-y-auto">
          {Array.from({ length: 10 }, (_, i) => {
            const hour = i + 9;
            const hourApts = appointments.filter((apt: any) => new Date(apt.dateTime).getHours() === hour);
            return (
              <div key={hour} className="flex border-b border-white/5">
                <div className="w-14 p-2 text-xs text-white/50 border-r border-white/5">{hour}:00</div>
                <div className="flex-1 p-2 min-h-[50px]">
                  {hourApts.map((apt: any) => (
                    <div key={apt.id} className="px-2 py-1 rounded bg-[#C73E1D]/20 border border-[#FF8C42]/30 mb-1">
                      <div className="text-xs text-white">{apt.patient?.firstName} {apt.patient?.lastName}</div>
                      <div className="text-xs text-white/50">{apt.service?.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
