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
  },
  cat: {
    id: 'cat',
    name: '小猫咪',
    type: 'pet',
    price: 500,
    sellPrice: 0,
    icon: 'cat',
    description: '一只可爱的小猫咪，心情好时会帮忙翻地',
    petType: 'cat'
  },
  dog: {
    id: 'dog',
    name: '小狗狗',
    type: 'pet',
    price: 600,
    sellPrice: 0,
    icon: 'dog',
    description: '一只忠诚的小狗狗，心情好时会帮忙翻地',
    petType: 'dog'
  },
  rabbit: {
    id: 'rabbit',
    name: '小兔子',
    type: 'pet',
    price: 450,
    sellPrice: 0,
    icon: 'rabbit',
    description: '一只萌萌的小兔子，心情好时会帮忙翻地',
    petType: 'rabbit'
  },
  pet_food: {
    id: 'pet_food',
    name: '宠物饲料',
    type: 'pet_food',
    price: 30,
    sellPrice: 10,
    icon: 'pet_food',
    description: '可以用来喂养宠物，恢复饱食度'
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

export const WEATHER_CONFIG = {
  sunny: {
    name: '晴天',
    icon: '☀️',
    growthMultiplier: 1,
    playerSpeedMultiplier: 1,
    damageCrops: false
  },
  rainy: {
    name: '雨天',
    icon: '🌧️',
    growthMultiplier: 2,
    playerSpeedMultiplier: 0.8,
    damageCrops: false
  },
  storm: {
    name: '暴风雨',
    icon: '⛈️',
    growthMultiplier: 1.5,
    playerSpeedMultiplier: 0.6,
    damageCrops: true
  }
};

export const PET_NAMES: Record<string, string[]> = {
  cat: ['咪咪', '小花', '雪球', '橘子'],
  dog: ['旺财', '小白', '大黄', '豆豆'],
  rabbit: ['蹦蹦', '跳跳', '白雪', '灰灰']
};

export const INVENTORY_SIZE = 20;
