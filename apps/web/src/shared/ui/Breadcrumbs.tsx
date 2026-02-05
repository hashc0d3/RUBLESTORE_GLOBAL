'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  categoryName?: string;
  categorySlug?: string;
  productTitle?: string;
  /** Переопределить ссылку «Каталог» (например, с фильтрами возврата) */
  catalogHref?: string;
}

export function Breadcrumbs({
  items,
  categoryName,
  categorySlug,
  productTitle,
  catalogHref,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Не показываем на главной странице
  if (pathname === '/') {
    return null;
  }

  // Если переданы готовые items, используем их
  if (items) {
    return (
      <nav
        className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500"
        aria-label="Хлебные крошки"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-neutral-900">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-neutral-900' : ''}>
                  {item.label}
                </span>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </span>
          );
        })}
      </nav>
    );
  }

  // Автоматическое построение на основе pathname и props
  const catalogLink = catalogHref ?? '/catalog';
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Главная страница', href: '/' },
    { label: 'Каталог', href: catalogLink },
  ];

  if (categoryName) {
    breadcrumbs.push({
      label: categoryName,
      href: categorySlug && !catalogHref ? `/catalog?category=${encodeURIComponent(categorySlug)}` : catalogLink,
    });
  }

  if (productTitle) {
    breadcrumbs.push({
      label: productTitle,
    });
  }

  return (
    <nav
      className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500"
      aria-label="Хлебные крошки"
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-neutral-900">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-neutral-900' : ''}>
                {item.label}
              </span>
            )}
            {!isLast && <span aria-hidden="true">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
