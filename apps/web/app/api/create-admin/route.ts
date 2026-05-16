import { getPayload } from 'payload';
import config from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';

const CREATE_ADMIN_SECRET =
  process.env.CREATE_ADMIN_SECRET ||
  process.env.SEED_SECRET ||
  'ruble-store-seed-dev-do-not-use-in-production';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  const email = request.nextUrl.searchParams.get('email');
  const password = request.nextUrl.searchParams.get('password');

  if (key !== CREATE_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Invalid or missing key' }, { status: 401 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Required query params: email, password' },
      { status: 400 },
    );
  }

  try {
    const payload = await getPayload({ config });

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data: { password },
      });
      return NextResponse.json({ ok: true, action: 'password_updated', email });
    }

    await payload.create({
      collection: 'users',
      data: { email, password, name: email.split('@')[0] },
    });

    return NextResponse.json({ ok: true, action: 'created', email });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
