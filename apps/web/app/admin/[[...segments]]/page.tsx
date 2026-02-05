import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import config from '@payload-config';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { importMap } from '../importMap';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Props = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const generateMetadata = ({
  params,
  searchParams,
}: Props): Promise<Metadata> =>
  generatePageMetadata({
    config: Promise.resolve(config),
    params: params.then((p) => ({ segments: p.segments ?? [] })),
    searchParams: searchParams.then((s) =>
      Object.fromEntries(
        Object.entries(s ?? {}).filter(
          (e): e is [string, string | string[]] => e[1] !== undefined
        )
      )
    ) as Promise<{ [key: string]: string | string[] }>,
  });

export default async function PayloadAdminPage({
  params,
  searchParams,
}: Props) {
  const resolvedParams = await params;
  const segments = resolvedParams.segments ?? [];

  // Специальный случай: голый /admin → сразу ведём на список товаров
  if (segments.length === 0) {
    redirect('/admin/collections/products');
  }

  const rawSearch = await searchParams;
  const searchParamsResolved = Object.fromEntries(
    Object.entries(rawSearch ?? {}).filter(
      (entry): entry is [string, string | string[]] => entry[1] !== undefined
    )
  ) as { [key: string]: string | string[] };

  return (
    <RootPage
      config={Promise.resolve(config)}
      importMap={importMap}
      params={Promise.resolve({ segments })}
      searchParams={Promise.resolve(searchParamsResolved)}
    />
  );
}
