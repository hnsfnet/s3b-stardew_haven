import type { Item, CropData } from '../types';

export const ITEMS: Record<string, Item> = {
  potato_seed: {
    id: 'potato_seed',
    name: '土豆种子',
    type: 'seed',
    price: 20,
    sellPrice: 5,
    icon: 'potato_seed',
    description: '可以种植的土豆种子'
  },
  carrot_seed: {
    id: 'carrot_seed',
    name: '胡萝卜种子',
    type: 'seed',
    price: 30,
    sellPrice: 8,
    icon: 'carrot_seed',
    description: '可以种植的胡萝卜种子'
  },
  pumpkin_seed: {
    id: 'pumpkin_seed',
    name: '南瓜种子',
    type: 'seed',
    price: 50,
    sellPrice: 15,
    icon: 'pumpkin_seed',
    description: '可以种植的南瓜种子'
  },
  potato: {
    id: 'potato',
    name: '土豆',
    type: 'crop',
    price: 0,
    sellPrice: 35,
    icon: 'potato',
    description: '新鲜的土豆'
  },
  carrot: {
    id: 'carrot',
    name: '胡萝卜',
    type: 'crop',
    price: 0,
    sellPrice: 50,
    icon: 'carrot',
    description: '甜脆的胡萝卜'
  },
  pumpkin: {
    id: 'pumpkin',
    name: '南瓜',
    type: 'crop',
    price: 0,
    sellPrice: 100,
    icon: 'pumpkin',
    description: '大大的南瓜'
  }
};

export const CROPS: Record<string, CropData> = {
  potato: {
    id: 'potato',
    name: '土豆',
    seedItemId: 'potato_seed',
    cropItemId: 'potato',
    growthStages: 4,
    daysPerStage: 1,
    sellPrice: 35,
    seedPrice: 20
  },
  carrot: {
    id: 'carrot',
    name: '胡萝卜',
    seedItemId: 'carrot_seed',
    cropItemId: 'carrot',
    growthStages: 4,
    daysPerStage: 1,
    sellPrice: 50,
    seedPrice: 30
  },
  pumpkin: {
    id: 'pumpkin',
    name: '南瓜',
    seedItemId: 'pumpkin_seed',
    cropItemId: 'pumpkin',
    growthStages: 4,
    daysPerStage: 2,
    sellPrice: 100,
    seedPrice: 50
  }
};

export const INVENTORY_SIZE = 20;
