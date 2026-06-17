import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { FarmMap } from '../entities/FarmMap';
import { PetEntity } from '../entities/PetEntity';
import { WeatherSystem } from '../systems/WeatherSystem';
import { InventoryUI } from '../ui/InventoryUI';
import { WeatherUI } from '../ui/WeatherUI';
import { ITEMS, CROPS, WEATHER_CONFIG } from '../data/items';
import type { InventorySlot, PlantedCrop, Pet, PetType, WeatherType } from '../types';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private farmMap!: FarmMap;
  private pets: PetEntity[] = [];
  private weatherSystem!: WeatherSystem;
  private weatherUI!: WeatherUI;
  private inventoryUI!: InventoryUI;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;
  private iKey!: Phaser.Input.Keyboard.Key;
  private dayTimeText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private selectedSeedText!: Phaser.GameObjects.Text;
  private npc!: Phaser.GameObjects.Sprite;
  private nearNpc: boolean = false;
  private interactionHint!: Phaser.GameObjects.Text;
  private gameTime: number = 0;
  private dayDuration: number = 60000;
  private isPaused: boolean = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.farmMap = new FarmMap(this);

    const startPos = this.farmMap.getPlayerStartPosition();
    this.player = new Player(this, startPos.x, startPos.y, this.farmMap.getBounds());

    this.physics.add.collider(this.player, this.farmMap.getCollisionGroup());

    const npcPos = this.farmMap.getNpcPosition();
    this.npc = this.add.sprite(npcPos.x, npcPos.y, 'npc');
    this.npc.setDepth(1);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.farmMap.getMapWidth() * this.farmMap.getTileSize(),
      this.farmMap.getMapHeight() * this.farmMap.getTileSize()
    );
    this.cameras.main.setZoom(1.2);

    this.createInput();

    this.inventoryUI = new InventoryUI(this);
    this.inventoryUI.setOnItemSelected((itemId) => {
      this.updateSelectedSeedText(itemId);
    });
    this.inventoryUI.setOnFeedPet(() => this.feedNearestPet());

    this.weatherSystem = new WeatherSystem(this);
    this.weatherUI = new WeatherUI(this, this.weatherSystem);

    this.createHUD();

    this.loadGameData();

    this.loadPetsFromRegistry();
    this.weatherSystem.loadFromRegistry();

    this.weatherSystem.updateParticlesPosition(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY
    );

    this.events.on('wake', this.onWake, this);
  }

  private loadPetsFromRegistry(): void {
    const petDataList = this.registry.get('pets') as Pet[];
    if (petDataList) {
      for (const petData of petDataList) {
        const pet = new PetEntity(
          this,
          this.player.x,
          this.player.y + 20,
          petData.type as PetType,
          petData.name
        );
        pet.setData(petData);
        this.pets.push(pet);
      }
    }
  }

  private savePetsToRegistry(): void {
    const petDataList: Pet[] = this.pets.map((pet) => pet.getData());
    this.registry.set('pets', petDataList);
  }

  private createInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.wasdKeys = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.iKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I);

    this.spaceKey.on('down', this.handleSpaceKey, this);
    this.eKey.on('down', this.handleEKey, this);
    this.iKey.on('down', this.handleIKey, this);
  }

  private createHUD(): void {
    const { width } = this.scale;

    this.dayTimeText = this.add.text(10, 50, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.dayTimeText.setScrollFactor(0);
    this.dayTimeText.setDepth(50);

    this.goldText = this.add.text(width - 10, 50, '', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.goldText.setOrigin(1, 0);
    this.goldText.setScrollFactor(0);
    this.goldText.setDepth(50);

    this.selectedSeedText = this.add.text(10, 75, '', {
      fontSize: '14px',
      color: '#7cfc00',
      fontFamily: 'Microsoft YaHei',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.selectedSeedText.setScrollFactor(0);
    this.selectedSeedText.setDepth(50);

    this.interactionHint = this.add.text(0, 0, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.interactionHint.setOrigin(0.5, 1);
    this.interactionHint.setDepth(50);
    this.interactionHint.setVisible(false);

    this.updateHUD();
  }

  private updateHUD(): void {
    const day = this.registry.get('day') as number;
    const timePercent = this.gameTime / this.dayDuration;
    const hour = Math.floor(6 + timePercent * 12);
    const minute = Math.floor((timePercent * 12 * 60) % 60);
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    this.dayTimeText.setText(`第 ${day} 天  ${timeStr}`);

    const gold = this.registry.get('gold') as number;
    this.goldText.setText(`💰 ${gold}`);

    const selectedSeed = this.registry.get('selectedSeed') as string | null;
    if (selectedSeed) {
      const item = ITEMS[selectedSeed];
      if (item) {
        this.selectedSeedText.setText(`已选种子: ${item.name}`);
      }
    } else {
      this.selectedSeedText.setText('');
    }
  }

  private handleSpaceKey(): void {
    if (this.isPaused || this.inventoryUI.getIsVisible()) return;

    const tileSize = this.farmMap.getTileSize();
    const facingTile = this.player.getFacingTilePosition(tileSize);

    if (!this.farmMap.isSoilTile(facingTile.x, facingTile.y)) {
      return;
    }

    if (this.farmMap.isMature(facingTile.x, facingTile.y)) {
      this.harvestCrop(facingTile.x, facingTile.y);
      return;
    }

    if (this.farmMap.hasCrop(facingTile.x, facingTile.y)) {
      return;
    }

    if (!this.farmMap.isTilled(facingTile.x, facingTile.y)) {
      this.tillSoil(facingTile.x, facingTile.y);
      return;
    }

    const selectedSeed = this.registry.get('selectedSeed') as string | null;
    if (selectedSeed) {
      this.plantSeed(facingTile.x, facingTile.y, selectedSeed);
    }
  }

  private tillSoil(tileX: number, tileY: number): void {
    if (this.farmMap.tillTile(tileX, tileY)) {
      this.showFloatingText('翻地！', tileX, tileY, '#ffd700');
      this.saveGameData();
    }
  }

  private plantSeed(tileX: number, tileY: number, seedItemId: string): boolean {
    const seedItem = ITEMS[seedItemId];
    if (!seedItem || seedItem.type !== 'seed') return false;

    const inventory = this.registry.get('inventory') as InventorySlot[];
    let hasSeed = false;

    for (const slot of inventory) {
      if (slot.itemId === seedItemId && slot.quantity > 0) {
        hasSeed = true;
        break;
      }
    }

    if (!hasSeed) {
      this.showFloatingText('没有种子了！', tileX, tileY, '#ff6347');
      return false;
    }

    let cropId = '';
    for (const [id, crop] of Object.entries(CROPS)) {
      if (crop.seedItemId === seedItemId) {
        cropId = id;
        break;
      }
    }

    if (!cropId) return false;

    const currentDay = this.registry.get('day') as number;
    if (!this.farmMap.plantCrop(tileX, tileY, cropId, currentDay)) {
      return false;
    }

    this.inventoryUI.removeItem(seedItemId, 1);

    const crop = CROPS[cropId];
    this.showFloatingText(`种植${crop.name}！`, tileX, tileY, '#7cfc00');

    this.saveGameData();
    return true;
  }

  private harvestCrop(tileX: number, tileY: number): void {
    const cropItemId = this.farmMap.harvestCrop(tileX, tileY);
    if (cropItemId) {
      if (this.inventoryUI.addItem(cropItemId, 1)) {
        const item = ITEMS[cropItemId];
        this.showFloatingText(`收获${item.name}！`, tileX, tileY, '#7cfc00');
      } else {
        this.showFloatingText('背包已满！', tileX, tileY, '#ff6347');
      }
    }

    this.saveGameData();
  }

  private showFloatingText(text: string, tileX: number, tileY: number, color: string): void {
    const tileSize = this.farmMap.getTileSize();
    const x = tileX * tileSize + tileSize / 2;
    const y = tileY * tileSize;

    const floatText = this.add.text(x, y, text, {
      fontSize: '14px',
      color: color,
      fontFamily: 'Microsoft YaHei',
      stroke: '#000000',
      strokeThickness: 2
    });
    floatText.setOrigin(0.5);
    floatText.setDepth(100);

    this.tweens.add({
      targets: floatText,
      y: y - 40,
      alpha: 0,
      duration: 1500,
      ease: 'Power2.out',
      onComplete: () => {
        floatText.destroy();
      }
    });
  }

  private handleEKey(): void {
    if (this.isPaused) return;

    if (this.inventoryUI.getIsVisible()) {
      this.inventoryUI.hide();
      this.isPaused = false;
      return;
    }

    if (this.nearNpc) {
      this.openShop();
    }
  }

  private handleIKey(): void {
    if (this.isPaused && !this.inventoryUI.getIsVisible()) return;

    const visible = this.inventoryUI.toggle();
    this.isPaused = visible;
  }

  private feedNearestPet(): boolean {
    let nearestPet: PetEntity | null = null;
    let nearestDistance = Infinity;

    for (const pet of this.pets) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        pet.x,
        pet.y
      );
      if (distance < 80 && distance < nearestDistance) {
        nearestDistance = distance;
        nearestPet = pet;
      }
    }

    if (nearestPet) {
      nearestPet.feed();
      this.showFloatingText(
        `${nearestPet.getData().name} 吃得很开心！`,
        Math.floor(nearestPet.x / this.farmMap.getTileSize()),
        Math.floor(nearestPet.y / this.farmMap.getTileSize()),
        '#ff69b4'
      );
      this.saveGameData();
      return true;
    } else {
      this.showFloatingText(
        '附近没有宠物！',
        Math.floor(this.player.x / this.farmMap.getTileSize()),
        Math.floor(this.player.y / this.farmMap.getTileSize()),
        '#ff6347'
      );
      return false;
    }
  }

  private openShop(): void {
    this.isPaused = true;
    this.scene.launch('ShopScene');
    this.scene.pause();
  }

  private onWake(): void {
    this.isPaused = false;
    this.updateHUD();
    this.inventoryUI.updateInventoryUI();
    this.checkNewPets();
  }

  private checkNewPets(): void {
    const petDataList = this.registry.get('pets') as Pet[];
    if (!petDataList) return;

    for (const petData of petDataList) {
      const exists = this.pets.some((p) => p.getData().id === petData.id);
      if (!exists) {
        const pet = new PetEntity(
          this,
          this.player.x,
          this.player.y + 20,
          petData.type as PetType,
          petData.name
        );
        pet.setData(petData);
        this.pets.push(pet);
        this.showFloatingText(
          `${petData.name} 加入了农场！`,
          Math.floor(this.player.x / this.farmMap.getTileSize()),
          Math.floor(this.player.y / this.farmMap.getTileSize()),
          '#ffd700'
        );
      }
    }
  }

  private checkNpcProximity(): void {
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.npc.x,
      this.npc.y
    );

    this.nearNpc = distance < 60;

    if (this.nearNpc && !this.isPaused) {
      this.interactionHint.setPosition(this.npc.x, this.npc.y - 40);
      this.interactionHint.setText('按 E 键 打开商店');
      this.interactionHint.setVisible(true);
    } else {
      this.interactionHint.setVisible(false);
    }
  }

  private updateSelectedSeedText(itemId: string | null): void {
    this.registry.set('selectedSeed', itemId);
    this.updateHUD();
  }

  private advanceDay(): void {
    const currentDay = this.registry.get('day') as number;
    const newDay = currentDay + 1;
    this.registry.set('day', newDay);

    const weatherConfig = WEATHER_CONFIG[this.weatherSystem.getCurrentWeather()];
    this.farmMap.advanceDay(newDay, weatherConfig.growthMultiplier);

    for (const pet of this.pets) {
      pet.advanceDay();
      if (pet.shouldHelpTill()) {
        this.tryPetHelpTill(pet);
      }
    }

    this.weatherSystem.advanceDay();

    const newWeatherConfig = WEATHER_CONFIG[this.weatherSystem.getCurrentWeather()];
    if (newWeatherConfig.damageCrops) {
      this.damageMatureCrops();
    }

    this.savePetsToRegistry();

    this.gameTime = 0;

    this.weatherUI.showTransition();

    this.showDayTransition(newDay);

    this.saveGameData();
  }

  private tryPetHelpTill(pet: PetEntity): void {
    const tileSize = this.farmMap.getTileSize();
    const petTileX = Math.floor(pet.x / tileSize);
    const petTileY = Math.floor(pet.y / tileSize);

    const offsets = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-2, 0], [2, 0], [0, -2], [0, 2]
    ];

    Phaser.Utils.Array.Shuffle(offsets);

    for (const [dx, dy] of offsets) {
      const tx = petTileX + dx;
      const ty = petTileY + dy;
      if (
        this.farmMap.isSoilTile(tx, ty) &&
        !this.farmMap.isTilled(tx, ty) &&
        !this.farmMap.hasCrop(tx, ty)
      ) {
        if (this.farmMap.tillTile(tx, ty)) {
          pet.showHelpAnim();
          this.showFloatingText(
            `${pet.getData().name} 帮忙翻地了！`,
            tx,
            ty,
            '#ffd700'
          );
          break;
        }
      }
    }
  }

  private damageMatureCrops(): void {
    const allCrops = this.farmMap.getAllCrops();
    const matureCrops = allCrops.filter((crop) => {
      const cropData = CROPS[crop.cropId];
      const daysGrown = this.registry.get('day') - crop.plantedDay;
      return daysGrown >= cropData.growthDays;
    });

    if (matureCrops.length === 0) return;

    const damageCount = Phaser.Math.Between(1, 2);
    const toDamage = Phaser.Utils.Array.Shuffle(matureCrops).slice(0, damageCount);

    for (const crop of toDamage) {
      this.farmMap.removeCrop(crop.tileX, crop.tileY);
      this.showFloatingText('作物被暴风雨摧毁！', crop.tileX, crop.tileY, '#ff0000');
    }
  }

  private showDayTransition(day: number): void {
    const { width, height } = this.scale;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);

    const dayText = this.add.text(width / 2, height / 2, `第 ${day} 天`, {
      fontSize: '48px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei'
    });
    dayText.setOrigin(0.5);
    dayText.setScrollFactor(0);
    dayText.setDepth(201);

    this.tweens.add({
      targets: [overlay, dayText],
      alpha: 0,
      duration: 2000,
      delay: 1000,
      ease: 'Power2.inOut',
      onComplete: () => {
        overlay.destroy();
        dayText.destroy();
      }
    });
  }

  private loadGameData(): void {
    const savedData = localStorage.getItem('stardew_farm_save');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        this.registry.set('gold', data.gold || 100);
        this.registry.set('day', data.day || 1);

        if (data.inventory) {
          this.registry.set('inventory', data.inventory);
        }

        if (data.pets) {
          this.registry.set('pets', data.pets);
        }

        if (data.weather) {
          this.registry.set('weather', data.weather);
        }

        if (data.tilledTiles) {
          this.farmMap.loadTilledTiles(data.tilledTiles);
        }

        if (data.plantedCrops) {
          this.farmMap.loadCrops(data.plantedCrops);
        }

        this.updateHUD();
      } catch (e) {
        console.error('Failed to load save data:', e);
      }
    }
  }

  private saveGameData(): void {
    this.savePetsToRegistry();

    const data = {
      gold: this.registry.get('gold'),
      day: this.registry.get('day'),
      inventory: this.registry.get('inventory'),
      pets: this.registry.get('pets'),
      weather: this.registry.get('weather'),
      tilledTiles: this.farmMap.getTilledTiles(),
      plantedCrops: this.farmMap.getAllCrops()
    };

    localStorage.setItem('stardew_farm_save', JSON.stringify(data));
  }

  update(_time: number, delta: number): void {
    if (this.isPaused) return;

    const weatherConfig = WEATHER_CONFIG[this.weatherSystem.getCurrentWeather()];
    const speedMultiplier = weatherConfig.playerSpeedMultiplier;

    const directionInput = {
      up: this.wasdKeys.up.isDown || this.cursors.up?.isDown || false,
      down: this.wasdKeys.down.isDown || this.cursors.down?.isDown || false,
      left: this.wasdKeys.left.isDown || this.cursors.left?.isDown || false,
      right: this.wasdKeys.right.isDown || this.cursors.right?.isDown || false
    };

    this.player.update(directionInput, speedMultiplier);

    for (const pet of this.pets) {
      pet.update(this.player.x, this.player.y, delta);
    }

    this.weatherSystem.update(delta);

    this.weatherSystem.updateParticlesPosition(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY
    );

    this.checkNpcProximity();

    this.gameTime += delta;
    if (this.gameTime >= this.dayDuration) {
      this.advanceDay();
    }

    this.updateHUD();

    this.player.setDepth(Math.floor(this.player.y / 32) + 10);
    this.npc.setDepth(Math.floor(this.npc.y / 32) + 10);

    for (const pet of this.pets) {
      pet.setDepth(Math.floor(pet.y / 32) + 10);
    }
  }
}
