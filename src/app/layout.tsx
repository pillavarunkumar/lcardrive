import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    default: 'LCarDrive | Find Your Perfect Driving Instructor',
    template: '%s | LCarDrive',
  },
  description:
    'Book professional driving lessons and pass your test with confidence. Search and compare qualified instructors in your area.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${plusJakartaSans.variable} ${inter.variable}`}
      >
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen flex flex-col bg-surface">
          {children}
          <div id="clerk-captcha" />
        </body>
      </html>
    </ClerkProvider>
  );
}