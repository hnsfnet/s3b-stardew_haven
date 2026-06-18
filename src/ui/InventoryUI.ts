import Phaser from 'phaser';
import type { InventorySlot } from '../types';
import { ConfigLoader } from '../config/ConfigLoader';

export class InventoryUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private slots: Phaser.GameObjects.Container[] = [];
  private itemSprites: Phaser.GameObjects.Sprite[] = [];
  private quantityTexts: Phaser.GameObjects.Text[] = [];
  private isVisible: boolean = false;
  private selectedSlot: number = -1;
  private dragSlot: number = -1;
  private dragSprite: Phaser.GameObjects.Sprite | null = null;
  private onItemSelected: ((itemId: string | null) => void) | null = null;
  private onFeedPet: (() => boolean) | null = null;

  private slotSize = 48;
  private cols = 5;
  private rows = 4;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(400, 300);
    this.container.setDepth(100);
    this.container.setVisible(false);

    this.createUI();
  }

  private createUI(): void {
    const bgWidth = this.cols * this.slotSize + 40;
    const bgHeight = this.rows * this.slotSize + 60;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2d1b0e, 0.95);
    bg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 8);
    bg.lineStyle(2, 0x8b6914, 1);
    bg.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 8);

    const title = this.scene.add.text(0, -bgHeight / 2 + 20, '背包', {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei'
    });
    title.setOrigin(0.5);

    this.container.add([bg, title]);

    const startX = -(this.cols * this.slotSize) / 2 + this.slotSize / 2;
    const startY = -bgHeight / 2 + 50;

    for (let i = 0; i < this.cols * this.rows; i++) {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      const x = startX + col * this.slotSize;
      const y = startY + row * this.slotSize;

      const slotContainer = this.scene.add.container(x, y);

      const slotBg = this.scene.add.graphics();
      slotBg.fillStyle(0x1a0f08, 0.8);
      slotBg.fillRoundedRect(-this.slotSize / 2 + 2, -this.slotSize / 2 + 2, this.slotSize - 4, this.slotSize - 4, 4);
      slotBg.lineStyle(1, 0x654321, 1);
      slotBg.strokeRoundedRect(-this.slotSize / 2 + 2, -this.slotSize / 2 + 2, this.slotSize - 4, this.slotSize - 4, 4);

      const itemSprite = this.scene.add.sprite(0, 0, 'potato_seed');
      itemSprite.setVisible(false);
      itemSprite.setScale(1.2);

      const quantityText = this.scene.add.text(this.slotSize / 2 - 6, this.slotSize / 2 - 16, '', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Microsoft YaHei',
        stroke: '#000000',
        strokeThickness: 2
      });
      quantityText.setOrigin(1, 0);

      slotContainer.add([slotBg, itemSprite, quantityText]);
      this.container.add(slotContainer);

      this.slots.push(slotContainer);
      this.itemSprites.push(itemSprite);
      this.quantityTexts.push(quantityText);

      slotContainer.setSize(this.slotSize, this.slotSize);
      slotContainer.setInteractive();

      slotContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          this.handleSlotClick(i);
        } else if (pointer.rightButtonDown()) {
          this.handleSlotRightClick(i);
        }
      });

      slotContainer.on('pointerover', () => {
        this.showItemTooltip(i);
      });

      slotContainer.on('pointerout', () => {
        this.hideItemTooltip();
      });
    }

    const hintText = this.scene.add.text(0, bgHeight / 2 - 20, '点击选种子/用饲料 | 拖拽排序 | 按 I 关闭', {
      fontSize: '12px',
      color: '#aaaaaa',
      fontFamily: 'Microsoft YaHei'
    });
    hintText.setOrigin(0.5);
    this.container.add(hintText);

    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);
  }

  private handleSlotClick(index: number): void {
    const inventory = this.scene.registry.get('inventory') as InventorySlot[];
    const slot = inventory[index];

    if (this.dragSlot >= 0) {
      this.swapSlots(this.dragSlot, index);
      this.endDrag();
      return;
    }

    if (slot.itemId) {
      const item = ConfigLoader.getInstance().getItem(slot.itemId);
      if (item) {
        if (item.type === 'seed') {
          this.selectedSlot = index;
          this.scene.registry.set('selectedSeed', slot.itemId);
          this.updateSlotSelection();
          if (this.onItemSelected) {
            this.onItemSelected(slot.itemId);
          }
        } else if (item.type === 'pet_food') {
          if (this.onFeedPet && this.onFeedPet()) {
            this.removeItem(slot.itemId, 1);
          }
        }
      }
    } else {
      this.selectedSlot = -1;
      this.scene.registry.set('selectedSeed', null);
      this.updateSlotSelection();
      if (this.onItemSelected) {
        this.onItemSelected(null);
      }
    }
  }

  private handleSlotRightClick(index: number): void {
    const inventory = this.scene.registry.get('inventory') as InventorySlot[];
    const slot = inventory[index];

    if (slot.itemId && slot.quantity > 0) {
      this.startDrag(index);
    }
  }

  private startDrag(index: number): void {
    const inventory = this.scene.registry.get('inventory') as InventorySlot[];
    const slot = inventory[index];

    if (!slot.itemId) return;

    this.dragSlot = index;

    this.dragSprite = this.scene.add.sprite(
      this.scene.input.x,
      this.scene.input.y,
      slot.itemId
    );
    this.dragSprite.setScale(1.2);
    this.dragSprite.setDepth(200);
    this.dragSprite.setAlpha(0.7);
  }

  private endDrag(): void {
    this.dragSlot = -1;
    if (this.dragSprite) {
      this.dragSprite.destroy();
      this.dragSprite = null;
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.dragSprite && this.dragSlot >= 0) {
      this.dragSprite.setPosition(pointer.x, pointer.y);
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.dragSlot >= 0 && pointer.rightButtonReleased()) {
      let dropped = false;

      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots[i];
        const point = this.container.getLocalPoint(pointer.x, pointer.y);
        const bounds = new Phaser.Geom.Rectangle(
          slot.x - this.slotSize / 2,
          slot.y - this.slotSize / 2,
          this.slotSize,
          this.slotSize
        );

        if (bounds.contains(point.x, point.y)) {
          this.swapSlots(this.dragSlot, i);
          dropped = true;
          break;
        }
      }

      if (!dropped) {
        this.endDrag();
      }
    }
  }

  private swapSlots(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) {
      this.endDrag();
      return;
    }

    const inventory = this.scene.registry.get('inventory') as InventorySlot[];
    const temp = { ...inventory[fromIndex] };
    inventory[fromIndex] = { ...inventory[toIndex] };
    inventory[toIndex] = temp;

    this.scene.registry.set('inventory', [...inventory]);
    this.updateInventoryUI();
    this.endDrag();
  }

  private showItemTooltip(index: number): void {
    const inventory = this.scene.registry.get('inventory') as InventorySlot[];
    const slot = inventory[index];

    if (!slot.itemId) return;

    const item = ITEMS[slot.itemId];
    if (!item) return;

    const slotContainer = this.slots[index];
    const worldPos = this.container.getBounds();
    const slotWorldX = worldPos.x + slotContainer.x + this.slotSize;
    const slotWorldY = worldPos.y + slotContainer.y;

    const tooltip = this.scene.add.container(slotWorldX, slotWorldY);
    tooltip.setDepth(150);
    tooltip.setName('tooltip');

    const tooltipBg = this.scene.add.graphics();
    tooltipBg.fillStyle(0x000000, 0.9);
    tooltipBg.fillRoundedRect(0, 0, 150, 80, 4);
    tooltipBg.lineStyle(1, 0x8b6914, 1);
    tooltipBg.strokeRoundedRect(0, 0, 150, 80, 4);

    const nameText = this.scene.add.text(10, 8, item.name, {
      fontSize: '14px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei'
    });

    const descText = this.scene.add.text(10, 28, item.description, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
      wordWrap: { width: 130 }
    });

    const priceText = this.scene.add.text(10, 60, `售价: ${item.sellPrice} 金币`, {
      fontSize: '12px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei'
    });

    tooltip.add([tooltipBg, nameText, descText, priceText]);
  }

  private hideItemTooltip(): void {
    const tooltip = this.scene.children.getByName('tooltip');
    if (tooltip) {
      tooltip.destroy();
    }
  }

  updateInventoryUI(): void {
    const inventory = this.scene.registry.get('inventory') as InventorySlot[];

    for (let i = 0; i < this.cols * this.rows; i++) {
      const slot = inventory[i];
      const itemSprite = this.itemSprites[i];
      const quantityText = this.quantityTexts[i];

      if (slot.itemId && slot.quantity > 0) {
        itemSprite.setTexture(slot.itemId);
        itemSprite.setVisible(true);
        quantityText.setText(slot.quantity.toString());
      } else {
        itemSprite.setVisible(false);
        quantityText.setText('');
      }
    }

    this.updateSlotSelection();
  }

  private updateSlotSelection(): void {
    for (let i = 0; i < this.slots.length; i++) {
      const slotContainer = this.slots[i];
      const slotBg = slotContainer.first as Phaser.GameObjects.Graphics;

      if (i === this.selectedSlot) {
        slotBg.clear();
        slotBg.fillStyle(0x4a2e0a, 0.9);
        slotBg.fillRoundedRect(-this.slotSize / 2 + 2, -this.slotSize / 2 + 2, this.slotSize - 4, this.slotSize - 4, 4);
        slotBg.lineStyle(2, 0xffd700, 1);
        slotBg.strokeRoundedRect(-this.slotSize / 2 + 2, -this.slotSize / 2 + 2, this.slotSize - 4, this.slotSize - 4, 4);
      } else {
        slotBg.clear();
        slotBg.fillStyle(0x1a0f08, 0.8);
        slotBg.fillRoundedRect(-this.slotSize / 2 + 2, -this.slotSize / 2 + 2, this.slotSize - 4, this.slotSize - 4, 4);
        slotBg.lineStyle(1, 0x654321, 1);
        slotBg.strokeRoundedRect(-this.slotSize / 2 + 2, -this.slotSize / 2 + 2, this.slotSize - 4, this.slotSize - 4, 4);
      }
    }
  }

  show(): void {
    this.isVisible = true;
    this.container.setVisible(true);
    this.updateInventoryUI();
  }

  hide(): void {
    this.isVisible = false;
    this.container.setVisible(false);
    this.hideItemTooltip();
  }

  toggle(): boolean {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
    return this.isVisible;
  }

  getIsVisible(): boolean {
    return this.isVisible;
  }

  setOnItemSelected(callback: (itemId: string | null) => void): void {
    this.onItemSelected = callback;
  }

  setOnFeedPet(callback: () => boolean): void {
    this.onFeedPet = callback;
  }

  addItem(itemId: string, quantity: number = 1): boolean {
    const inventory = this.scene.registry.get('inventory') as InventorySlot[];

    for (let i = 0; i < this.cols * this.rows; i++) {
      const slot = inventory[i];
      if (slot.itemId === itemId && slot.quantity > 0) {
        slot.quantity += quantity;
        this.scene.registry.set('inventory', [...inventory]);
        this.updateInventoryUI();
        return true;
      }
    }

    for (let i = 0; i < this.cols * this.rows; i++) {
      const slot = inventory[i];
      if (!slot.itemId || slot.quantity === 0) {
        slot.itemId = itemId;
        slot.quantity = quantity;
        this.scene.registry.set('inventory', [...inventory]);
        this.updateInventoryUI();
        return true;
      }
    }

    return false;
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const inventory = this.scene.registry.get('inventory') as InventorySlot[];

    for (let i = 0; i < this.cols * this.rows; i++) {
      const slot = inventory[i];
      if (slot.itemId === itemId && slot.quantity >= quantity) {
        slot.quantity -= quantity;
        if (slot.quantity <= 0) {
          slot.itemId = null;
          slot.quantity = 0;

          if (this.selectedSlot === i) {
            this.selectedSlot = -1;
            this.scene.registry.set('selectedSeed', null);
          }
        }
        this.scene.registry.set('inventory', [...inventory]);
        this.updateInventoryUI();
        return true;
      }
    }

    return false;
  }

  hasItem(itemId: string, quantity: number = 1): boolean {
    const inventory = this.scene.registry.get('inventory') as InventorySlot[];

    for (const slot of inventory) {
      if (slot.itemId === itemId && slot.quantity >= quantity) {
        return true;
      }
    }

    return false;
  }

  getItemCount(itemId: string): number {
    const inventory = this.scene.registry.get('inventory') as InventorySlot[];
    let count = 0;

    for (const slot of inventory) {
      if (slot.itemId === itemId) {
        count += slot.quantity;
      }
    }

    return count;
  }
}
