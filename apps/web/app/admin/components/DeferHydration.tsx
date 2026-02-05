'use client';

import React, { useEffect, useState } from 'react';

/**
 * Рендерит children только после монтирования на клиенте.
 * Устраняет ошибку гидрации в Payload admin (разные ID на сервере и клиенте в array fields).
 */
export function DeferHydration({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-neutral-500">Загрузка админки…</span>
      </div>
    );
  }

  return <>{children}</>;
}
