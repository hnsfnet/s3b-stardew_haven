import type {
  InventorySlot,
  Pet,
  WeatherState,
  PlantedCrop,
  WeatherType
} from '../types';
import { ConfigLoader } from '../config/ConfigLoader';

const SAVE_KEY = 'stardew_farm_save';

export interface SaveData {
  gold: number;
  day: number;
  inventory: InventorySlot[];
  pets: Pet[];
  weather: WeatherState;
  tilledTiles: string[];
  plantedCrops: PlantedCrop[];
  selectedSeed: string | null;
}

export class GameStateManager {
  private static instance: GameStateManager;
  private registry: Phaser.Data.DataManager | null = null;
  private config: ConfigLoader;

  private constructor() {
    this.config = ConfigLoader.getInstance();
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  setRegistry(registry: Phaser.Data.DataManager): void {
    this.registry = registry;
  }

  get gold(): number {
    return this.get('gold', 100);
  }

  set gold(value: number) {
    this.set('gold', value);
  }

  addGold(amount: number): number {
    const newGold = this.gold + amount;
    this.gold = newGold;
    return newGold;
  }

  spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  get day(): number {
    return this.get('day', 1);
  }

  set day(value: number) {
    this.set('day', value);
  }

  advanceDay(): number {
    this.day++;
    return this.day;
  }

  get inventory(): InventorySlot[] {
    return this.get('inventory', this.createDefaultInventory());
  }

  set inventory(value: InventorySlot[]) {
    this.set('inventory', value);
  }

  private createDefaultInventory(): InventorySlot[] {
    const slots: InventorySlot[] = [];
    for (let i = 0; i < 20; i++) {
      slots.push({ itemId: null, quantity: 0 });
    }
    return slots;
  }

  initDefaultInventory(): void {
    if (!this.registry?.has('inventory') || this.inventory.length === 0) {
      const inv = this.createDefaultInventory();
      inv[0] = { itemId: 'potato_seed', quantity: 5 };
      inv[1] = { itemId: 'carrot_seed', quantity: 3 };
      inv[2] = { itemId: 'pet_food', quantity: 3 };
      this.inventory = inv;
    }
  }

  addItem(itemId: string, quantity: number = 1): boolean {
    const inv = [...this.inventory];
    let remaining = quantity;

    for (const slot of inv) {
      if (slot.itemId === itemId && slot.quantity > 0) {
        slot.quantity += remaining;
        remaining = 0;
        break;
      }
    }

    if (remaining > 0) {
      for (const slot of inv) {
        if (!slot.itemId || slot.quantity === 0) {
          slot.itemId = itemId;
          slot.quantity = remaining;
          remaining = 0;
          break;
        }
      }
    }

    if (remaining > 0) return false;

    this.inventory = inv;
    return true;
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const inv = [...this.inventory];
    let remaining = quantity;

    for (const slot of inv) {
      if (slot.itemId === itemId && slot.quantity > 0) {
        const remove = Math.min(slot.quantity, remaining);
        slot.quantity -= remove;
        remaining -= remove;
        if (slot.quantity <= 0) {
          slot.itemId = null;
          slot.quantity = 0;
        }
        if (remaining <= 0) break;
      }
    }

    if (remaining > 0) return false;

    this.inventory = inv;
    return true;
  }

  getItemCount(itemId: string): number {
    let count = 0;
    for (const slot of this.inventory) {
      if (slot.itemId === itemId) {
        count += slot.quantity;
      }
    }
    return count;
  }

  hasItem(itemId: string, quantity: number = 1): boolean {
    return this.getItemCount(itemId) >= quantity;
  }

  get pets(): Pet[] {
    return this.get('pets', []);
  }

  set pets(value: Pet[]) {
    this.set('pets', value);
  }

  addPet(pet: Pet): void {
    const pets = [...this.pets, pet];
    this.pets = pets;
  }

  hasPetType(type: string): boolean {
    return this.pets.some((p) => p.type === type);
  }

  updatePet(petId: string, updates: Partial<Pet>): boolean {
    const pets = [...this.pets];
    const index = pets.findIndex((p) => p.id === petId);
    if (index === -1) return false;
    pets[index] = { ...pets[index], ...updates };
    this.pets = pets;
    return true;
  }

  get weather(): WeatherState {
    return this.get('weather', {
      current: 'sunny',
      yesterday: 'sunny',
      transitioning: false
    });
  }

  set weather(value: WeatherState) {
    this.set('weather', value);
  }

  setCurrentWeather(type: WeatherType): void {
    const w = { ...this.weather };
    w.yesterday = w.current;
    w.current = type;
    w.transitioning = true;
    this.weather = w;
  }

  get selectedSeed(): string | null {
    return this.get('selectedSeed', null);
  }

  set selectedSeed(value: string | null) {
    this.set('selectedSeed', value);
  }

  randomizeWeather(): WeatherType {
    const newWeather = this.config.getRandomWeather();
    this.setCurrentWeather(newWeather);
    return newWeather;
  }

  private get<T>(key: string, defaultValue: T): T {
    if (!this.registry) return defaultValue;
    const value = this.registry.get(key);
    return value !== undefined ? (value as T) : defaultValue;
  }

  private set<T>(key: string, value: T): void {
    if (this.registry) {
      this.registry.set(key, value);
    }
  }

  save(tilledTiles: string[], plantedCrops: PlantedCrop[]): void {
    const data: SaveData = {
      gold: this.gold,
      day: this.day,
      inventory: this.inventory,
      pets: this.pets,
      weather: this.weather,
      tilledTiles,
      plantedCrops,
      selectedSeed: this.selectedSeed
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  load(): SaveData | null {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  applySaveData(data: SaveData): void {
    this.gold = data.gold;
    this.day = data.day;
    this.inventory = data.inventory;
    this.pets = data.pets;
    this.weather = data.weather;
    this.selectedSeed = data.selectedSeed;
  }

  hasSaveData(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  clearSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}
