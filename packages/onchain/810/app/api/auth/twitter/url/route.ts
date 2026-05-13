import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const appUrl = process.env.APP_URL || request.nextUrl.origin;
  const redirectUri = `${appUrl}/api/auth/twitter/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'TWITTER_CLIENT_ID not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'tweet.read users.read',
    state: 'state', // In a real app, use a random string and verify it
    code_challenge: 'challenge', // In a real app, use PKCE
    code_challenge_method: 'plain',
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

  return NextResponse.json({ url: authUrl });
}
