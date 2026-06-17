export type ItemType = 'seed' | 'crop' | 'tool' | 'pet' | 'pet_food';

export type PetType = 'cat' | 'dog' | 'rabbit';

export type WeatherType = 'sunny' | 'rainy' | 'storm';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  sellPrice: number;
  icon: string;
  description: string;
  petType?: PetType;
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
  growthProgress: number;
}

export type TileType = 'grass' | 'tilled' | 'water' | 'fence' | 'path' | 'soil';

export interface InventorySlot {
  itemId: string | null;
  quantity: number;
}

export interface Pet {
  id: string;
  type: PetType;
  name: string;
  mood: number;
  hunger: number;
  isFollowing: boolean;
  helpedToday: boolean;
  lastFedDay: number;
}

export interface WeatherState {
  current: WeatherType;
  yesterday: WeatherType;
  transitioning: boolean;
}

export interface GameState {
  gold: number;
  day: number;
  time: number;
  inventory: InventorySlot[];
  plantedCrops: PlantedCrop[];
  tilledTiles: { x: number; y: number }[];
  selectedSeed: string | null;
  pets: Pet[];
  weather: WeatherState;
}

export interface Position {
  x: number;
  y: number;
}
