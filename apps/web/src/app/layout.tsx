import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trelloban | Kanban Workspace',
  description: 'A Trello-inspired Kanban workspace for modern teams.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
