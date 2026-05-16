/**
 * Создать или обновить пароль админа Payload.
 * Запуск: pnpm --filter web admin:create -- rublestore@rublestore.ru 'пароль'
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: pnpm --filter web admin:create -- <email> <password>');
    process.exit(1);
  }

  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { password },
      overrideAccess: true,
    });
    console.log(`Пароль обновлён для: ${email}`);
  } else {
    await payload.create({
      collection: 'users',
      data: { email, password, name: email.split('@')[0] },
      overrideAccess: true,
    });
    console.log(`Пользователь создан: ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
