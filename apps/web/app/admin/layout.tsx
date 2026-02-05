import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts';
import config from '@payload-config';
import React from 'react';

import '@payloadcms/next/css';

import { DeferHydration } from './components/DeferHydration';
import { importMap } from './importMap';
import './custom.scss';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function serverFunction(args: {
  name: string;
  args: Record<string, unknown>;
}) {
  'use server';
  return handleServerFunctions({
    config,
    importMap,
    ...args,
  });
}

export default async function PayloadAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configPromise = Promise.resolve(config);
  return (
    <RootLayout
      config={configPromise}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      <DeferHydration>{children}</DeferHydration>
    </RootLayout>
  );
}
