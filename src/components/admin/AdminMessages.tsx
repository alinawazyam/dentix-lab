'use client';

import { useState, useMemo } from 'react';
import { Mail, Phone, MessageSquare, RefreshCw, Trash2, Eye } from 'lucide-react';
import { useAdminData } from '@/lib/admin-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function AdminMessages() {
  const { messages, isLoading, isRefreshing, refreshMessages } = useAdminData();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const sorted = useMemo(() => [...messages].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [messages]);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/messages', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'read' }) });
      refreshMessages();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try {
      await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      refreshMessages();
    } catch { toast.error('Failed'); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-white/60">Loading...</div></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold text-white">Messages</h3>
        <Button onClick={refreshMessages} disabled={isRefreshing} size="sm" className="btn-secondary"><RefreshCw className={isRefreshing ? 'animate-spin' : ''} /></Button>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {sorted.length === 0 ? <div className="text-center py-12 text-white/40">No messages</div> : sorted.map((msg: any) => (
          <div key={msg.id} className={`p-4 rounded-xl bg-white/5 border ${msg.status === 'unread' ? 'border-yellow-500/30' : 'border-white/10'}`}>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-2">
                <MessageSquare className={`w-4 h-4 ${msg.status === 'unread' ? 'text-yellow-400' : 'text-white/50'}`} />
                <span className="font-medium text-white">{msg.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${msg.status === 'unread' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'}`}>{msg.status}</span>
            </div>
            <div className="flex gap-3 text-xs text-white/60 mb-2">
              <span>📧 {msg.email}</span>
              {msg.phone && <span>📞 {msg.phone}</span>}
            </div>
            <div className="text-sm text-white/60 line-clamp-2">{msg.message}</div>
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/10">
              <Button onClick={() => setSelectedMessage(msg)} size="sm" variant="outline" className="text-xs px-2"><Eye className="w-3 h-3" /></Button>
              {msg.status === 'unread' && <Button onClick={() => handleMarkRead(msg.id)} size="sm" className="text-xs px-2 btn-primary">Read</Button>}
              <Button onClick={() => handleDelete(msg.id)} size="sm" variant="outline" className="text-xs px-2 text-red-400"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMessage(null)}>
          <div className="bg-[#2D0A05] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">{selectedMessage.name}</h3>
            <p className="text-sm text-white/50 mb-4">{selectedMessage.email}</p>
            <div className="p-4 rounded-lg bg-white/5 text-white/80 whitespace-pre-wrap">{selectedMessage.message}</div>
            <Button onClick={() => setSelectedMessage(null)} className="w-full btn-secondary mt-4">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
