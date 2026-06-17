import Phaser from 'phaser';
import type { Pet, PetType } from '../types';
import { PET_NAMES } from '../data/items';

export class PetEntity {
  private scene: Phaser.Scene;
  private petData: Pet;
  private sprite: Phaser.GameObjects.Sprite;
  private targetX: number = 0;
  private targetY: number = 0;
  private isPaused: boolean = false;
  private pauseTimer: number = 0;
  private followOffset: { x: number; y: number } = { x: 0, y: 0 };
  private moveSpeed: number = 100;
  private bounceOffset: number = 0;
  private bounceTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PetType, name?: string) {
    this.scene = scene;

    this.petData = {
      id: Phaser.Utils.String.UUID(),
      type: type,
      name: name || PET_NAMES[type][Math.floor(Math.random() * PET_NAMES[type].length)],
      mood: 80,
      hunger: 80,
      isFollowing: true,
      helpedToday: false,
      lastFedDay: scene.registry.get('day') as number
    };

    this.sprite = scene.add.sprite(x, y, type);
    this.sprite.setDepth(5);

    this.targetX = x;
    this.targetY = y;

    this.randomizeFollowOffset();
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  setDepth(depth: number): void {
    this.sprite.setDepth(depth);
  }

  getData(): Pet {
    return { ...this.petData };
  }

  setData(data: Pet): void {
    this.petData = { ...data };
    this.sprite.setTexture(data.type);
  }

  private randomizeFollowOffset(): void {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 30;
    this.followOffset.x = Math.cos(angle) * distance;
    this.followOffset.y = Math.sin(angle) * distance;
  }

  update(playerX: number, playerY: number, delta: number): void {
    if (!this.petData.isFollowing) {
      this.sprite.setAlpha(0.5);
      return;
    }

    this.sprite.setAlpha(1);

    if (this.isPaused) {
      this.pauseTimer -= delta;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
        this.randomizeFollowOffset();
      }
    } else {
      if (Math.random() < 0.002) {
        this.isPaused = true;
        this.pauseTimer = 1000 + Math.random() * 2000;
      }

      const idealX = playerX + this.followOffset.x;
      const idealY = playerY + this.followOffset.y;

      const dx = idealX - this.sprite.x;
      const dy = idealY - this.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        const moveAmount = (this.moveSpeed * delta) / 1000;
        const ratio = Math.min(moveAmount / distance, 1);

        this.sprite.x += dx * ratio;
        this.sprite.y += dy * ratio;

        if (dx !== 0) {
          this.sprite.setFlipX(dx < 0);
        }
      }

      if (distance > 200) {
        this.sprite.x = playerX + this.followOffset.x;
        this.sprite.y = playerY + this.followOffset.y;
        this.randomizeFollowOffset();
      }
    }

    this.bounceTimer += delta;
    if (this.bounceTimer > 150) {
      this.bounceTimer = 0;
      this.bounceOffset = this.bounceOffset === 0 ? -2 : 0;
    }

    this.sprite.y += this.bounceOffset * 0.1;
  }

  feed(): void {
    this.petData.hunger = Math.min(100, this.petData.hunger + 40);
    this.petData.mood = Math.min(100, this.petData.mood + 10);
    this.petData.isFollowing = true;
    this.petData.lastFedDay = this.scene.registry.get('day') as number;

    this.showHeart();
  }

  private showHeart(): void {
    const heart = this.scene.add.text(this.sprite.x, this.sprite.y - 30, '❤️', {
      fontSize: '16px'
    });
    heart.setOrigin(0.5);
    heart.setDepth(100);

    this.scene.tweens.add({
      targets: heart,
      y: this.sprite.y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2.out',
      onComplete: () => {
        heart.destroy();
      }
    });
  }

  advanceDay(): void {
    this.petData.hunger = Math.max(0, this.petData.hunger - 30);
    this.petData.helpedToday = false;

    if (this.petData.hunger <= 0) {
      this.petData.isFollowing = false;
      this.petData.mood = Math.max(0, this.petData.mood - 20);
    } else {
      this.petData.mood = Math.min(100, this.petData.mood + 5);
    }
  }

  shouldHelpTill(): boolean {
    if (this.petData.helpedToday) return false;
    if (this.petData.mood < 70) return false;
    if (this.petData.hunger < 30) return false;

    return Math.random() < 0.4;
  }

  showHelpAnim(): void {
    this.petData.helpedToday = true;
    this.showSparkle();
  }

  private showSparkle(): void {
    const sparkle = this.scene.add.text(this.sprite.x, this.sprite.y - 30, '✨', {
      fontSize: '16px'
    });
    sparkle.setOrigin(0.5);
    sparkle.setDepth(100);

    this.scene.tweens.add({
      targets: sparkle,
      y: this.sprite.y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Power2.out',
      onComplete: () => {
        sparkle.destroy();
      }
    });
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
