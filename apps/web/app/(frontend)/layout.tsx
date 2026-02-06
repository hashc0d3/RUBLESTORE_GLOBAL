import type { Metadata } from 'next';
import { getPayloadServer } from '@/shared/lib/payload-server';
import type { Category } from '@/entities/category';
import { HeaderNavScroll } from '@/shared/ui/HeaderNavScroll';
import { Footer } from '@/shared/ui/Footer';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'RubleStore — техника Apple и аксессуары',
    template: '%s — RubleStore',
  },
  description:
    'RubleStore — интернет-магазин техники Apple: iPhone, Mac, Watch, AirPods и аксессуары.',
  openGraph: {
    siteName: 'RubleStore',
    locale: 'ru_RU',
  },
};

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getPayloadServer();
  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 100,
    depth: 0,
  });
  const categories = categoriesRes.docs as Category[];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 antialiased">
      <header className="sticky top-0 z-50 flex h-11 min-h-11 items-center py-0">
        <HeaderNavScroll categories={categories} />
      </header>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
