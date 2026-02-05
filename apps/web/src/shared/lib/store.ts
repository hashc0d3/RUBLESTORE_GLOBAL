import { makeAutoObservable } from 'mobx';

/**
 * Базовый класс для MobX-стора (пример).
 * Слои FSD: shared — переиспользуемые утилиты и конфиг.
 */
export function createStore<T extends object>(initial: T): T {
  return makeAutoObservable(initial);
}
