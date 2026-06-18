import { Component } from '../Component';
import type { CropStage } from '../../types';

export class GrowthComponent extends Component {
  readonly type = 'growth';

  cropId: string;
  stage: CropStage = 'seed';
  growthProgress: number = 0;
  plantedDay: number;
  currentDay: number;
  growthMultiplier: number = 1;

  constructor(cropId: string, plantedDay: number) {
    super();
    this.cropId = cropId;
    this.plantedDay = plantedDay;
    this.currentDay = plantedDay;
  }

  advanceDay(multiplier: number = 1): void {
    this.growthProgress += multiplier;
    this.currentDay++;
  }

  isMature(totalGrowthDays: number): boolean {
    return this.growthProgress >= totalGrowthDays;
  }
}
