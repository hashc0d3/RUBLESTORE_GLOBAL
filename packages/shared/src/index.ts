export const API_ROUTES = {
  products: '/products',
  health: '/health',
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];
