export type ItemType = 'seed' | 'crop' | 'tool';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  sellPrice: number;
  icon: string;
  description: string;
}

export type CropStage = 'seed' | 'sprout' | 'growing' | 'mature';

export interface CropData {
  id: string;
  name: string;
  seedItemId: string;
  cropItemId: string;
  growthStages: number;
  daysPerStage: number;
  sellPrice: number;
  seedPrice: number;
}

export interface PlantedCrop {
  id: string;
  cropId: string;
  tileX: number;
  tileY: number;
  stage: CropStage;
  currentDay: number;
  plantedDay: number;
}

export type TileType = 'grass' | 'tilled' | 'water' | 'fence' | 'path' | 'soil';

export interface InventorySlot {
  itemId: string | null;
  quantity: number;
}

export interface GameState {
  gold: number;
  day: number;
  time: number;
  inventory: InventorySlot[];
  plantedCrops: PlantedCrop[];
  tilledTiles: { x: number; y: number }[];
  selectedSeed: string | null;
}

export interface Position {
  x: number;
  y: number;
}
