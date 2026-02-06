import type { Metadata } from 'next';
import { getPayloadServer } from '@/shared/lib/payload-server';
import { parseCategories } from '@/shared/dto';
import type { Category } from '@/entities/category';
import { LayoutClient } from '@/shared/ui/LayoutClient';
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
  const categories = parseCategories(categoriesRes.docs) as Category[];

  return <LayoutClient categories={categories}>{children}</LayoutClient>;
}
