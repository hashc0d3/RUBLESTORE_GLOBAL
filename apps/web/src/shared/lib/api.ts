/**
 * Payload REST API client (используется для запросов к CMS).
 */
const PAYLOAD_API =
  typeof window !== 'undefined'
    ? '/api'
    : process.env.PAYLOAD_PUBLIC_SERVER_URL
      ? `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api`
      : 'http://localhost:3000/api';

export interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export async function fetchPayload<T>(
  collection: string,
  params?: {
    where?: Record<string, unknown>;
    depth?: number;
    limit?: number;
    page?: number;
  }
): Promise<PayloadResponse<T>> {
  const searchParams = new URLSearchParams();
  if (params?.depth != null) searchParams.set('depth', String(params.depth));
  if (params?.limit != null) searchParams.set('limit', String(params.limit));
  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.where) {
    Object.entries(params.where).forEach(([key, val]) => {
      const v = val as Record<string, unknown>;
      Object.entries(v).forEach(([op, value]) => {
        searchParams.set(`where[${key}][${op}]`, String(value));
      });
    });
  }
  const url = `${PAYLOAD_API}/${collection}?${searchParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Payload API error: ${res.status}${body ? ` — ${body}` : ''}`);
  }
  return res.json();
}

export async function fetchPayloadById<T>(
  collection: string,
  id: string | number,
  params?: { depth?: number }
): Promise<T> {
  const searchParams = new URLSearchParams();
  if (params?.depth != null) searchParams.set('depth', String(params.depth));
  const qs = searchParams.toString();
  const url = `${PAYLOAD_API}/${collection}/${id}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Payload API error: ${res.status}${body ? ` — ${body}` : ''}`);
  }
  return res.json();
}
