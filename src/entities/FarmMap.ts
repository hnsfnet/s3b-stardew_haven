import Phaser from 'phaser';
import type { TileType, PlantedCrop } from '../types';

const TILE_SIZE = 32;
const MAP_WIDTH = 30;
const MAP_HEIGHT = 25;

export class FarmMap {
  private scene: Phaser.Scene;
  private mapData: TileType[][];
  private tileSprites: Phaser.GameObjects.Sprite[][] = [];
  private tilledTiles: Set<string> = new Set();
  private plantedCrops: Map<string, PlantedCrop> = new Map();
  private cropSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private collisionTiles: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.mapData = this.generateMapData();
    this.collisionTiles = scene.physics.add.staticGroup();
    this.buildMap();
  }

  private generateMapData(): TileType[][] {
    const data: TileType[][] = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
      data[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (y === 0 || y === MAP_HEIGHT - 1 || x === 0 || x === MAP_WIDTH - 1) {
          data[y][x] = 'fence';
        } else {
          data[y][x] = 'grass';
        }
      }
    }

    for (let y = 3; y < 10; y++) {
      for (let x = 4; x < 14; x++) {
        data[y][x] = 'soil';
      }
    }

    for (let y = 14; y < 19; y++) {
      for (let x = 4; x < 12; x++) {
        data[y][x] = 'water';
      }
    }

    for (let y = 10; y < 22; y++) {
      data[y][16] = 'path';
    }
    for (let x = 8; x < 20; x++) {
      data[11][x] = 'path';
    }

    for (let y = 12; y < 16; y++) {
      for (let x = 18; x < 26; x++) {
        if (data[y][x] === 'grass') {
          data[y][x] = 'soil';
        }
      }
    }

    return data;
  }

  private buildMap(): void {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      this.tileSprites[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tileType = this.mapData[y][x];
        const textureKey = this.getTextureForType(tileType);
        const sprite = this.scene.add.sprite(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          textureKey
        );
        sprite.setDepth(0);

        this.tileSprites[y][x] = sprite;

        if (tileType === 'water' || tileType === 'fence') {
          const collider = this.collisionTiles.create(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            null
          );
          collider.setVisible(false);
          collider.body?.setSize(TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  private getTextureForType(type: TileType): string {
    switch (type) {
      case 'grass': return 'grass';
      case 'tilled': return 'tilled';
      case 'water': return 'water';
      case 'fence': return 'fence';
      case 'path': return 'path';
      case 'soil': return 'soil';
      default: return 'grass';
    }
  }

  getTileSize(): number {
    return TILE_SIZE;
  }

  getMapWidth(): number {
    return MAP_WIDTH;
  }

  getMapHeight(): number {
    return MAP_HEIGHT;
  }

  getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      TILE_SIZE,
      TILE_SIZE,
      (MAP_WIDTH - 2) * TILE_SIZE,
      (MAP_HEIGHT - 2) * TILE_SIZE
    );
  }

  getCollisionGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.collisionTiles;
  }

  isSoilTile(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
      return false;
    }
    return this.mapData[tileY][tileX] === 'soil';
  }

  isTilled(tileX: number, tileY: number): boolean {
    const key = `${tileX},${tileY}`;
    return this.tilledTiles.has(key);
  }

  tillTile(tileX: number, tileY: number): boolean {
    if (!this.isSoilTile(tileX, tileY) || this.isTilled(tileX, tileY)) {
      return false;
    }

    const key = `${tileX},${tileY}`;
    this.tilledTiles.add(key);
    
    if (this.tileSprites[tileY] && this.tileSprites[tileY][tileX]) {
      this.tileSprites[tileY][tileX].setTexture('tilled');
    }

    return true;
  }

  hasCrop(tileX: number, tileY: number): boolean {
    const key = `${tileX},${tileY}`;
    return this.plantedCrops.has(key);
  }

  getCrop(tileX: number, tileY: number): PlantedCrop | undefined {
    const key = `${tileX},${tileY}`;
    return this.plantedCrops.get(key);
  }

  plantCrop(tileX: number, tileY: number, cropId: string, currentDay: number): boolean {
    if (!this.isTilled(tileX, tileY) || this.hasCrop(tileX, tileY)) {
      return false;
    }

    const key = `${tileX},${tileY}`;
    const crop: PlantedCrop = {
      id: Phaser.Utils.String.UUID(),
      cropId: cropId,
      tileX: tileX,
      tileY: tileY,
      stage: 'seed',
      currentDay: currentDay,
      plantedDay: currentDay
    };

    this.plantedCrops.set(key, crop);
    this.createCropSprite(crop);
    return true;
  }

  private createCropSprite(crop: PlantedCrop): void {
    const key = `${crop.tileX},${crop.tileY}`;
    const textureKey = `${crop.cropId}_${crop.stage}`;

    const sprite = this.scene.add.sprite(
      crop.tileX * TILE_SIZE + TILE_SIZE / 2,
      crop.tileY * TILE_SIZE + TILE_SIZE / 2,
      textureKey
    );
    sprite.setDepth(Math.floor(crop.tileY) + 5);

    this.cropSprites.set(key, sprite);
  }

  updateCropSprite(crop: PlantedCrop): void {
    const key = `${crop.tileX},${crop.tileY}`;
    const sprite = this.cropSprites.get(key);

    if (sprite) {
      const textureKey = `${crop.cropId}_${crop.stage}`;
      sprite.setTexture(textureKey);
    }
  }

  removeCrop(tileX: number, tileY: number): void {
    const key = `${tileX},${tileY}`;
    const sprite = this.cropSprites.get(key);

    if (sprite) {
      sprite.destroy();
      this.cropSprites.delete(key);
    }

    this.plantedCrops.delete(key);
  }

  advanceDay(currentDay: number): void {
    this.plantedCrops.forEach((crop) => {
      this.updateCropGrowth(crop, currentDay);
    });
  }

  private updateCropGrowth(crop: PlantedCrop, currentDay: number): void {
    const daysSincePlanted = currentDay - crop.plantedDay;

    if (daysSincePlanted < 1) {
      crop.stage = 'seed';
    } else if (daysSincePlanted < 3) {
      crop.stage = 'sprout';
    } else if (daysSincePlanted < 5) {
      crop.stage = 'growing';
    } else {
      crop.stage = 'mature';
    }

    this.updateCropSprite(crop);
  }

  isMature(tileX: number, tileY: number): boolean {
    const crop = this.getCrop(tileX, tileY);
    return crop ? crop.stage === 'mature' : false;
  }

  harvestCrop(tileX: number, tileY: number): string | null {
    if (!this.isMature(tileX, tileY)) {
      return null;
    }

    const crop = this.getCrop(tileX, tileY);
    if (!crop) return null;

    const cropItemId = crop.cropId;
    this.removeCrop(tileX, tileY);

    return cropItemId;
  }

  getPlayerStartPosition(): { x: number; y: number } {
    return {
      x: 16 * TILE_SIZE + TILE_SIZE / 2,
      y: 20 * TILE_SIZE
    };
  }

  getNpcPosition(): { x: number; y: number } {
    return {
      x: 10 * TILE_SIZE + TILE_SIZE / 2,
      y: 22 * TILE_SIZE
    };
  }

  getAllCrops(): PlantedCrop[] {
    return Array.from(this.plantedCrops.values());
  }

  getTilledTiles(): { x: number; y: number }[] {
    const tiles: { x: number; y: number }[] = [];
    this.tilledTiles.forEach((_, key) => {
      const [x, y] = key.split(',').map(Number);
      tiles.push({ x, y });
    });
    return tiles;
  }

  loadCrops(crops: PlantedCrop[]): void {
    crops.forEach((crop) => {
      const key = `${crop.tileX},${crop.tileY}`;
      this.plantedCrops.set(key, crop);
      this.createCropSprite(crop);
    });
  }

  loadTilledTiles(tiles: { x: number; y: number }[]): void {
    tiles.forEach((tile) => {
      const key = `${tile.x},${tile.y}`;
      this.tilledTiles.add(key);
      if (this.tileSprites[tile.y] && this.tileSprites[tile.y][tile.x]) {
        this.tileSprites[tile.y][tile.x].setTexture('tilled');
      }
    });
  }
}
