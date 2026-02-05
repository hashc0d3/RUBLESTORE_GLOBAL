import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '560px',
        margin: '4rem auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        Админка: страница не найдена
      </h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Payload вызвал notFound() для этого маршрута. Часто это из‑за ошибки БД
        (нет таблиц) или неверного пути.
      </p>
      <p style={{ marginBottom: '1rem' }}>
        Убедись, что таблицы Payload созданы (миграции или push в dev):
      </p>
      <pre
        style={{
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '0.875rem',
        }}
      >
        cd apps/web && pnpm exec payload migrate:create{'\n'}
        pnpm exec payload migrate
      </pre>
      <Link
        href="/admin"
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#18181b',
          color: 'white',
          borderRadius: '6px',
          textDecoration: 'none',
        }}
      >
        На главную админки
      </Link>
    </div>
  );
}
