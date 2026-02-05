import { headers } from 'next/headers';
import React from 'react';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isAdmin = pathname.startsWith('/admin');

  // Payload RootLayout рендерит свой <html> и <body> — не оборачиваем, иначе вложенность
  if (isAdmin) {
    return children;
  }

  return (
    <html lang="ru" suppressHydrationWarning className="font-sans">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
