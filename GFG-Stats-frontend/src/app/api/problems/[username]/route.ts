import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const usernameSchema = z.string()
  .min(3)
  .max(50)
  .regex(/^[a-zA-Z0-9_-]+$/);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { username } = await params;
    const validatedUsername = usernameSchema.parse(username);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    const response = await fetch(
      `${backendUrl}/problems/${validatedUsername}`,
      { signal: AbortSignal.timeout(60000) }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch problems');
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=7200',
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problems' },
      { status: 500 }
    );
  }
}