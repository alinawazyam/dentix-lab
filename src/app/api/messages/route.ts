import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

async function fetchFromSheets<T>(action: string, sheet: string): Promise<T> {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('Google Script URL not configured');
  }
  
  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('sheet', sheet);
  
  const response = await fetch(url.toString());
  return response.json();
}

async function postToSheets<T>(action: string, sheet: string, body: Record<string, unknown>): Promise<T> {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('Google Script URL not configured');
  }
  
  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.set('action', action);
  url.searchParams.set('sheet', sheet);
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

// GET - Fetch all messages
export async function GET() {
  try {
    const result = await fetchFromSheets<{ success: boolean; data?: Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      subject: string;
      message: string;
      status: string;
      createdAt: string;
    }> }>('getAll', 'Messages');
    
    if (result.success && result.data) {
      // Sort by date, newest first
      const sorted = result.data.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
      return NextResponse.json(sorted);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json([]);
  }
}

// POST - Create new message (from contact form)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = await postToSheets<{ success: boolean; data?: unknown }>('create', 'Messages', {
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      subject: body.subject,
      message: body.message,
      status: 'unread',
    });
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Message sent successfully!' });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}

// PUT - Mark message as read
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.set('action', 'update');
    url.searchParams.set('sheet', 'Messages');
    url.searchParams.set('id', id);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status || 'read' }),
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

// DELETE - Delete message
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.set('action', 'delete');
    url.searchParams.set('sheet', 'Messages');
    url.searchParams.set('id', id);
    
    const response = await fetch(url.toString(), { method: 'POST' });
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
