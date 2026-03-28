import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // No need to seed - using Google Sheets as database
    return NextResponse.json({ success: true, message: 'Using Google Sheets database' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: true, message: 'Skipped seeding' });
  }
}
