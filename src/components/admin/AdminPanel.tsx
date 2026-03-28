'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  CreditCard,
  Briefcase,
  MessageSquare,
  Menu,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminPatients } from './AdminPatients';
import { AdminAppointments } from './AdminAppointments';
import { AdminServices } from './AdminServices';
import { AdminStaff } from './AdminStaff';
import { AdminBilling } from './AdminBilling';
import { AdminSettings } from './AdminSettings';
import { AdminMessages } from './AdminMessages';

type ViewType = 'dashboard' | 'patients' | 'appointments' | 'services' | 'staff' | 'billing' | 'messages' | 'settings';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarContentProps {
  isMobile?: boolean;
  sidebarCollapsed?: boolean;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onClose: () => void;
  onCollapse?: () => void;
  onMobileClose?: () => void;
}

// Sidebar content component defined outside to avoid lint issues
function SidebarContent({ 
  isMobile = false, 
  sidebarCollapsed = false, 
  currentView, 
  onViewChange, 
  onClose,
  onCollapse,
  onMobileClose 
}: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="p-4 md:p-6 flex items-center justify-between">
        {(!sidebarCollapsed || isMobile) && (
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C42] to-[#C73E1D] rounded-lg rotate-45 transform" />
              <div className="absolute inset-1 bg-[#2D0A05] rounded-md rotate-45 transform" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm md:text-lg">D</span>
            </div>
            <span className="text-lg md:text-xl font-semibold text-white">Admin</span>
          </div>
        )}
        {/* Desktop collapse button */}
        {!isMobile && onCollapse && (
          <button
            onClick={onCollapse}
            className="hidden md:flex p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
        {/* Mobile close button */}
        {isMobile && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onViewChange(item.id as ViewType);
              if (isMobile && onMobileClose) {
                onMobileClose();
              }
            }}
            className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all text-left ${
              currentView === item.id
                ? 'bg-[#C73E1D] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} />
            {(!sidebarCollapsed || isMobile) && <span className="text-sm md:text-base">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-white/10">
        <button
          onClick={onClose}
          className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut size={20} />
          {(!sidebarCollapsed || isMobile) && <span className="text-sm md:text-base">Exit Admin</span>}
        </button>
      </div>
    </>
  );
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function AdminPanelContent({ onClose }: { onClose: () => void }) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        const unread = (Array.isArray(data) ? data : []).filter((m: { status: string }) => m.status === 'unread').length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'patients':
        return <AdminPatients />;
      case 'appointments':
        return <AdminAppointments />;
      case 'services':
        return <AdminServices />;
      case 'staff':
        return <AdminStaff />;
      case 'messages':
        return <AdminMessages />;
      case 'billing':
        return <AdminBilling />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className="relative w-full h-full bg-gradient-to-br from-[#1a0a05] via-[#2D0A05] to-[#1a0502] flex overflow-hidden"
    >
      {/* Desktop Sidebar - Hidden on mobile */}
      <motion.div
        animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
        className="hidden md:flex relative h-full bg-black/30 border-r border-white/10 flex-col"
      >
        <SidebarContent
          sidebarCollapsed={sidebarCollapsed}
          currentView={currentView}
          onViewChange={setCurrentView}
          onClose={onClose}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-black/95 border-r border-white/10 flex flex-col z-50 md:hidden"
            >
              <SidebarContent
                isMobile
                currentView={currentView}
                onViewChange={setCurrentView}
                onClose={onClose}
                onMobileClose={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 md:h-16 border-b border-white/10 flex items-center justify-between px-3 md:px-6 bg-black/20 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white md:hidden flex-shrink-0"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base md:text-xl font-semibold text-white capitalize truncate">
              {currentView}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Search - Hidden on small mobile */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 md:w-64 pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF8C42]/50 text-sm"
              />
            </div>

            {/* Notifications */}
            <button 
              onClick={() => setCurrentView('messages')}
              className="relative p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-[#FF8C42] rounded-full text-xs text-white flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-3 md:p-6">
          {renderContent()}
        </main>
      </div>
    </motion.div>
  );
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel Content - using key to reset state when opened */}
          <AdminPanelContent key="admin-panel" onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
