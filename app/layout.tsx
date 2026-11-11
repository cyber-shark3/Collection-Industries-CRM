import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Collection Industries | Business Intelligence CRM', description: 'Client relationships, sales operations and financial intelligence for Collection Industries.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
