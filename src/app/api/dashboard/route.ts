import { NextResponse } from 'next/server';
import { patientsApi, appointmentsApi, invoicesApi } from '@/lib/google-sheets';

export async function GET() {
  try {
    // Fetch all data in parallel
    const [patients, appointments, invoices] = await Promise.all([
      patientsApi.getAll(),
      appointmentsApi.getAll(),
      invoicesApi.getAll(),
    ]);
    
    // Calculate stats
    const totalPatients = patients.length;
    
    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const todayAppointments = appointments.filter((a) => {
      return a.date === todayStr && a.status !== 'CANCELLED';
    }).length;
    
    // This week's appointments
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekAppointments = appointments.filter((a) => {
      const apptDate = new Date(a.date);
      return apptDate >= weekStart && apptDate <= weekEnd && a.status !== 'CANCELLED';
    }).length;
    
    // Pending appointments
    const pendingAppointments = appointments.filter(
      (a) => a.status === 'PENDING'
    ).length;
    
    // Revenue calculations
    const totalRevenue = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (parseFloat(String(inv.amount)) || 0), 0);
    
    // This month's revenue
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = invoices
      .filter((inv) => {
        const paidDate = inv.paidDate ? new Date(inv.paidDate) : null;
        return inv.status === 'PAID' && paidDate && paidDate >= monthStart;
      })
      .reduce((sum, inv) => sum + (parseFloat(String(inv.amount)) || 0), 0);
    
    // Pending payments
    const pendingPayments = invoices
      .filter((inv) => inv.status === 'PENDING')
      .reduce((sum, inv) => sum + (parseFloat(String(inv.amount)) || 0), 0);
    
    // New patients this month
    const newPatientsThisMonth = patients.filter((p) => {
      const created = new Date(p.createdAt || '');
      return created >= monthStart;
    }).length;
    
    // Service popularity
    const serviceCount: Record<string, number> = {};
    appointments.forEach((a) => {
      const serviceId = a.serviceId;
      if (serviceId) {
        serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1;
      }
    });
    
    // Weekly appointments for chart (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = appointments.filter((a) => {
        return a.date === dateStr && a.status !== 'CANCELLED';
      }).length;
      
      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        appointments: count,
      });
    }
    
    // Monthly revenue for chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const revenue = invoices
        .filter((inv) => {
          const paidDate = inv.paidDate ? new Date(inv.paidDate) : null;
          return inv.status === 'PAID' && paidDate && paidDate >= monthDate && paidDate <= monthEnd;
        })
        .reduce((sum, inv) => sum + (parseFloat(String(inv.amount)) || 0), 0);
      
      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        revenue,
      });
    }
    
    // Appointment status distribution
    const statusDistribution = {
      PENDING: appointments.filter((a) => a.status === 'PENDING').length,
      CONFIRMED: appointments.filter((a) => a.status === 'CONFIRMED').length,
      COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
      CANCELLED: appointments.filter((a) => a.status === 'CANCELLED').length,
      NO_SHOW: appointments.filter((a) => a.status === 'NO_SHOW').length,
    };
    
    return NextResponse.json({
      // Main stats
      totalPatients,
      todayAppointments,
      weekAppointments,
      pendingAppointments,
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      newPatientsThisMonth,
      totalAppointments: appointments.length,
      totalInvoices: invoices.length,
      
      // Chart data
      weeklyAppointments: weeklyData,
      monthlyRevenueChart: monthlyData,
      statusDistribution,
      servicePopularity: serviceCount,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({
      totalPatients: 0,
      todayAppointments: 0,
      weekAppointments: 0,
      pendingAppointments: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingPayments: 0,
      newPatientsThisMonth: 0,
      totalAppointments: 0,
      totalInvoices: 0,
      weeklyAppointments: [],
      monthlyRevenueChart: [],
      statusDistribution: { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0 },
      servicePopularity: {},
    });
  }
}
