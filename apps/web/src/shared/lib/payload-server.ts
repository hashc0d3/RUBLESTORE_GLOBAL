/**
 * Payload Local API для серверных компонентов (RSC).
 * Не делает HTTP-запрос к себе — исключает ошибки после перезапуска контейнера.
 */
import { getPayload } from 'payload';
import config from '@payload-config';

const configPromise = Promise.resolve(config);

export async function getPayloadServer() {
  return getPayload({ config: await configPromise });
}
