import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://data.bmkg.go.id/DataMKG/TEWS/${filename}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch shake map');
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Shake map proxy error:', error);
    // Return a fallback image
    const fallbackUrl = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2070&auto=format&fit=crop';
    const fallbackRes = await fetch(fallbackUrl);
    const fallbackBuffer = await fallbackRes.arrayBuffer();
    return new NextResponse(fallbackBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}
