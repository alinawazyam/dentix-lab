'use client';

import { useState, useMemo, useCallback } from 'react';
import { DollarSign, Clock, CheckCircle, AlertCircle, XCircle, RefreshCw, CreditCard, Plus } from 'lucide-react';
import { useAdminData } from '@/lib/admin-context';
import { useSettings } from '@/lib/settings-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const statusConfig: Record<string, { color: string; bg: string }> = {
  PENDING: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  PAID: { color: 'text-green-400', bg: 'bg-green-500/20' },
  OVERDUE: { color: 'text-red-400', bg: 'bg-red-500/20' },
  CANCELLED: { color: 'text-white/40', bg: 'bg-white/10' },
};

export function AdminBilling() {
  const { invoices, patients, isLoading, isRefreshing, refreshInvoices } = useAdminData();
  const { settings } = useSettings();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ patientId: '', amount: '', tax: '0', discount: '0' });

  const stats = useMemo(() => ({
    total: invoices.length,
    paid: invoices.filter((i: any) => i.status === 'PAID').length,
    pending: invoices.filter((i: any) => i.status === 'PENDING').length,
    overdue: invoices.filter((i: any) => i.status === 'OVERDUE').length,
    revenue: invoices.filter((i: any) => i.status === 'PAID').reduce((sum: number, i: any) => sum + (i.total || 0), 0),
  }), [invoices]);

  const filtered = useMemo(() => filterStatus === 'all' ? invoices : invoices.filter((i: any) => i.status === filterStatus), [invoices, filterStatus]);

  const formatCurrency = useCallback((amount: number) => `${settings.currencySymbol}${amount.toLocaleString()}`, [settings.currencySymbol]);

  const handlePayment = useCallback(async () => {
    if (!selectedInvoice) return;
    try {
      await fetch('/api/invoices', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedInvoice.id, status: 'PAID', paidAt: new Date().toISOString() }) });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      refreshInvoices();
    } catch { toast.error('Failed'); }
  }, [selectedInvoice, refreshInvoices]);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      await fetch('/api/invoices', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      refreshInvoices();
    } catch {}
  }, [refreshInvoices]);

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-white/60">Loading...</div></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Paid', value: stats.paid, color: 'text-green-400' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-400' },
          { label: 'Revenue', value: formatCurrency(stats.revenue), color: 'text-[#FF8C42]' },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-white/50">{s.label}</div>
            <div className={`text-lg font-bold ${s.color || 'text-white'}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm">
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        <div className="flex gap-2">
          <Button onClick={refreshInvoices} disabled={isRefreshing} size="sm" className="btn-secondary"><RefreshCw className={isRefreshing ? 'animate-spin' : ''} /></Button>
          <Button onClick={() => setShowCreateModal(true)} size="sm" className="btn-primary"><Plus className="w-4 h-4 mr-2" />Create</Button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {filtered.map((inv: any) => (
          <div key={inv.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-white text-sm">{inv.invoiceNumber || inv.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig[inv.status]?.bg} ${statusConfig[inv.status]?.color}`}>{inv.status}</span>
            </div>
            <div className="text-sm text-white/70">{inv.patient?.firstName} {inv.patient?.lastName}</div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
              <span className="text-lg font-bold text-[#FF8C42]">{formatCurrency(inv.total)}</span>
              <div className="flex gap-1">
                {inv.status === 'PENDING' && <Button onClick={() => { setSelectedInvoice(inv); setShowPaymentModal(true); }} size="sm" className="btn-primary text-xs px-2"><CreditCard className="w-3 h-3" /></Button>}
                <select value={inv.status} onChange={(e) => handleStatusChange(inv.id, e.target.value)} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/70">
                  <option value="PENDING">Pending</option><option value="PAID">Paid</option><option value="OVERDUE">Overdue</option><option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-[#2D0A05] rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Record Payment</h3>
            <div className="p-4 rounded bg-white/5 mb-4">
              <div className="text-xs text-white/50">Invoice</div>
              <div className="text-2xl font-bold text-[#FF8C42]">{formatCurrency(selectedInvoice.total)}</div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowPaymentModal(false)} className="flex-1 btn-secondary">Cancel</Button>
              <Button onClick={handlePayment} className="flex-1 btn-primary">Confirm Payment</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#2D0A05] rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Create Invoice</h3>
            <div className="space-y-3">
              <select value={newInvoice.patientId} onChange={(e) => setNewInvoice({ ...newInvoice, patientId: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm">
                <option value="">Select Patient</option>
                {patients.map((p: any) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
              <input placeholder="Amount" type="number" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm" />
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary">Cancel</Button>
              <Button onClick={async () => { await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: newInvoice.patientId, amount: parseFloat(newInvoice.amount) || 0 }) }); setShowCreateModal(false); refreshInvoices(); toast.success('Created'); }} className="flex-1 btn-primary">Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
