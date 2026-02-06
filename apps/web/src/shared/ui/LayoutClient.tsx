'use client';

import { useState } from 'react';
import { HeaderNavScroll } from './HeaderNavScroll';
import { Footer } from './Footer';
import { CallButton } from './CallButton';
import type { Category } from '@/entities/category';

interface LayoutClientProps {
  categories: Category[];
  children: React.ReactNode;
}

export function LayoutClient({ categories, children }: LayoutClientProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 antialiased">
      <header className="sticky top-0 z-50 flex h-11 min-h-11 items-center py-0">
        <HeaderNavScroll
          categories={categories}
          onCartOpenChange={setIsCartOpen}
        />
      </header>
      <div className="flex-1">{children}</div>
      <Footer />
      <CallButton isCartOpen={isCartOpen} />
    </div>
  );
}
