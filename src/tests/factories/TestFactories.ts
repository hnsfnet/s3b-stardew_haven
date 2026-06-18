import type { PlantedCrop, CropStage, Pet, PetType, InventorySlot, WeatherState } from '../../types';
import { ConfigLoader } from '../../config/ConfigLoader';
import { CropLogic } from '../../logic/CropLogic';
import { PetLogic } from '../../logic/PetLogic';

let uidCounter = 0;
function uid(prefix: string = ''): string {
  uidCounter++;
  return `${prefix}test-${Date.now()}-${uidCounter}`;
}

export function createPlantedCrop(
  overrides: Partial<PlantedCrop> = {}
): PlantedCrop {
  const cropIds = Object.keys(ConfigLoader.getInstance().getAllCrops());
  const defaultCropId = cropIds[0] || 'potato';

  return {
    id: uid('crop'),
    cropId: defaultCropId,
    tileX: overrides.tileX ?? 5,
    tileY: overrides.tileY ?? 5,
    stage: (overrides.stage as CropStage) || 'seed',
    currentDay: overrides.currentDay ?? 1,
    plantedDay: overrides.plantedDay ?? 1,
    growthProgress: overrides.growthProgress ?? 0,
    ...overrides
  };
}

export function createMatureCrop(cropId?: string, overrides: Partial<PlantedCrop> = {}): PlantedCrop {
  const config = ConfigLoader.getInstance().getCrop(cropId || 'potato');
  const growthDays = config?.growthDays || 6;

  return createPlantedCrop({
    cropId: cropId || 'potato',
    growthProgress: growthDays,
    stage: 'mature',
    currentDay: growthDays,
    ...overrides
  });
}

export function createGrowingCrop(cropId?: string, progress?: number): PlantedCrop {
  return createPlantedCrop({
    cropId: cropId || 'potato',
    growthProgress: progress ?? 2,
    ...(progress !== undefined
      ? {}
      : { stage: 'sprout' as CropStage })
  });
}

export function createMultipleCrops(count: number, overrides?: Partial<PlantedCrop>): PlantedCrop[] {
  return Array.from({ length: count }, (_, i) =>
    createPlantedCrop({
      ...overrides,
      tileX: i % 10,
      tileY: Math.floor(i / 10),
      id: `crop-${i}-${Date.now()}`
    })
  );
}

export function createPet(
  overrides: Partial<Pet> = {}
): Pet {
  const type = (overrides.type as PetType) || 'cat';

  return {
    id: uid('pet'),
    type,
    name: overrides.name || '测试宠物',
    mood: overrides.mood ?? 80,
    hunger: overrides.hunger ?? 100,
    isFollowing: overrides.isFollowing ?? true,
    helpedToday: overrides.helpedToday ?? false,
    lastFedDay: overrides.lastFedDay ?? 1,
    ...overrides
  };
}

export function createHappyPet(type?: PetType): Pet {
  return createPet({
    type: type || 'dog',
    mood: 95,
    hunger: 85,
    isFollowing: true,
    helpedToday: false
  });
}

export function createHungryPet(type?: PetType): Pet {
  return createPet({
    type: type || 'rabbit',
    mood: 30,
    hunger: 10,
    isFollowing: false
  });
}

export function createFullPetsArray(): Pet[] {
  return [
    createPet({ type: 'cat', name: '咪咪' }),
    createPet({ type: 'dog', name: '旺财' }),
    createPet({ type: 'rabbit', name: '兔兔' })
  ];
}

export function createInventory(slots: number = 20): InventorySlot[] {
  return Array.from({ length: slots }, () => ({
    itemId: null,
    quantity: 0
  }));
}

export function createInventoryWithItems(
  items: Array<{ itemId: string; quantity: number }>
): InventorySlot[] {
  const slots = createInventory();
  let slotIndex = 0;

  for (const item of items) {
    if (slotIndex >= slots.length) break;
    slots[slotIndex] = {
      itemId: item.itemId,
      quantity: item.quantity
    };
    slotIndex++;
  }

  return slots;
}

export function createFullInventory(
  itemId: string,
  quantity: number = 99
): InventorySlot[] {
  const slots = createInventory();
  slots.forEach((slot, i) => {
    slot.itemId = i < 10 ? itemId : null;
    slot.quantity = i < 10 ? quantity : 0;
  });
  return slots;
}

export function createWeatherState(
  overrides: Partial<WeatherState> = {}
): WeatherState {
  return {
    current: overrides.current || 'sunny',
    yesterday: overrides.yesterday || 'sunny',
    transitioning: overrides.transitioning ?? false,
    ...overrides
  };
}

export function createGameSaveSnapshot(options?: {
  day?: number;
  gold?: number;
  crops?: PlantedCrop[];
  pets?: Pet[];
  weather?: WeatherState;
  inventory?: InventorySlot[];
}) {
  return {
    gold: options?.gold ?? 500,
    day: options?.day ?? 10,
    inventory: options?.inventory ?? createInventoryWithItems([
      { itemId: 'potato_seed', quantity: 10 },
      { itemId: 'pet_food', quantity: 5 }
    ]),
    pets: options?.pets ?? createFullPetsArray(),
    weather: options?.weather ?? createWeatherState({ current: 'sunny' }),
    tilledTiles: Array.from({ length: 20 }, (_, i) => `${i % 10},${Math.floor(i / 10)}`),
    plantedCrops: options?.crops ?? createMultipleCrops(5),
    selectedSeed: 'potato_seed' as string | null
  };
}

export type TestSaveSnapshot = ReturnType<typeof createGameSaveSnapshot>;

export function advanceDayN(
  initialState: {
    pets?: Pet[];
    crops?: PlantedCrop[];
    day: number;
  },
  days: number,
  growthMultiplier: number = 1
) {
  let pets = [...(initialState.pets || [])];
  let crops = [...(initialState.crops || [])];
  let day = initialState.day;

  for (let i = 0; i < days; i++) {
    day++;
    pets = pets.map((p) => PetLogic.advanceDay(p));
    crops = CropLogic.advanceCrops(crops, growthMultiplier);
  }

  return { pets, crops, day };
}
