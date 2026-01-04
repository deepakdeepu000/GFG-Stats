// app/api/stats/[username]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// FIX 1: Allow dots (.) in the regex. GFG usernames like "john.doe" failed before.
const usernameSchema = z.string()
  .min(3, 'Username too short')
  .max(50, 'Username too long')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Invalid username format');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const validatedUsername = usernameSchema.parse(username);

    // FIX 2: Use 127.0.0.1. "localhost" often fails in Node.js 18+ (fetches IPv6 ::1).
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
    
    // FIX 3: Forward the query parameters (like ?format=svg) to the backend.
    const searchParams = request.nextUrl.searchParams.toString();
    const endpoint = `${backendUrl}/stats/${validatedUsername}?${searchParams}`;

    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(30000), // 30s timeout
      cache: 'no-store', // Don't cache the proxy fetch itself to avoid stale data issues
    });

    // FIX 4: Handle 404s correctly. Don't throw an error, return the 404 response.
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend Error:', errorText);
      return NextResponse.json(
        { error: 'User not found or backend error' }, 
        { status: response.status }
      );
    }

    // FIX 5: Check Content-Type to support SVGs.
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('image/svg+xml')) {
      const svgBuffer = await response.arrayBuffer();
      return new NextResponse(svgBuffer, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=14400',
        },
      });
    }

    // Default JSON handling
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Next.js API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    // This is the error you were likely seeing (Connection Refused)
    return NextResponse.json({ error: 'Failed to connect to backend service' }, { status: 500 });
  }
}
