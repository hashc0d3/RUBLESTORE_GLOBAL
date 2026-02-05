'use client';

import { makeAutoObservable } from 'mobx';

export interface CartItem {
  productId: string;
  quantity: number;
}

export class CartStore {
  items: CartItem[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  add(productId: string, quantity = 1) {
    const existing = this.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ productId, quantity });
    }
  }

  remove(productId: string) {
    this.items = this.items.filter((i) => i.productId !== productId);
  }

  setQuantity(productId: string, quantity: number) {
    const item = this.items.find((i) => i.productId === productId);
    if (item) {
      if (quantity <= 0) this.remove(productId);
      else item.quantity = quantity;
    }
  }

  get totalItems() {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  clear() {
    this.items = [];
  }
}

export const cartStore = new CartStore();
