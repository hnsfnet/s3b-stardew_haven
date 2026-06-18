import Phaser from 'phaser';
import { ITEMS, PET_NAMES } from '../data/items';
import type { InventorySlot, Item, Pet } from '../types';

export class ShopScene extends Phaser.Scene {
  private goldText!: Phaser.GameObjects.Text;
  private buyItems: Item[] = [];
  private sellItems: string[] = [];
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super('ShopScene');
  }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a0f08, 0.95);
    bg.fillRect(0, 0, width, height);

    const panelWidth = 720;
    const panelHeight = 560;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x2d1b0e, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    panel.lineStyle(3, 0x8b6914, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);

    const title = this.add.text(width / 2, panelY + 28, '🏪 农场商店', {
      fontSize: '26px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei'
    });
    title.setOrigin(0.5);

    this.goldText = this.add.text(width / 2, panelY + 60, '', {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei'
    });
    this.goldText.setOrigin(0.5);
    this.updateGoldText();

    const buyPanelX = panelX + 15;
    const buyPanelY = panelY + 85;
    const buyPanelWidth = 340;
    const buyPanelHeight = 430;

    const buyPanel = this.add.graphics();
    buyPanel.fillStyle(0x1a0f08, 0.8);
    buyPanel.fillRoundedRect(buyPanelX, buyPanelY, buyPanelWidth, buyPanelHeight, 8);
    buyPanel.lineStyle(2, 0x654321, 1);
    buyPanel.strokeRoundedRect(buyPanelX, buyPanelY, buyPanelWidth, buyPanelHeight, 8);

    const buyTitle = this.add.text(buyPanelX + buyPanelWidth / 2, buyPanelY + 20, '购买商品', {
      fontSize: '16px',
      color: '#7cfc00',
      fontFamily: 'Microsoft YaHei'
    });
    buyTitle.setOrigin(0.5);

    this.buyItems = [
      ITEMS.potato_seed,
      ITEMS.carrot_seed,
      ITEMS.pumpkin_seed,
      ITEMS.pet_food,
      ITEMS.cat,
      ITEMS.dog,
      ITEMS.rabbit
    ];

    this.createBuyItems(buyPanelX, buyPanelY + 40);

    const sellPanelX = panelX + 375;
    const sellPanelY = panelY + 85;
    const sellPanelWidth = 330;
    const sellPanelHeight = 430;

    const sellPanel = this.add.graphics();
    sellPanel.fillStyle(0x1a0f08, 0.8);
    sellPanel.fillRoundedRect(sellPanelX, sellPanelY, sellPanelWidth, sellPanelHeight, 8);
    sellPanel.lineStyle(2, 0x654321, 1);
    sellPanel.strokeRoundedRect(sellPanelX, sellPanelY, sellPanelWidth, sellPanelHeight, 8);

    const sellTitle = this.add.text(sellPanelX + sellPanelWidth / 2, sellPanelY + 20, '出售农产品', {
      fontSize: '16px',
      color: '#ff6347',
      fontFamily: 'Microsoft YaHei'
    });
    sellTitle.setOrigin(0.5);

    this.createSellItems(sellPanelX, sellPanelY + 40);

    this.messageText = this.add.text(width / 2, panelY + panelHeight - 25, '', {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei'
    });
    this.messageText.setOrigin(0.5);

    const hint = this.add.text(width / 2, panelY + panelHeight - 8, '按 E 键或 ESC 关闭商店', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'Microsoft YaHei'
    });
    hint.setOrigin(0.5);

    this.input.keyboard?.on('keydown-E', this.closeShop, this);
    this.input.keyboard?.on('keydown-ESC', this.closeShop, this);
  }

  private createBuyItems(startX: number, startY: number): void {
    const itemHeight = 56;
    const spacing = 6;

    this.buyItems.forEach((item, index) => {
      if (index >= 7) return;

      const y = startY + index * (itemHeight + spacing);

      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x3d2817, 1);
      itemBg.fillRoundedRect(startX + 8, y, 324, itemHeight, 5);
      itemBg.lineStyle(1, 0x654321, 1);
      itemBg.strokeRoundedRect(startX + 8, y, 324, itemHeight, 5);

      const icon = this.add.sprite(startX + 32, y + itemHeight / 2, item.id);
      icon.setScale(0.9);

      const nameText = this.add.text(startX + 58, y + 6, item.name, {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });

      const descText = this.add.text(startX + 58, y + 24, item.description, {
        fontSize: '10px',
        color: '#aaaaaa',
        fontFamily: 'Microsoft YaHei',
        wordWrap: { width: 180 }
      });

      const priceText = this.add.text(startX + 58, y + 40, `价格: ${item.price} 金币`, {
        fontSize: '12px',
        color: '#ffd700',
        fontFamily: 'Microsoft YaHei'
      });

      const buyBtn = this.add.graphics();
      buyBtn.fillStyle(0x4caf50, 1);
      buyBtn.fillRoundedRect(startX + 268, y + 14, 48, 28, 4);
      buyBtn.lineStyle(1, 0x81c784, 1);
      buyBtn.strokeRoundedRect(startX + 268, y + 14, 48, 28, 4);

      const buyText = this.add.text(startX + 292, y + 28, '购买', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });
      buyText.setOrigin(0.5);

      const hitArea = this.add.zone(startX + 8, y, 324, itemHeight);
      hitArea.setOrigin(0, 0);
      hitArea.setInteractive();

      hitArea.on('pointerover', () => {
        itemBg.clear();
        itemBg.fillStyle(0x5a3a1d, 1);
        itemBg.fillRoundedRect(startX + 8, y, 324, itemHeight, 5);
        itemBg.lineStyle(2, 0xffd700, 1);
        itemBg.strokeRoundedRect(startX + 8, y, 324, itemHeight, 5);
      });

      hitArea.on('pointerout', () => {
        itemBg.clear();
        itemBg.fillStyle(0x3d2817, 1);
        itemBg.fillRoundedRect(startX + 8, y, 324, itemHeight, 5);
        itemBg.lineStyle(1, 0x654321, 1);
        itemBg.strokeRoundedRect(startX + 8, y, 324, itemHeight, 5);
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
          if (!this.sellItems.includes(slot.itemId)) {
            this.sellItems.push(slot.itemId);
          }
        }
      }
    });

    const itemHeight = 56;
    const spacing = 6;

    this.sellItems.forEach((itemId, index) => {
      if (index >= 6) return;

      const y = startY + index * (itemHeight + spacing);
      const item = ITEMS[itemId];

      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x3d2817, 1);
      itemBg.fillRoundedRect(startX + 8, y, 314, itemHeight, 5);
      itemBg.lineStyle(1, 0x654321, 1);
      itemBg.strokeRoundedRect(startX + 8, y, 314, itemHeight, 5);

      const icon = this.add.sprite(startX + 32, y + itemHeight / 2, itemId);
      icon.setScale(0.9);

      const nameText = this.add.text(startX + 58, y + 8, item.name, {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });

      const count = this.getItemCount(itemId);
      const countText = this.add.text(startX + 58, y + 28, `数量: ${count}`, {
        fontSize: '11px',
        color: '#aaaaaa',
        fontFamily: 'Microsoft YaHei'
      });

      const priceText = this.add.text(startX + 140, y + 20, `售价: ${item.sellPrice} 金币`, {
        fontSize: '12px',
        color: '#ffd700',
        fontFamily: 'Microsoft YaHei'
      });

      const sellBtn = this.add.graphics();
      sellBtn.fillStyle(0xf44336, 1);
      sellBtn.fillRoundedRect(startX + 252, y + 14, 60, 28, 4);
      sellBtn.lineStyle(1, 0xef9a9a, 1);
      sellBtn.strokeRoundedRect(startX + 252, y + 14, 60, 28, 4);

      const sellText = this.add.text(startX + 282, y + 28, '全部出售', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });
      sellText.setOrigin(0.5);

      const hitArea = this.add.zone(startX + 8, y, 314, itemHeight);
      hitArea.setOrigin(0, 0);
      hitArea.setInteractive();

      hitArea.on('pointerover', () => {
        itemBg.clear();
        itemBg.fillStyle(0x5a3a1d, 1);
        itemBg.fillRoundedRect(startX + 8, y, 314, itemHeight, 5);
        itemBg.lineStyle(2, 0xff6347, 1);
        itemBg.strokeRoundedRect(startX + 8, y, 314, itemHeight, 5);
      });

      hitArea.on('pointerout', () => {
        itemBg.clear();
        itemBg.fillStyle(0x3d2817, 1);
        itemBg.fillRoundedRect(startX + 8, y, 314, itemHeight, 5);
        itemBg.lineStyle(1, 0x654321, 1);
        itemBg.strokeRoundedRect(startX + 8, y, 314, itemHeight, 5);
      });

      hitArea.on('pointerdown', () => {
        this.sellItem(itemId);
      });
    });

    if (this.sellItems.length === 0) {
      const emptyText = this.add.text(startX + 165, startY + 150, '背包中没有可出售的农产品', {
        fontSize: '13px',
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

    if (item.type === 'pet') {
      this.buyPet(itemId);
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
  }

  private buyPet(itemId: string): void {
    const item = ITEMS[itemId];
    const gold = this.registry.get('gold') as number;
    const pets = this.registry.get('pets') as Pet[];

    if (pets.some(p => p.type === item.petType)) {
      this.showMessage(`你已经有一只${item.name}了！`, '#ff6347');
      return;
    }

    const petType = item.petType!;
    const names = PET_NAMES[petType];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const newPet: Pet = {
      id: Phaser.Utils.String.UUID(),
      type: petType,
      name: randomName,
      mood: 80,
      hunger: 100,
      isFollowing: true,
      helpedToday: false,
      lastFedDay: this.registry.get('day') as number
    };

    pets.push(newPet);
    this.registry.set('pets', [...pets]);
    this.registry.set('gold', gold - item.price);
    this.updateGoldText();
    this.showMessage(`购买了 ${item.name}「${randomName}」！`, '#7cfc00');
  }

  private sellItem(itemId: string): void {
    const item = ITEMS[itemId];
    const inventory = this.registry.get('inventory') as InventorySlot[];

    let totalSold = 0;

    for (let i = 0; i < inventory.length; i++) {
      const slot = inventory[i];
      if (slot.itemId === itemId && slot.quantity > 0) {
        totalSold += slot.quantity;
        slot.itemId = null;
        slot.quantity = 0;
      }
    }

    if (totalSold <= 0) {
      this.showMessage('物品不存在！', '#ff6347');
      return;
    }

    const totalGold = totalSold * item.sellPrice;
    const gold = this.registry.get('gold') as number;
    this.registry.set('gold', gold + totalGold);
    this.registry.set('inventory', [...inventory]);
    this.updateGoldText();
    this.showMessage(`出售了 ${totalSold} 个 ${item.name}，获得 ${totalGold} 金币！`, '#7cfc00');
    this.refreshSellItems();
  }

  private refreshSellItems(): void {
    this.children.each((child) => {
      if (child.y > 130 && child.y < 520 && child.x > 380) {
        child.destroy();
      }
    });

    const panelWidth = 720;
    const panelHeight = 560;
    const panelX = (this.scale.width - panelWidth) / 2;
    const panelY = (this.scale.height - panelHeight) / 2;

    const sellPanelX = panelX + 375;
    const sellPanelY = panelY + 125;

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

    const itemHeight = 56;
    const spacing = 6;

    this.sellItems.forEach((itemId, index) => {
      if (index >= 6) return;

      const y = sellPanelY + index * (itemHeight + spacing);
      const item = ITEMS[itemId];

      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x3d2817, 1);
      itemBg.fillRoundedRect(sellPanelX + 8, y, 314, itemHeight, 5);
      itemBg.lineStyle(1, 0x654321, 1);
      itemBg.strokeRoundedRect(sellPanelX + 8, y, 314, itemHeight, 5);

      const icon = this.add.sprite(sellPanelX + 32, y + itemHeight / 2, itemId);
      icon.setScale(0.9);

      const nameText = this.add.text(sellPanelX + 58, y + 8, item.name, {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });

      const count = this.getItemCount(itemId);
      const countText = this.add.text(sellPanelX + 58, y + 28, `数量: ${count}`, {
        fontSize: '11px',
        color: '#aaaaaa',
        fontFamily: 'Microsoft YaHei'
      });

      const priceText = this.add.text(sellPanelX + 140, y + 20, `售价: ${item.sellPrice} 金币`, {
        fontSize: '12px',
        color: '#ffd700',
        fontFamily: 'Microsoft YaHei'
      });

      const sellBtn = this.add.graphics();
      sellBtn.fillStyle(0xf44336, 1);
      sellBtn.fillRoundedRect(sellPanelX + 258, y + 14, 48, 28, 4);
      sellBtn.lineStyle(1, 0xef9a9a, 1);
      sellBtn.strokeRoundedRect(sellPanelX + 258, y + 14, 48, 28, 4);

      const sellText = this.add.text(sellPanelX + 282, y + 28, '出售', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei'
      });
      sellText.setOrigin(0.5);

      const hitArea = this.add.zone(sellPanelX + 8, y, 314, itemHeight);
      hitArea.setOrigin(0, 0);
      hitArea.setInteractive();

      hitArea.on('pointerover', () => {
        itemBg.clear();
        itemBg.fillStyle(0x5a3a1d, 1);
        itemBg.fillRoundedRect(sellPanelX + 8, y, 314, itemHeight, 5);
        itemBg.lineStyle(2, 0xff6347, 1);
        itemBg.strokeRoundedRect(sellPanelX + 8, y, 314, itemHeight, 5);
      });

      hitArea.on('pointerout', () => {
        itemBg.clear();
        itemBg.fillStyle(0x3d2817, 1);
        itemBg.fillRoundedRect(sellPanelX + 8, y, 314, itemHeight, 5);
        itemBg.lineStyle(1, 0x654321, 1);
        itemBg.strokeRoundedRect(sellPanelX + 8, y, 314, itemHeight, 5);
      });

      hitArea.on('pointerdown', () => {
        this.sellItem(itemId);
      });
    });

    if (this.sellItems.length === 0) {
      const emptyText = this.add.text(sellPanelX + 165, sellPanelY + 120, '背包中没有可出售的农产品', {
        fontSize: '13px',
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
}
