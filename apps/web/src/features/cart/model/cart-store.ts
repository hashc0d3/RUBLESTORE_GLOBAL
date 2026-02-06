'use client';

import { makeAutoObservable } from 'mobx';

export interface CartItem {
  id: string; // productId + variant (цвет/объём/тип SIM)
  productId: string;
  title: string;
  color?: string;
  storage?: string;
  simType?: string;
  price: number;
  quantity: number;
}

const STORAGE_KEY = 'ruble-store-cart';

export class CartStore {
  items: CartItem[] = [];
  isHydrated = false;

  constructor() {
    makeAutoObservable(this);
  }

  hydrate() {
    if (typeof window !== 'undefined' && !this.isHydrated) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          this.items = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse cart from localStorage', e);
        }
      }
      this.isHydrated = true;
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    }
  }

  private buildId(data: {
    productId: string;
    color?: string;
    storage?: string;
    simType?: string;
  }): string {
    return [
      data.productId,
      data.color ?? '',
      data.storage ?? '',
      data.simType ?? '',
    ].join('|');
  }

  add(
    data: {
      productId: string;
      title: string;
      color?: string;
      storage?: string;
      simType?: string;
      price: number;
    },
    quantity = 1
  ) {
    const id = this.buildId(data);
    const existing = this.items.find((i) => i.id === id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id,
        quantity,
        ...data,
      });
    }
    this.saveToStorage();
  }

  remove(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
    this.saveToStorage();
  }

  setQuantity(id: string, quantity: number) {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      if (quantity <= 0) this.remove(id);
      else {
        item.quantity = quantity;
        this.saveToStorage();
      }
    }
  }

  get totalItems() {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get totalPrice() {
    return this.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  }

  clear() {
    this.items = [];
    this.saveToStorage();
  }
}

export const cartStore = new CartStore();
