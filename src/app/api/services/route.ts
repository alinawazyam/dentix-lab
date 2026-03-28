import { NextResponse } from 'next/server';
import { servicesApi } from '@/lib/google-sheets';

// GET - Fetch all services
export async function GET() {
  try {
    const services = await servicesApi.getAll();
    
    // Convert types
    const formattedServices = services.map((s) => ({
      ...s,
      price: parseFloat(String(s.price)) || 0,
      duration: parseInt(String(s.duration)) || 0,
      isActive: true,
      featured: false,
    }));
    
    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json([]);
  }
}

// POST - Create new service
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const data = {
      name: body.name,
      description: body.description || '',
      price: body.price || 0,
      duration: body.duration || 60,
      category: body.category || 'PREVENTIVE',
    };
    
    const result = await servicesApi.create(data);
    
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

// PUT - Update service
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await servicesApi.update(id, data);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE - Delete service
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await servicesApi.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
