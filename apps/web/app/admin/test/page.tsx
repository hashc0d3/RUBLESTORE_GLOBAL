export const dynamic = 'force-dynamic';

export default function AdminTestPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin route works</h1>
      <p>If you see this, /admin/* is matched. Go to <a href="/admin">/admin</a> for Payload.</p>
    </div>
  );
}
