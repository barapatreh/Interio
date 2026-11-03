import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Interio - Luxury Architecture & Interior Contracting Platform',
  description: 'Complete ERP & CRM management system for Interior Design Firms.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#090d16]">
      <body className="h-full bg-[#090d16] text-slate-100 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
