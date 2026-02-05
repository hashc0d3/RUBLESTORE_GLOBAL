'use client';

import Link from 'next/link';

/**
 * Домашняя страница (FSD: views — композиция виджетов и фич).
 */
export function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
          RubleStore
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Интернет-магазин на Next.js + NestJS + Payload + PostgreSQL
        </p>
      </header>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link
          href="/admin"
          className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Админ-панель (Payload)
        </Link>
      </nav>
    </main>
  );
}
