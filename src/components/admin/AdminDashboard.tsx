'use client';

import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAdminData } from '@/lib/admin-context';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/settings-store';

// Safe date formatting - returns null if invalid
function safeFormatDate(dateValue: string | undefined | null): Date | null {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;
  return date;
}

export function AdminDashboard() {
  const { patients, appointments, invoices, isLoading, isRefreshing, refreshAll } = useAdminData();
  const { settings } = useSettings();

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return {
      totalPatients: patients.length,
      todayAppointments: appointments.filter((a: any) => {
        if (!a.dateTime && !a.date) return false;
        const dateStr = a.date || (a.dateTime ? a.dateTime.split('T')[0] : null);
        return dateStr === todayStr && a.status !== 'CANCELLED';
      }).length,
      pendingAppointments: appointments.filter((a: any) => a.status === 'PENDING').length,
      totalRevenue: invoices.filter((i: any) => i.status === 'PAID').reduce((sum: number, i: any) => sum + (i.total || i.amount || 0), 0),
    };
  }, [patients, appointments, invoices]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-white/60">Loading...</div></div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Today's Appointments", value: stats.todayAppointments, color: '#FF8C42' },
          { label: 'Pending', value: stats.pendingAppointments, color: '#FFB088' },
          { label: 'Total Patients', value: stats.totalPatients, color: '#4ADE80' },
          { label: 'Revenue', value: `${settings.currencySymbol}${stats.totalRevenue.toLocaleString()}`, color: '#22D3EE' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-white/60 mb-1">{stat.label}</div>
            <div className="text-xl md:text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <h3 className="text-base font-semibold text-white mb-4">Recent Appointments</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {appointments.length === 0 ? (
            <div className="text-white/50 text-sm text-center py-4">No appointments yet</div>
          ) : (
            appointments.slice(0, 5).map((apt: any) => {
              const aptDate = safeFormatDate(apt.dateTime || apt.date);
              return (
                <div key={apt.id} className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">
                        {apt.patient?.firstName || apt.patientName?.split(' ')[0] || 'Unknown'} 
                        {apt.patient?.lastName || apt.patientName?.split(' ').slice(1).join(' ') || ''}
                      </div>
                      <div className="text-xs text-white/50">{apt.service?.name || apt.serviceName || 'Service'}</div>
                    </div>
                    <div className="text-xs text-white/50">
                      {aptDate ? aptDate.toLocaleTimeString() : (apt.time || '-')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Patients */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <h3 className="text-base font-semibold text-white mb-4">Recent Patients</h3>
        <div className="space-y-3">
          {patients.length === 0 ? (
            <div className="text-white/50 text-sm text-center py-4">No patients yet</div>
          ) : (
            patients.slice(0, 5).map((patient: any) => (
              <div key={patient.id} className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 rounded-full bg-[#C73E1D]/20 flex items-center justify-center text-white text-sm">
                  {patient.firstName?.[0] || patient.name?.[0] || '?'}{patient.lastName?.[0] || ''}
                </div>
                <div>
                  <div className="text-sm text-white">{patient.firstName || patient.name || 'Unknown'} {patient.lastName || ''}</div>
                  <div className="text-xs text-white/50">{patient.email || '-'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={refreshAll} disabled={isRefreshing} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh All Data'}
        </Button>
      </div>
    </div>
  );
}
