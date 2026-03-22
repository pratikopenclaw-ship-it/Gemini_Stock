import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'ECON_TRADE OR REBELLION';
  
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${encodeURIComponent(query)}&format=json&timespan=24h&maxrows=100`;
      
      console.log(`GDELT Proxy: Fetching ${url} (Attempt ${attempt + 1})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      const response = await fetch(url, {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GDELT API Error (Attempt ${attempt + 1}): ${response.status} ${errorText}`);
        
        // If it's a 5xx error, we might want to retry
        if (response.status >= 500 && attempt < maxRetries) {
          lastError = new Error(`GDELT API Error: ${response.status}`);
          continue;
        }

        return NextResponse.json({ 
          error: `GDELT API Error: ${response.status}`,
          details: errorText.substring(0, 200)
        }, { status: response.status });
      }

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('GDELT API returned non-JSON response:', text.substring(0, 200));
        
        if (attempt < maxRetries) {
          lastError = new Error('Non-JSON response');
          continue;
        }

        return NextResponse.json({ 
          error: 'GDELT API returned invalid content type',
          contentType: contentType,
          preview: text.substring(0, 100)
        }, { status: 502 });
      }

      try {
        const data = await response.json();
        return NextResponse.json(data);
      } catch (parseError) {
        console.error('GDELT Proxy: Failed to parse JSON:', parseError);
        if (attempt < maxRetries) {
          lastError = parseError;
          continue;
        }
        return NextResponse.json({ 
          error: 'Failed to parse GDELT API response as JSON',
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }, { status: 502 });
      }
    } catch (error) {
      console.error(`GDELT Proxy Attempt ${attempt + 1} Fatal Error:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  // If we reach here, all retries failed
  return NextResponse.json({ 
    error: 'Internal Server Error after retries',
    details: lastError instanceof Error ? lastError.message : String(lastError)
  }, { status: 500 });
}
