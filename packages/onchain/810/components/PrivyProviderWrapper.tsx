'use client';

import React from 'react';
// import { PrivyProvider } from '@privy-io/react-auth';

/**
 * Privy Provider Wrapper (Cursor Ready)
 * 
 * Note: The actual import is commented out to prevent crashing the current AI Studio preview app.
 * When you pull this into Cursor, uncomment the import, and replace the fragment wrapper with the PrivyProvider.
 */
export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    // If we're in the AI Studio preview environment without an App ID, 
    // just render the children to avoid breaking the UI.
    console.warn("Privy App ID is missing. Rendering children without Privy context.");
    return <>{children}</>;
  }

  return (
    <>
      {/* 
        Uncomment this in Cursor once @privy-io/react-auth is installed.

        <PrivyProvider
          appId={appId}
          config={{
            loginMethods: ['email', 'wallet', 'google', 'twitter'],
            appearance: {
              theme: 'dark',
              accentColor: '#676FFF',
              logo: 'https://your-logo-url',
            },
            // Embedded wallets or other advanced configs:
            // embeddedWallets: {
            //   createOnLogin: 'all-users',
            // }
          }}
        >
          {children}
        </PrivyProvider>
      */}
      {children}
    </>
  );
}
