import type { InventorySlot } from '../types';
import { ConfigLoader, ItemConfig } from '../config/ConfigLoader';

export class ShopLogic {
  static canBuy(gold: number, price: number): boolean {
    return gold >= price && price > 0;
  }

  static buy(
    gold: number,
    inventory: InventorySlot[],
    itemId: string,
    quantity: number = 1
  ): { success: boolean; newGold: number; newInventory: InventorySlot[]; message: string } {
    const item = ConfigLoader.getInstance().getItem(itemId);
    if (!item) {
      return { success: false, newGold: gold, newInventory: inventory, message: '物品不存在' };
    }

    const totalPrice = item.price * quantity;
    if (!this.canBuy(gold, totalPrice)) {
      return { success: false, newGold: gold, newInventory: inventory, message: '金币不足' };
    }

    const { success, newInventory, remaining } = this.addItems(inventory, itemId, quantity);
    if (!success) {
      return { success: false, newGold: gold, newInventory: inventory, message: '背包已满' };
    }

    if (remaining > 0) {
      return {
        success: false,
        newGold: gold,
        newInventory: inventory,
        message: `背包空间不足，剩余 ${remaining} 个无法放入`
      };
    }

    return {
      success: true,
      newGold: gold - totalPrice,
      newInventory,
      message: `购买了 ${quantity} 个 ${item.name}`
    };
  }

  static sell(
    gold: number,
    inventory: InventorySlot[],
    itemId: string,
    quantity: number
  ): { success: boolean; newGold: number; newInventory: InventorySlot[]; soldCount: number; totalPrice: number; message: string } {
    const item = ConfigLoader.getInstance().getItem(itemId);
    if (!item) {
      return {
        success: false,
        newGold: gold,
        newInventory: inventory,
        soldCount: 0,
        totalPrice: 0,
        message: '物品不存在'
      };
    }

    const availableCount = this.countItem(inventory, itemId);
    const actualQuantity = Math.min(quantity, availableCount);

    if (actualQuantity <= 0) {
      return {
        success: false,
        newGold: gold,
        newInventory: inventory,
        soldCount: 0,
        totalPrice: 0,
        message: '没有可出售的物品'
      };
    }

    const newInventory = this.removeItems(inventory, itemId, actualQuantity);
    const totalPrice = actualQuantity * item.sellPrice;

    return {
      success: true,
      newGold: gold + totalPrice,
      newInventory,
      soldCount: actualQuantity,
      totalPrice,
      message: `出售了 ${actualQuantity} 个 ${item.name}，获得 ${totalPrice} 金币`
    };
  }

  static sellAll(
    gold: number,
    inventory: InventorySlot[],
    itemId: string
  ): { success: boolean; newGold: number; newInventory: InventorySlot[]; soldCount: number; totalPrice: number; message: string } {
    const totalCount = this.countItem(inventory, itemId);
    return this.sell(gold, inventory, itemId, totalCount);
  }

  static addItems(
    inventory: InventorySlot[],
    itemId: string,
    quantity: number
  ): { success: boolean; newInventory: InventorySlot[]; remaining: number } {
    const newInventory = inventory.map((slot) => ({ ...slot }));
    let remaining = quantity;

    for (const slot of newInventory) {
      if (remaining <= 0) break;
      if (slot.itemId === itemId && slot.quantity > 0) {
        slot.quantity += remaining;
        remaining = 0;
      }
    }

    if (remaining > 0) {
      for (const slot of newInventory) {
        if (remaining <= 0) break;
        if (!slot.itemId || slot.quantity <= 0) {
          slot.itemId = itemId;
          slot.quantity = remaining;
          remaining = 0;
        }
      }
    }

    return {
      success: remaining === 0,
      newInventory,
      remaining
    };
  }

  static removeItems(
    inventory: InventorySlot[],
    itemId: string,
    quantity: number
  ): InventorySlot[] {
    const newInventory = inventory.map((slot) => ({ ...slot }));
    let remaining = quantity;

    for (const slot of newInventory) {
      if (remaining <= 0) break;
      if (slot.itemId === itemId && slot.quantity > 0) {
        const toRemove = Math.min(slot.quantity, remaining);
        slot.quantity -= toRemove;
        remaining -= toRemove;
        if (slot.quantity <= 0) {
          slot.itemId = null;
          slot.quantity = 0;
        }
      }
    }

    return newInventory;
  }

  static countItem(inventory: InventorySlot[], itemId: string): number {
    return inventory.reduce((count, slot) => {
      if (slot.itemId === itemId) {
        return count + slot.quantity;
      }
      return count;
    }, 0);
  }

  static hasItem(inventory: InventorySlot[], itemId: string, quantity: number = 1): boolean {
    return this.countItem(inventory, itemId) >= quantity;
  }

  static getInventorySummary(inventory: InventorySlot[]): Array<{ itemId: string; quantity: number; item: ItemConfig }> {
    const summary = new Map<string, number>();

    for (const slot of inventory) {
      if (slot.itemId && slot.quantity > 0) {
        const prev = summary.get(slot.itemId) || 0;
        summary.set(slot.itemId, prev + slot.quantity);
      }
    }

    const loader = ConfigLoader.getInstance();
    const result: Array<{ itemId: string; quantity: number; item: ItemConfig }> = [];

    for (const [itemId, quantity] of summary.entries()) {
      const item = loader.getItem(itemId);
      if (item) {
        result.push({ itemId, quantity, item });
      }
    }

    return result;
  }

  static getSellableItems(inventory: InventorySlot[]): string[] {
    const summary = this.getInventorySummary(inventory);
    return summary
      .filter((s) => s.item.type === 'crop')
      .map((s) => s.itemId);
  }

  static calculateProfit(originalGold: number, currentGold: number): number {
    return currentGold - originalGold;
  }
}
