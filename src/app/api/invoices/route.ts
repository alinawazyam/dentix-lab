import { NextResponse } from 'next/server';
import { invoicesApi, patientsApi, doctorsApi, servicesApi, appointmentsApi } from '@/lib/google-sheets';

// GET - Fetch all invoices with caching
export async function GET() {
  try {
    // Fetch all data in parallel - cache will handle duplicates
    const [invoices, patients, appointments, services, doctors] = await Promise.all([
      invoicesApi.getAll(),
      patientsApi.getAll(),
      appointmentsApi.getAll(),
      servicesApi.getAll(),
      doctorsApi.getAll(),
    ]);
    
    // Create lookup maps for O(1) access
    const patientsMap = new Map(patients.map(p => [p.id, p]));
    const appointmentsMap = new Map(appointments.map(a => [a.id, a]));
    const servicesMap = new Map(services.map(s => [s.id, s]));
    const doctorsMap = new Map(doctors.map(d => [d.id, d]));
    
    // Format invoices with related data
    const formattedInvoices = invoices.map((inv) => {
      const patient = patientsMap.get(inv.patientId);
      const appointment = appointmentsMap.get(inv.appointmentId || '');
      const service = appointment ? servicesMap.get(appointment.serviceId) : null;
      const doctor = appointment ? doctorsMap.get(appointment.doctorId) : null;
      
      return {
        ...inv,
        amount: parseFloat(String(inv.amount)) || 0,
        invoiceNumber: inv.id,
        patient: patient || null,
        appointment: appointment ? {
          ...appointment,
          service: service || null,
          doctor: doctor || null,
        } : null,
      };
    });
    
    // Set cache headers for 30 seconds
    return NextResponse.json(formattedInvoices, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json([]);
  }
}

// POST - Create new invoice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const patients = await patientsApi.getAll();
    const patient = patients.find(p => p.id === body.patientId);
    
    const amount = parseFloat(body.amount) || 0;
    
    const data = {
      patientId: body.patientId,
      patientName: patient?.name || body.patientName || '',
      appointmentId: body.appointmentId || '',
      services: body.services || '',
      amount: amount,
      currency: body.currency || '$',
      status: body.status || 'PENDING',
      dueDate: body.dueDate || '',
      paidDate: body.paidAt || '',
    };
    
    const result = await invoicesApi.create(data);
    
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

// PUT - Update invoice
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await invoicesApi.update(id, data);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

// DELETE - Delete invoice
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await invoicesApi.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
