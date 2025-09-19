import { NextResponse } from 'next/server';
import { saveFeedback, updateUserProgress } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const newFeedback = await request.json();

    // Save feedback to MongoDB
    const savedFeedback = await saveFeedback(newFeedback);

    // Update user progress
    await updateUserProgress(newFeedback.studentEmail, newFeedback.tableId);

    return NextResponse.json({ 
      message: 'Feedback submitted successfully!',
      id: savedFeedback._id 
    }, { status: 201 });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ 
      message: 'Error submitting feedback.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}