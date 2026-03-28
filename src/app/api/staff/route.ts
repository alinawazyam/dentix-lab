import { NextResponse } from 'next/server';
import { doctorsApi } from '@/lib/google-sheets';

// GET - Fetch all staff (same as doctors)
export async function GET() {
  try {
    const staff = await doctorsApi.getAll();
    
    const formattedStaff = staff.map((s) => ({
      ...s,
      firstName: s.name?.split(' ')[0] || '',
      lastName: s.name?.split(' ').slice(1).join(' ') || '',
      avatar: s.photo || '',
      isActive: true,
    }));
    
    return NextResponse.json(formattedStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json([]);
  }
}

// POST - Create new staff
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const data = {
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      email: body.email || '',
      phone: body.phone || '',
      specialization: body.specialization || 'General Dentist',
      photo: body.photo || body.avatar || '',
      availability: body.availability || 'Mon-Fri 9AM-5PM',
    };
    
    console.log('Creating doctor with data:', data);
    
    const result = await doctorsApi.create(data);
    
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

// PUT - Update staff
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    // Map fields for Google Sheets
    const updateData: Record<string, string> = {};
    
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.specialization) updateData.specialization = data.specialization;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.avatar !== undefined) updateData.photo = data.avatar;
    if (data.availability) updateData.availability = data.availability;
    
    // Handle firstName/lastName mapping
    if (data.firstName || data.lastName) {
      updateData.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    }
    
    console.log('Updating doctor:', id, 'with data:', updateData);
    
    const success = await doctorsApi.update(id, updateData);
    
    return NextResponse.json({ success, data: updateData });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

// DELETE - Delete staff
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
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
