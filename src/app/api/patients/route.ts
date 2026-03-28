import { NextResponse } from 'next/server';
import { patientsApi } from '@/lib/google-sheets';

// GET - Fetch all patients
export async function GET() {
  try {
    const patients = await patientsApi.getAll();
    
    // Format patients for frontend compatibility
    const formattedPatients = patients.map((p) => ({
      ...p,
      firstName: p.name?.split(' ')[0] || '',
      lastName: p.name?.split(' ').slice(1).join(' ') || '',
    }));
    
    return NextResponse.json(formattedPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json([]);
  }
}

// POST - Create new patient
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const data = {
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      email: body.email,
      phone: body.phone || '',
      dateOfBirth: body.dateOfBirth || '',
      address: body.address || '',
      medicalHistory: body.medicalHistory || '',
    };
    
    const result = await patientsApi.create(data);
    
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

// PUT - Update patient
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    // Map firstName/lastName to name
    if (data.firstName || data.lastName) {
      data.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    }
    
    const success = await patientsApi.update(id, data);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

// DELETE - Delete patient
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await patientsApi.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
