import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - PRD Creator',
  description: 'You are currently offline. Some features may not be available.',
  robots: 'noindex, nofollow'
};

export default function OfflineLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
