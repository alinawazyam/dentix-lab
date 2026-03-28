import { NextResponse } from 'next/server';
import { appointmentsApi, patientsApi, doctorsApi, servicesApi } from '@/lib/google-sheets';

// GET - Fetch all appointments (optimized with parallel fetching)
export async function GET() {
  try {
    // Fetch all data in PARALLEL - much faster!
    const [appointments, patients, doctors, services] = await Promise.all([
      appointmentsApi.getAll(),
      patientsApi.getAll(),
      doctorsApi.getAll(),
      servicesApi.getAll(),
    ]);
    
    // Create lookup maps
    const patientsMap = new Map(patients.map(p => [p.id, p]));
    const doctorsMap = new Map(doctors.map(d => [d.id, d]));
    const servicesMap = new Map(services.map(s => [s.id, s]));
    
    // Format appointments with related data
    const formattedAppointments = appointments.map((a) => {
      const patient = patientsMap.get(a.patientId);
      const doctor = doctorsMap.get(a.doctorId);
      const service = servicesMap.get(a.serviceId);
      
      return {
        ...a,
        patient: patient || null,
        doctor: doctor || null,
        service: service || null,
        duration: parseInt(String(a.time)) || 30,
      };
    });
    
    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json([]);
  }
}

// POST - Create new appointment (optimized)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Fetch related data in PARALLEL
    const [patients, doctors, services] = await Promise.all([
      patientsApi.getAll(),
      doctorsApi.getAll(),
      servicesApi.getAll(),
    ]);
    
    const patient = patients.find(p => p.id === body.patientId);
    const doctor = doctors.find(d => d.id === body.doctorId);
    const service = services.find(s => s.id === body.serviceId);
    
    const data = {
      patientId: body.patientId,
      patientName: patient?.name || body.patientName || '',
      doctorId: body.doctorId,
      doctorName: doctor?.name || body.doctorName || '',
      serviceId: body.serviceId,
      serviceName: service?.name || body.serviceName || '',
      date: body.date || body.dateTime?.split('T')[0] || '',
      time: body.time || body.dateTime?.split('T')[1]?.substring(0, 5) || '',
      status: body.status || 'PENDING',
      notes: body.notes || '',
    };
    
    const result = await appointmentsApi.create(data);
    
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

// PUT - Update appointment
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await appointmentsApi.update(id, data);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

// DELETE - Delete appointment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await appointmentsApi.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
