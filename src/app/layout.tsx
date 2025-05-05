import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Removed Geist_Mono
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed geistMono

export const metadata: Metadata = {
  title: 'PriceLens: Price Elasticity Analysis',
  description: 'Analyze price elasticity of demand with PriceLens.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply font variable directly to body */}
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
