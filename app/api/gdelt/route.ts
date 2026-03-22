import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'ECON_TRADE OR REBELLION';
  
  try {
    // The GDELT Geo API endpoint
    const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${encodeURIComponent(query)}&format=json&timespan=24h&maxrows=100`;
    
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        response = await fetch(url, {
          next: { revalidate: 300 } // Cache for 5 minutes
        });
        if (response.ok) break;
      } catch (e) {
        attempts++;
        if (attempts >= maxAttempts) throw e;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
      attempts++;
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'No response';
      return NextResponse.json({ error: `GDELT API Error: ${response ? response.status : 'Fetch Failed'} ${errorText}` }, { status: response ? response.status : 502 });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('GDELT API returned non-JSON response:', text);
      return NextResponse.json({ error: 'GDELT API returned invalid content type' }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GDELT Proxy Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
