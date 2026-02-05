'use client';

import React from 'react';

/**
 * Провайдеры приложения (MobX, тема и т.д.).
 * Подключи сюда MobX Provider при необходимости.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
