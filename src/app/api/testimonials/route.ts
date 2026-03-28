import { NextResponse } from 'next/server';
import { testimonialsApi } from '@/lib/google-sheets';

// GET - Fetch all testimonials
export async function GET() {
  try {
    const testimonials = await testimonialsApi.getApproved();
    
    const formattedTestimonials = testimonials.map((t) => ({
      ...t,
      rating: parseInt(String(t.rating)) || 5,
      comment: t.review,
      avatar: t.photo || '',
    }));
    
    return NextResponse.json(formattedTestimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json([]);
  }
}

// POST - Create new testimonial
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const data = {
      patientName: body.patientName,
      rating: body.rating || 5,
      review: body.comment || body.review || '',
      photo: body.avatar || body.photo || '',
      approved: body.approved || false,
    };
    
    const result = await testimonialsApi.create(data);
    
    if (result) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

// PUT - Update testimonial (approve/unapprove)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    // Map comment to review
    if (data.comment) {
      data.review = data.comment;
    }
    
    const success = await testimonialsApi.update(id, data);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE - Delete testimonial
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const success = await testimonialsApi.delete(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
