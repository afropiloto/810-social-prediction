import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles
import PwaRegistration from '@/components/PwaRegistration';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: '810 - Social Prediction Markets',
  description: 'Trade on social outcomes with verified data.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '810',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="bg-bg text-ink font-sans selection:bg-accent selection:text-black">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <PortfolioProvider>
            <PwaRegistration />
            {children}
          </PortfolioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
