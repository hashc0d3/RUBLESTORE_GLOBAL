import path from 'path';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'ruble-store-dev-secret-key-32-chars-minimum',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  routes: {
    admin: '/admin',
    api: '/api',
  },
  admin: {
    meta: {
      titleSuffix: ' — RubleStore',
    },
    // Избегает ошибки гидрации, когда тема/локаль отличаются между сервером и клиентом
    suppressHydrationWarning: true,
    // Путь к importMap — админка в app/admin, не в (payload)/admin
    importMap: {
      importMapFile: path.resolve(process.cwd(), 'app', 'admin', 'importMap.js'),
    },
  },
  collections: [
    {
      slug: 'categories',
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'slug'],
      },
      access: {
        read: () => true, // публичное чтение категорий для каталога
        create: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
        delete: ({ req }) => Boolean(req.user),
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Название',
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'URL-friendly identifier (например: electronics, clothing)',
          },
          label: 'Slug',
        },
      ],
    },
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      slug: 'products',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'category', 'status'],
      },
      access: {
        read: () => true, // публичное чтение товаров для витрины
        create: ({ req }) => Boolean(req.user), // в админке — только авторизованные
        update: ({ req }) => Boolean(req.user),
        delete: ({ req }) => Boolean(req.user),
      },
      hooks: {
        afterRead: [
          async ({ doc, req }) => {
            if (!req) return doc;
            try {
              const anyReq = req as any;
              if (!anyReq._mediaUrlCache) {
                anyReq._mediaUrlCache = new Map<number, string | null>();
              }
              const cache: Map<number, string | null> = anyReq._mediaUrlCache;
              const colors = (doc as any).colors;
              if (Array.isArray(colors)) {
                for (const row of colors) {
                  const imgs = row?.images;
                  if (!Array.isArray(imgs)) continue;
                  for (const img of imgs) {
                    if (img.imageUrl) continue;
                    const imageId =
                      typeof img.image === 'number'
                        ? img.image
                        : img.image?.id ?? undefined;
                    if (!imageId) continue;
                    if (!cache.has(imageId)) {
                      try {
                        const media = await req.payload.findByID({
                          collection: 'media',
                          id: imageId,
                          depth: 0,
                        });
                        cache.set(imageId, media?.url ?? null);
                      } catch {
                        cache.set(imageId, null);
                      }
                    }
                    const url = cache.get(imageId);
                    if (url) img.imageUrl = url;
                  }
                }
              }
              return doc;
            } catch {
              return doc;
            }
          },
        ],
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Название',
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'URL-friendly identifier',
          },
          label: 'Slug',
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
          label: 'Категория',
          admin: {
            description: 'К какой категории относится товар',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание',
        },
        {
          name: 'status',
          type: 'select',
          label: 'Статус',
          options: [
            { label: 'Черновик', value: 'draft' },
            { label: 'Опубликован', value: 'published' },
          ],
          defaultValue: 'draft',
        },
        {
          name: 'storage',
          type: 'select',
          label: 'Объём памяти',
          admin: {
            description: 'Варианты: 256GB, 512GB, 1024GB, 2048GB',
          },
          options: [
            { label: '256GB', value: '256GB' },
            { label: '512GB', value: '512GB' },
            { label: '1024GB', value: '1024GB' },
            { label: '2048GB', value: '2048GB' },
          ],
        },
        {
          type: 'collapsible',
          label: 'Цвета',
          admin: {
            description: 'Варианты по цвету: название, блок «Страна производителя» (страна + цена) и изображения.',
          },
          fields: [
            {
              name: 'colors',
              type: 'array',
              label: 'Цвета',
              fields: [
                {
                  name: 'color',
                  type: 'text',
                  required: true,
                  label: 'Цвет',
                },
                {
                  type: 'collapsible',
                  label: 'Страна производителя',
                  admin: {
                    description: 'Страна производства. У каждой страны — блок «Тип SIM» с вариантами SIM и ценой.',
                  },
                  fields: [
                    {
                      name: 'manufacturerCountries',
                      type: 'array',
                      label: 'Страна производителя',
                      fields: [
                        {
                          name: 'country',
                          type: 'text',
                          required: true,
                          label: 'Страна',
                        },
                        {
                          type: 'collapsible',
                          label: 'Тип SIM',
                          admin: {
                            description: 'Варианты типа SIM и цена для этой страны.',
                          },
                          fields: [
                            {
                              name: 'simTypes',
                              type: 'array',
                              label: 'Тип SIM',
                              fields: [
                                {
                                  name: 'simType',
                                  type: 'select',
                                  required: true,
                                  label: 'Тип SIM',
                                  options: [
                                    { label: 'SIM+eSIM', value: 'sim-esim' },
                                    { label: 'eSIM', value: 'esim' },
                                    { label: 'Dual SIM', value: 'dual-sim' },
                                  ],
                                },
                                {
                                  name: 'price',
                                  type: 'number',
                                  required: true,
                                  min: 0,
                                  label: 'Цена',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'images',
                  type: 'array',
                  label: 'Изображения',
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                    {
                      name: 'alt',
                      type: 'text',
                      label: 'Alt',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'media',
      access: {
        read: () => true, // публичное чтение файлов для витрины
        create: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
        delete: ({ req }) => Boolean(req.user),
      },
      upload: {
        staticDir: 'media',
        mimeTypes: ['image/*'],
        imageSizes: [
          { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
          { name: 'card', width: 768, height: 576, position: 'centre' },
          { name: 'hero', width: 1920, height: 1080, position: 'centre' },
        ],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
  ],
  db: postgresAdapter({
    // push: false при PAYLOAD_DISABLE_PUSH=true (только миграции)
    push: process.env.PAYLOAD_DISABLE_PUSH !== 'true',
    pool: {
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
    },
  }),
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src', 'payload-types.ts'),
  },
});
