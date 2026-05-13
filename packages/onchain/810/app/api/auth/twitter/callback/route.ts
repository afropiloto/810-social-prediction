import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  // In a real app, exchange the code for tokens
  // const clientId = process.env.TWITTER_CLIENT_ID;
  // const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  // ... exchange logic ...

  // For this demo, we'll just return a success page that sends a message to the opener
  return new NextResponse(`
    <html>
      <body style="background: #0A0A0A; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <div style="text-align: center;">
          <h1 style="color: #CEFF00;">Success!</h1>
          <p>Your Twitter account has been connected.</p>
          <p>This window will close automatically.</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'TWITTER_AUTH_SUCCESS' }, '*');
            setTimeout(() => window.close(), 2000);
          } else {
            window.location.href = '/trading';
          }
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}
