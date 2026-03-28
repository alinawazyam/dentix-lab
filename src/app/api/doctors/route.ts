import { NextResponse } from 'next/server';
import { doctorsApi } from '@/lib/google-sheets';

// GET - Fetch all doctors/staff
export async function GET() {
  try {
    const doctors = await doctorsApi.getAll();
    
    // Transform data for frontend - map 'avatar' to 'photo' for display
    const formattedDoctors = doctors.map((d) => ({
      ...d,
      name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
      photo: d.avatar || d.photo || '',
    }));
    
    return NextResponse.json(formattedDoctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json([]);
  }
}

// POST - Create new doctor/staff
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const data = {
      firstName: body.name?.split(' ')[0] || body.firstName || '',
      lastName: body.name?.split(' ').slice(1).join(' ') || body.lastName || '',
      email: body.email || '',
      phone: body.phone || '',
      specialization: body.specialization || 'General Dentist',
      avatar: body.photo || body.avatar || '',
      experience: body.experience || '10',
      isActive: 'true',
    };
    
    console.log('Creating doctor:', data);
    
    const result = await doctorsApi.create(data);
    
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
  }
}

// PUT - Update doctor/staff
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    // Prepare update data - use 'avatar' for Google Sheets
    const updateData: Record<string, string> = {};
    
    if (data.name) {
      updateData.firstName = data.name.split(' ')[0] || '';
      updateData.lastName = data.name.split(' ').slice(1).join(' ') || '';
    }
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.specialization) updateData.specialization = data.specialization;
    // Map photo to avatar for Google Sheets
    if (data.photo !== undefined) updateData.avatar = data.photo;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    
    console.log('Updating doctor:', id, updateData);
    
    const success = await doctorsApi.update(id, updateData);
    
    return NextResponse.json({ success, data: updateData });
  } catch (error) {
    console.error('Error updating doctor:', error);
    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
  }
}

// DELETE - Delete doctor/staff
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await doctorsApi.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 });
  }
}
