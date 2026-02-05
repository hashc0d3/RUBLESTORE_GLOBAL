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
    <footer className="w-full border-t border-neutral-200 bg-neutral-100 py-6 text-neutral-600">
      <div className="mx-auto flex max-w-6xl flex-col flex-wrap items-center justify-between gap-4 px-4 text-sm md:flex-row">
        <span className="shrink-0">
          © {year} RubleStore. Все права защищены.
        </span>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
          aria-label="Дополнительные ссылки"
        >
          {FOOTER_LINKS.map((item, index) => (
            <span key={item.href} className="flex items-center gap-x-2">
              {index > 0 && <span aria-hidden className="text-neutral-400">|</span>}
              <Link
                href={item.href}
                className="hover:text-neutral-900 hover:underline"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
        <span className="shrink-0">Россия</span>
      </div>
    </footer>
  );
}
