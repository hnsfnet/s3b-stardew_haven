import cropsConfig from '../config/crops.json';
import petsConfig from '../config/pets.json';
import weatherConfig from '../config/weather.json';
import itemsConfig from '../config/items.json';
import type { PetType, WeatherType } from '../types';

export interface CropConfig {
  id: string;
  name: string;
  seedItemId: string;
  cropItemId: string;
  seedPrice: number;
  sellPrice: number;
  growthDays: number;
  growthStages: number;
  daysPerStage: number;
  color: string;
  description: string;
}

export interface PetConfig {
  type: PetType;
  name: string;
  price: number;
  followSpeed: number;
  moodDecayPerDay: number;
  hungerDecayPerDay: number;
  feedHungerRestore: number;
  feedMoodBoost: number;
  helpTillChance: number;
  helpTillMoodThreshold: number;
  helpTillHungerThreshold: number;
  names: string[];
}

export interface WeatherConfigEntry {
  type: WeatherType;
  name: string;
  icon: string;
  growthMultiplier: number;
  playerSpeedMultiplier: number;
  damageCrops: boolean;
  damageChance: number;
  damageCountMin: number;
  damageCountMax: number;
  hasRainParticles: boolean;
  hasStormParticles: boolean;
  hasLightning: boolean;
  lightningMinInterval?: number;
  lightningMaxInterval?: number;
  darkOverlayAlpha: number;
  darkOverlayColor?: string;
  weatherWeight: number;
  bgColor: string;
  lineColor: string;
}

export interface ItemConfig {
  id: string;
  name: string;
  type: 'seed' | 'crop' | 'pet_food' | 'pet';
  price: number;
  sellPrice: number;
  description: string;
  color: string;
  cropId?: string;
  petType?: PetType;
}

export class ConfigLoader {
  private static instance: ConfigLoader;
  private crops: Record<string, CropConfig>;
  private pets: Record<string, PetConfig>;
  private weather: Record<string, WeatherConfigEntry>;
  private items: Record<string, ItemConfig>;
  private weatherWeights: WeatherType[] = [];

  private constructor() {
    this.crops = cropsConfig as Record<string, CropConfig>;
    this.pets = petsConfig as Record<string, PetConfig>;
    this.weather = weatherConfig as Record<string, WeatherConfigEntry>;
    this.items = itemsConfig as Record<string, ItemConfig>;
    this.buildWeatherWeights();
  }

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  private buildWeatherWeights(): void {
    this.weatherWeights = [];
    for (const [type, config] of Object.entries(this.weather)) {
      for (let i = 0; i < config.weatherWeight; i++) {
        this.weatherWeights.push(type as WeatherType);
      }
    }
  }

  getCrop(id: string): CropConfig | undefined {
    return this.crops[id];
  }

  getAllCrops(): Record<string, CropConfig> {
    return { ...this.crops };
  }

  getPet(type: PetType): PetConfig | undefined {
    return this.pets[type];
  }

  getAllPets(): Record<string, PetConfig> {
    return { ...this.pets };
  }

  getWeather(type: WeatherType): WeatherConfigEntry | undefined {
    return this.weather[type];
  }

  getAllWeather(): Record<string, WeatherConfigEntry> {
    return { ...this.weather };
  }

  getRandomWeather(): WeatherType {
    return this.weatherWeights[Math.floor(Math.random() * this.weatherWeights.length)];
  }

  getItem(id: string): ItemConfig | undefined {
    return this.items[id];
  }

  getAllItems(): Record<string, ItemConfig> {
    return { ...this.items };
  }

  getItemsByType(type: string): ItemConfig[] {
    return Object.values(this.items).filter((item) => item.type === type);
  }

  getShopItems(): ItemConfig[] {
    return Object.values(this.items).filter(
      (item) => item.type === 'seed' || item.type === 'pet_food' || item.type === 'pet'
    );
  }

  getSellableItems(): ItemConfig[] {
    return Object.values(this.items).filter((item) => item.type === 'crop');
  }
}
