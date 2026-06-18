import type { PlantedCrop, CropStage } from '../types';
import { ConfigLoader } from '../config/ConfigLoader';

export class CropLogic {
  static calculateStage(crop: PlantedCrop): CropStage {
    const config = ConfigLoader.getInstance().getCrop(crop.cropId);
    if (!config) return 'seed';

    const totalGrowthDays = config.daysPerStage * (config.growthStages - 1);
    const progress = Math.min(crop.growthProgress || 0, totalGrowthDays);

    if (progress < config.daysPerStage) {
      return 'seed';
    } else if (progress < config.daysPerStage * 2) {
      return 'sprout';
    } else if (progress < config.daysPerStage * 3) {
      return 'growing';
    } else {
      return 'mature';
    }
  }

  static grow(crop: PlantedCrop, multiplier: number = 1): PlantedCrop {
    const newCrop = { ...crop };
    newCrop.growthProgress = (newCrop.growthProgress || 0) + multiplier;
    newCrop.stage = this.calculateStage(newCrop);
    return newCrop;
  }

  static isMature(crop: PlantedCrop): boolean {
    const config = ConfigLoader.getInstance().getCrop(crop.cropId);
    if (!config) return false;
    return (crop.growthProgress || 0) >= config.growthDays;
  }

  static getRemainingDays(crop: PlantedCrop): number {
    const config = ConfigLoader.getInstance().getCrop(crop.cropId);
    if (!config) return 0;
    return Math.max(0, config.growthDays - Math.floor(crop.growthProgress || 0));
  }

  static getHarvestItemId(crop: PlantedCrop): string | null {
    const config = ConfigLoader.getInstance().getCrop(crop.cropId);
    return config?.cropItemId || null;
  }

  static getHarvestSellPrice(crop: PlantedCrop): number {
    const config = ConfigLoader.getInstance().getCrop(crop.cropId);
    return config?.sellPrice || 0;
  }

  static filterMatureCrops(crops: PlantedCrop[]): PlantedCrop[] {
    return crops.filter((crop) => this.isMature(crop));
  }

  static advanceCrops(crops: PlantedCrop[], growthMultiplier: number = 1): PlantedCrop[] {
    return crops.map((crop) => this.grow(crop, growthMultiplier));
  }

  static damageRandomMatureCrops(
    crops: PlantedCrop[],
    damageCount: number,
    seed: number = Date.now()
  ): { remaining: PlantedCrop[]; damaged: PlantedCrop[] } {
    const mature = this.filterMatureCrops(crops);
    if (mature.length === 0) {
      return { remaining: [...crops], damaged: [] };
    }

    const shuffled = [...mature].sort(() => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280 - 0.5;
    });

    const toRemove = shuffled.slice(0, Math.min(damageCount, shuffled.length));
    const damagedIds = new Set(toRemove.map((c) => c.id));

    return {
      remaining: crops.filter((c) => !damagedIds.has(c.id)),
      damaged: toRemove
    };
  }
}
