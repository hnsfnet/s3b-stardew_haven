import Phaser from 'phaser';
import { ITEMS } from '../data/items';
import type { InventorySlot, Item } from '../types';

export class ShopScene extends Phaser.Scene {
  private goldText!: Phaser.GameObjects.Text;
  private buyItems: Item[] = [];
  private sellItems: string[] = [];
  private selectedBuyIndex: number = -1;
  private selectedSellIndex: number = -1;
  private messageText!: Phaser.GameObjects.Text;
  private messageTimer: number = 0;

  constructor() {
    super('ShopScene');
  }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a0f08, 0.95);
    bg.fillRect(0, 0, width, height);

    const panelWidth = 700;
    const panelHeight = 500;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x2d1b0e, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    panel.lineStyle(3, 0x8b6914, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);

    const title = this.add.text(width / 2, panelY + 30, '🏪 农场商店', {
      fontSize: '28px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei'
    });
    title.setOrigin(0.5);

    this.goldText = this.add.text(width / 2, panelY + 65, '', {
      fontSize: '20px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei'
    });
    this.goldText.setOrigin(0.5);
    this.updateGoldText();

    const buyPanelX = panelX + 20;
    const buyPanelY = panelY + 100;
    const buyPanelWidth = 320;
    const buyPanelHeight = 340;

    const buyPanel = this.add.graphics();
    buyPanel.fillStyle(0x1a0f08, 0.8);
    buyPanel.fillRoundedRect(buyPanelX, buyPanelY, buyPanelWidth, buyPanelHeight, 8);
    buyPanel.lineStyle(2, 0x654321, 1);
    buyPanel.strokeRoundedRect(buyPanelX, buyPanelY, buyPanelWidth, buyPanelHeight, 8);

    const buyTitle = this.add.text(buyPanelX + buyPanelWidth / 2, buyPanelY + 25, '购买种子', {
      fontSize: '18px',
      color: '#7cfc00',
      fontFamily: 'Microsoft YaHei'
    });
    buyTitle.setOrigin(0.5);

    this.buyItems = [
      ITEMS.potato_seed,
      ITEMS.carrot_seed,
      ITEMS.pumpkin_seed
    ];

    this.createBuyItems(buyPanelX, buyPanelY + 50);

    const sellPanelX = panelX + 360;
    const sellPanelY = panelY + 100;
    const sellPanelWidth = 320;
    const sellPanelHeight = 340;

    const sellPanel = this.add.graphics();
    sellPanel.fillStyle(0x1a0f08, 0.8);
    sellPanel.fillRoundedRect(sellPanelX, sellPanelY, sellPanelWidth, sellPanelHeight, 8);
    sellPanel.lineStyle(2, 0x654321, 1);
    sellPanel.strokeRoundedRect(sellPanelX, sellPanelY, sellPanelWidth, sellPanelHeight, 8);

    const sellTitle = this.add.text(sellPanelX + sellPanelWidth / 2, sellPanelY + 25, '出售农产品', {
      fontSize: '18px',
      color: '#ff6347',
      fontFamily: 'Microsoft YaHei'
    });
    sellTitle.setOrigin(0.5);

    this.createSellItems(sellPanelX, sellPanelY + 50);

    this.messageText = this.add.text(width / 2, panelY + panelHeight - 30, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei'
    });
    this.messageText.setOrigin(0.5);

    const hint = this.add.text(width / 2, panelY + panelHeight - 10, '按 E 键或 ESC 关闭商店', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Microsoft YaHei'
    });
    hint.setOrigin(0.5);

    this.input.keyboard?.on('keydown-E', this.closeShop, this);
    this.input.keyboard?.on('keydown-ESC', this.closeShop, this);
  }

  private createBuyItems(startX: number, startY: number): void {
    const itemHeight = 70;
    const spacing = 10;

    this.buyItems.forEach((item, index) => {
      const y = startY + index * (itemHeight + spacing);

      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x3d2817, 1);
      itemBg.fillRoundedRect(startX + 10, y, 300, itemHeight, 6);
      itemBg.lineStyle(1, 0x654321, 1);
      itemBg.strokeRoundedRect(startX + 10, y, 300, itemHeight, 6);

      const icon = this.add.sprite(startX + 45, y + itemHeight / 2, item.id);
      icon.setScale(1.3);

      const nameText = this.add.text(startX + 80, y + 12, item.name, {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });

      const descText = this.add.text(startX + 80, y + 32, item.description, {
        fontSize: '12px',
        color: '#aaaaaa',
        fontFamily: 'Microsoft YaHei'
      });

      const priceText = this.add.text(startX + 80, y + 50, `价格: ${item.price} 金币`, {
        fontSize: '14px',
        color: '#ffd700',
        fontFamily: 'Microsoft YaHei'
      });

      const buyBtn = this.add.graphics();
      buyBtn.fillStyle(0x4caf50, 1);
      buyBtn.fillRoundedRect(startX + 240, y + 20, 50, 30, 4);
      buyBtn.lineStyle(1, 0x81c784, 1);
      buyBtn.strokeRoundedRect(startX + 240, y + 20, 50, 30, 4);

      const buyText = this.add.text(startX + 265, y + 35, '购买', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });
      buyText.setOrigin(0.5);

      const hitArea = this.add.zone(startX + 10, y, 300, itemHeight);
      hitArea.setOrigin(0, 0);
      hitArea.setInteractive();

      hitArea.on('pointerover', () => {
        itemBg.clear();
        itemBg.fillStyle(0x5a3a1d, 1);
        itemBg.fillRoundedRect(startX + 10, y, 300, itemHeight, 6);
        itemBg.lineStyle(2, 0xffd700, 1);
        itemBg.strokeRoundedRect(startX + 10, y, 300, itemHeight, 6);
      });

      hitArea.on('pointerout', () => {
        itemBg.clear();
        itemBg.fillStyle(0x3d2817, 1);
        itemBg.fillRoundedRect(startX + 10, y, 300, itemHeight, 6);
        itemBg.lineStyle(1, 0x654321, 1);
        itemBg.strokeRoundedRect(startX + 10, y, 300, itemHeight, 6);
      });

      hitArea.on('pointerdown', () => {
        this.buyItem(item.id);
      });
    });
  }

  private createSellItems(startX: number, startY: number): void {
    const inventory = this.registry.get('inventory') as InventorySlot[];
    this.sellItems = [];

    inventory.forEach((slot) => {
      if (slot.itemId && slot.quantity > 0) {
        const item = ITEMS[slot.itemId];
        if (item && item.type === 'crop') {
          this.sellItems.push(slot.itemId);
        }
      }
    });

    const itemHeight = 60;
    const spacing = 8;

    this.sellItems.forEach((itemId, index) => {
      const y = startY + index * (itemHeight + spacing);
      const item = ITEMS[itemId];

      if (index >= 4) return;

      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x3d2817, 1);
      itemBg.fillRoundedRect(startX + 10, y, 300, itemHeight, 6);
      itemBg.lineStyle(1, 0x654321, 1);
      itemBg.strokeRoundedRect(startX + 10, y, 300, itemHeight, 6);

      const icon = this.add.sprite(startX + 40, y + itemHeight / 2, itemId);
      icon.setScale(1.2);

      const nameText = this.add.text(startX + 70, y + 10, item.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });

      const count = this.getItemCount(itemId);
      const countText = this.add.text(startX + 70, y + 32, `数量: ${count}`, {
        fontSize: '12px',
        color: '#aaaaaa',
        fontFamily: 'Microsoft YaHei'
      });

      const priceText = this.add.text(startX + 160, y + 20, `售价: ${item.sellPrice} 金币`, {
        fontSize: '14px',
        color: '#ffd700',
        fontFamily: 'Microsoft YaHei'
      });

      const sellBtn = this.add.graphics();
      sellBtn.fillStyle(0xf44336, 1);
      sellBtn.fillRoundedRect(startX + 240, y + 15, 50, 30, 4);
      sellBtn.lineStyle(1, 0xef9a9a, 1);
      sellBtn.strokeRoundedRect(startX + 240, y + 15, 50, 30, 4);

      const sellText = this.add.text(startX + 265, y + 30, '出售', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });
      sellText.setOrigin(0.5);

      const hitArea = this.add.zone(startX + 10, y, 300, itemHeight);
      hitArea.setOrigin(0, 0);
      hitArea.setInteractive();

      hitArea.on('pointerover', () => {
        itemBg.clear();
        itemBg.fillStyle(0x5a3a1d, 1);
        itemBg.fillRoundedRect(startX + 10, y, 300, itemHeight, 6);
        itemBg.lineStyle(2, 0xff6347, 1);
        itemBg.strokeRoundedRect(startX + 10, y, 300, itemHeight, 6);
      });

      hitArea.on('pointerout', () => {
        itemBg.clear();
        itemBg.fillStyle(0x3d2817, 1);
        itemBg.fillRoundedRect(startX + 10, y, 300, itemHeight, 6);
        itemBg.lineStyle(1, 0x654321, 1);
        itemBg.strokeRoundedRect(startX + 10, y, 300, itemHeight, 6);
      });

      hitArea.on('pointerdown', () => {
        this.sellItem(itemId);
      });
    });

    if (this.sellItems.length === 0) {
      const emptyText = this.add.text(startX + 160, startY + 100, '背包中没有可出售的农产品', {
        fontSize: '14px',
        color: '#888888',
        fontFamily: 'Microsoft YaHei'
      });
      emptyText.setOrigin(0.5);
    }
  }

  private getItemCount(itemId: string): number {
    const inventory = this.registry.get('inventory') as InventorySlot[];
    let count = 0;

    for (const slot of inventory) {
      if (slot.itemId === itemId) {
        count += slot.quantity;
      }
    }

    return count;
  }

  private buyItem(itemId: string): void {
    const item = ITEMS[itemId];
    const gold = this.registry.get('gold') as number;

    if (gold < item.price) {
      this.showMessage('金币不足！', '#ff6347');
      return;
    }

    const inventory = this.registry.get('inventory') as InventorySlot[];
    let added = false;

    for (let i = 0; i < inventory.length; i++) {
      const slot = inventory[i];
      if (slot.itemId === itemId && slot.quantity > 0) {
        slot.quantity++;
        added = true;
        break;
      }
    }

    if (!added) {
      for (let i = 0; i < inventory.length; i++) {
        const slot = inventory[i];
        if (!slot.itemId || slot.quantity === 0) {
          slot.itemId = itemId;
          slot.quantity = 1;
          added = true;
          break;
        }
      }
    }

    if (!added) {
      this.showMessage('背包已满！', '#ff6347');
      return;
    }

    this.registry.set('gold', gold - item.price);
    this.registry.set('inventory', [...inventory]);
    this.updateGoldText();
    this.showMessage(`购买了 ${item.name}！`, '#7cfc00');
    this.refreshSellItems();
  }

  private sellItem(itemId: string): void {
    const item = ITEMS[itemId];
    const inventory = this.registry.get('inventory') as InventorySlot[];

    let sold = false;
    for (let i = 0; i < inventory.length; i++) {
      const slot = inventory[i];
      if (slot.itemId === itemId && slot.quantity > 0) {
        slot.quantity--;
        if (slot.quantity <= 0) {
          slot.itemId = null;
          slot.quantity = 0;
        }
        sold = true;
        break;
      }
    }

    if (!sold) {
      this.showMessage('物品不存在！', '#ff6347');
      return;
    }

    const gold = this.registry.get('gold') as number;
    this.registry.set('gold', gold + item.sellPrice);
    this.registry.set('inventory', [...inventory]);
    this.updateGoldText();
    this.showMessage(`出售了 ${item.name}，获得 ${item.sellPrice} 金币！`, '#7cfc00');
    this.refreshSellItems();
  }

  private refreshSellItems(): void {
    this.children.each((child) => {
      if (child instanceof Phaser.GameObjects.Text ||
          child instanceof Phaser.GameObjects.Graphics ||
          child instanceof Phaser.GameObjects.Sprite ||
          child instanceof Phaser.GameObjects.Zone) {
        if (child.y > 200 && child.y < 480 && child.x > 380) {
          child.destroy();
        }
      }
    });

    const sellPanelX = (this.scale.width - 700) / 2 + 360;
    const sellPanelY = (this.scale.height - 500) / 2 + 150;

    const inventory = this.registry.get('inventory') as InventorySlot[];
    this.sellItems = [];

    inventory.forEach((slot) => {
      if (slot.itemId && slot.quantity > 0) {
        const item = ITEMS[slot.itemId];
        if (item && item.type === 'crop') {
          if (!this.sellItems.includes(slot.itemId)) {
            this.sellItems.push(slot.itemId);
          }
        }
      }
    });

    const itemHeight = 60;
    const spacing = 8;

    this.sellItems.forEach((itemId, index) => {
      if (index >= 4) return;

      const y = sellPanelY + index * (itemHeight + spacing);
      const item = ITEMS[itemId];

      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x3d2817, 1);
      itemBg.fillRoundedRect(sellPanelX + 10, y, 300, itemHeight, 6);
      itemBg.lineStyle(1, 0x654321, 1);
      itemBg.strokeRoundedRect(sellPanelX + 10, y, 300, itemHeight, 6);

      const icon = this.add.sprite(sellPanelX + 40, y + itemHeight / 2, itemId);
      icon.setScale(1.2);

      const nameText = this.add.text(sellPanelX + 70, y + 10, item.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });

      const count = this.getItemCount(itemId);
      const countText = this.add.text(sellPanelX + 70, y + 32, `数量: ${count}`, {
        fontSize: '12px',
        color: '#aaaaaa',
        fontFamily: 'Microsoft YaHei'
      });

      const priceText = this.add.text(sellPanelX + 160, y + 20, `售价: ${item.sellPrice} 金币`, {
        fontSize: '14px',
        color: '#ffd700',
        fontFamily: 'Microsoft YaHei'
      });

      const sellBtn = this.add.graphics();
      sellBtn.fillStyle(0xf44336, 1);
      sellBtn.fillRoundedRect(sellPanelX + 240, y + 15, 50, 30, 4);
      sellBtn.lineStyle(1, 0xef9a9a, 1);
      sellBtn.strokeRoundedRect(sellPanelX + 240, y + 15, 50, 30, 4);

      const sellText = this.add.text(sellPanelX + 265, y + 30, '出售', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });
      sellText.setOrigin(0.5);

      const hitArea = this.add.zone(sellPanelX + 10, y, 300, itemHeight);
      hitArea.setOrigin(0, 0);
      hitArea.setInteractive();

      hitArea.on('pointerover', () => {
        itemBg.clear();
        itemBg.fillStyle(0x5a3a1d, 1);
        itemBg.fillRoundedRect(sellPanelX + 10, y, 300, itemHeight, 6);
        itemBg.lineStyle(2, 0xff6347, 1);
        itemBg.strokeRoundedRect(sellPanelX + 10, y, 300, itemHeight, 6);
      });

      hitArea.on('pointerout', () => {
        itemBg.clear();
        itemBg.fillStyle(0x3d2817, 1);
        itemBg.fillRoundedRect(sellPanelX + 10, y, 300, itemHeight, 6);
        itemBg.lineStyle(1, 0x654321, 1);
        itemBg.strokeRoundedRect(sellPanelX + 10, y, 300, itemHeight, 6);
      });

      hitArea.on('pointerdown', () => {
        this.sellItem(itemId);
      });
    });

    if (this.sellItems.length === 0) {
      const emptyText = this.add.text(sellPanelX + 160, sellPanelY + 100, '背包中没有可出售的农产品', {
        fontSize: '14px',
        color: '#888888',
        fontFamily: 'Microsoft YaHei'
      });
      emptyText.setOrigin(0.5);
    }
  }

  private updateGoldText(): void {
    const gold = this.registry.get('gold') as number;
    this.goldText.setText(`💰 金币: ${gold}`);
  }

  private showMessage(text: string, color: string = '#ffffff'): void {
    this.messageText.setText(text);
    this.messageText.setColor(color);
    this.messageText.setAlpha(1);

    this.time.delayedCall(2000, () => {
      this.messageText.setAlpha(0);
    });
  }

  private closeShop(): void {
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
  }
}
