import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Политика конфиденциальности', href: '/privacy' },
  { label: 'Условия использования', href: '/terms' },
  { label: 'Продажи и возвраты', href: '/sales' },
  { label: 'Правовая информация', href: '/legal' },
  { label: 'Карта сайта', href: '/sitemap' },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#f5f5f7] border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-sm text-neutral-700">
        {/* left: brand + short description */}
        <div className="flex flex-col gap-3">
          <a href="/" className="inline-flex items-center gap-3 no-underline">
            <span className="text-lg font-semibold tracking-tight text-neutral-900">RubleStore</span>
          </a>
          <p className="text-xs text-neutral-500 max-w-[28rem]">
            Магазин техники и аксессуаров — лучшие предложения и быстрая доставка.
          </p>
        </div>

        {/* center: links */}
        <nav className="flex justify-center" aria-label="Ссылки в футере">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-neutral-700 hover:text-neutral-900 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 rounded-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* right: locale / small utilities */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-xs text-neutral-500">© {year} RubleStore</div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span>Россия</span>
            <span aria-hidden className="inline-block h-4 w-px bg-neutral-200" />
            <a
              href="/support"
              className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 rounded-sm"
            >
              Поддержка
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
