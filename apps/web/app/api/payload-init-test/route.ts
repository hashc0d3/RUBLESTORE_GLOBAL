import { getPayload } from 'payload';
import config from '@payload-config';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function GET() {
  const start = Date.now();
  try {
    const payload = await getPayload({ config });
    const elapsed = Date.now() - start;
    return NextResponse.json({
      status: 'ok',
      payloadInitMs: elapsed,
      collections: Object.keys(payload.config.collections),
    });
  } catch (err) {
    const elapsed = Date.now() - start;
    return NextResponse.json(
      {
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        elapsedMs: elapsed,
      },
      { status: 500 }
    );
  }
}
