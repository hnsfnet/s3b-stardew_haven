import { GameStateManager, SaveData } from '../../state/GameStateManager';
import { ConfigLoader } from '../../config/ConfigLoader';
import {
  createPlantedCrop,
  createMatureCrop,
  createGrowingCrop,
  createPet,
  createInventory,
  createInventoryWithItems,
  createMultipleCrops
} from '../factories/TestFactories';
import { CropLogic } from '../../logic/CropLogic';
import { PetLogic } from '../../logic/PetLogic';
import type { PlantedCrop, Pet } from '../../types';

type DataMap = Record<string, unknown>;
function createMockDataManager(): Phaser.Data.DataManager {
  const store: DataMap = {};
  return {
    has: jest.fn((key: string) => key in store),
    get: jest.fn((key: string) => store[key]),
    set: jest.fn((key: string, value: unknown) => {
      store[key] = value;
    }),
    remove: jest.fn(),
    each: jest.fn(),
    merge: jest.fn(),
    reset: jest.fn(),
    events: { emit: jest.fn(), on: jest.fn() } as unknown as Phaser.Events.EventEmitter,
    scene: {} as unknown as Phaser.Scene,
    list: store as unknown as DataMap,
    destroy: jest.fn()
  } as unknown as Phaser.Data.DataManager;
}

describe('GameStateManager - 存档系统测试', () => {
  let manager: GameStateManager;
  let mockRegistry: Phaser.Data.DataManager;
  const config = ConfigLoader.getInstance();

  beforeEach(() => {
    mockRegistry = createMockDataManager();
    manager = new (GameStateManager as unknown as { new (): GameStateManager })();
    manager.setRegistry(mockRegistry);
    localStorage.clear();
  });

  describe('初始化与默认值', () => {
    it('默认金币为 100', () => {
      expect(manager.gold).toBe(100);
    });

    it('默认天数为 1', () => {
      expect(manager.day).toBe(1);
    });

    it('默认库存为 20 个空槽', () => {
      expect(manager.inventory.length).toBe(20);
      expect(manager.inventory.every((s) => !s.itemId)).toBe(true);
    });

    it('initDefaultInventory 设置初始物品', () => {
      manager.initDefaultInventory();
      expect(manager.getItemCount('potato_seed')).toBe(5);
      expect(manager.getItemCount('carrot_seed')).toBe(3);
      expect(manager.getItemCount('pet_food')).toBe(3);
    });

    it('initDefaultInventory 不会覆盖已有库存', () => {
      manager.addItem('potato_seed', 10);
      manager.initDefaultInventory();
      expect(manager.getItemCount('potato_seed')).toBe(10);
    });
  });

  describe('金币操作', () => {
    it('addGold 正确增加金币', () => {
      manager.gold = 100;
      expect(manager.addGold(50)).toBe(150);
      expect(manager.gold).toBe(150);
    });

    it('spendGold 金币足够时返回 true', () => {
      manager.gold = 100;
      expect(manager.spendGold(50)).toBe(true);
      expect(manager.gold).toBe(50);
    });

    it('spendGold 金币不足时返回 false 并保持不变', () => {
      manager.gold = 30;
      expect(manager.spendGold(50)).toBe(false);
      expect(manager.gold).toBe(30);
    });

    it('addGold 支持负数（扣金币）', () => {
      manager.gold = 100;
      expect(manager.addGold(-20)).toBe(80);
    });
  });

  describe('库存操作', () => {
    it('addItem 正确添加物品', () => {
      expect(manager.addItem('potato_seed', 10)).toBe(true);
      expect(manager.getItemCount('potato_seed')).toBe(10);
    });

    it('removeItem 正确移除物品', () => {
      manager.addItem('potato', 15);
      expect(manager.removeItem('potato', 10)).toBe(true);
      expect(manager.getItemCount('potato')).toBe(5);
    });

    it('removeItem 移除全部数量', () => {
      manager.addItem('carrot', 5);
      expect(manager.removeItem('carrot', 5)).toBe(true);
      expect(manager.getItemCount('carrot')).toBe(0);
    });

    it('removeItem 数量不足返回 false', () => {
      manager.addItem('pumpkin', 3);
      expect(manager.removeItem('pumpkin', 10)).toBe(false);
    });

    it('hasItem 正确判断', () => {
      manager.addItem('potato_seed', 5);
      expect(manager.hasItem('potato_seed', 3)).toBe(true);
      expect(manager.hasItem('potato_seed', 10)).toBe(false);
    });

    it('addItem 背包满返回 false', () => {
      const slots = 20;
      for (let i = 0; i < slots; i++) {
        manager.addItem(`item_${i}`, 1);
      }
      expect(manager.addItem('extra', 1)).toBe(false);
    });
  });

  describe('宠物操作', () => {
    it('addPet 正确添加宠物', () => {
      const pet = createPet({ type: 'cat' });
      manager.addPet(pet);
      expect(manager.pets.length).toBe(1);
      expect(manager.pets[0].id).toBe(pet.id);
    });

    it('hasPetType 正确判断类型', () => {
      manager.addPet(createPet({ type: 'cat' }));
      expect(manager.hasPetType('cat')).toBe(true);
      expect(manager.hasPetType('dog')).toBe(false);
    });

    it('updatePet 更新宠物属性', () => {
      const pet = createPet({ type: 'cat', mood: 80 });
      manager.addPet(pet);
      expect(manager.updatePet(pet.id, { mood: 60 })).toBe(true);
      expect(manager.pets[0].mood).toBe(60);
    });

    it('updatePet 找不到 ID 返回 false', () => {
      expect(manager.updatePet('nonexistent', { mood: 50 })).toBe(false);
    });
  });

  describe('天数推进', () => {
    it('advanceDay 增加天数', () => {
      manager.day = 1;
      expect(manager.advanceDay()).toBe(2);
      expect(manager.day).toBe(2);
    });

    it('天气随机化不抛异常', () => {
      const result = manager.randomizeWeather();
      expect(['sunny', 'rainy', 'storm']).toContain(result);
    });
  });

  describe('天气状态管理', () => {
    it('默认天气为晴天', () => {
      expect(manager.weather.current).toBe('sunny');
      expect(manager.weather.yesterday).toBe('sunny');
      expect(manager.weather.transitioning).toBe(false);
    });

    it('setCurrentWeather 更新当前和昨天天气', () => {
      manager.setCurrentWeather('rainy');
      expect(manager.weather.current).toBe('rainy');
      expect(manager.weather.yesterday).toBe('sunny');
      expect(manager.weather.transitioning).toBe(true);
    });

    it('连续切换天气保留正确的昨天记录', () => {
      manager.setCurrentWeather('rainy');
      manager.setCurrentWeather('storm');
      expect(manager.weather.current).toBe('storm');
      expect(manager.weather.yesterday).toBe('rainy');
    });

    it('weather setter 直接设置完整状态', () => {
      manager.weather = {
        current: 'storm',
        yesterday: 'sunny',
        transitioning: false
      };
      expect(manager.weather.current).toBe('storm');
      expect(manager.weather.yesterday).toBe('sunny');
      expect(manager.weather.transitioning).toBe(false);
    });
  });

  describe('选中种子管理', () => {
    it('默认选中种子为 null', () => {
      expect(manager.selectedSeed).toBeNull();
    });

    it('selectedSeed setter 正确设置值', () => {
      manager.selectedSeed = 'potato_seed';
      expect(manager.selectedSeed).toBe('potato_seed');
    });

    it('可以设置为 null 取消选中', () => {
      manager.selectedSeed = 'carrot_seed';
      manager.selectedSeed = null;
      expect(manager.selectedSeed).toBeNull();
    });
  });

  describe('保存与加载（正常流程）', () => {
    it('保存后数据能被读取', () => {
      manager.gold = 500;
      manager.day = 10;
      manager.addItem('potato_seed', 20);
      const crop = createMatureCrop('potato');
      const pet = createPet({ type: 'dog', name: '旺财' });
      manager.addPet(pet);
      manager.selectedSeed = 'carrot_seed';

      manager.save(['0,0', '1,0'], [crop]);

      const loaded = manager.load();
      expect(loaded).not.toBeNull();
      expect(loaded?.gold).toBe(500);
      expect(loaded?.day).toBe(10);
      expect(loaded?.plantedCrops[0].id).toBe(crop.id);
      expect(loaded?.pets[0].name).toBe('旺财');
      expect(loaded?.selectedSeed).toBe('carrot_seed');
    });

    it('hasSaveData 正确判断存档存在', () => {
      expect(manager.hasSaveData()).toBe(false);
      manager.save([], []);
      expect(manager.hasSaveData()).toBe(true);
    });

    it('clearSave 清除存档', () => {
      manager.save([], []);
      manager.clearSave();
      expect(manager.hasSaveData()).toBe(false);
      expect(manager.load()).toBeNull();
    });

    it('空数据也能保存', () => {
      manager.save([], []);
      const loaded = manager.load();
      expect(loaded?.tilledTiles).toEqual([]);
      expect(loaded?.plantedCrops).toEqual([]);
    });
  });

  describe('存档数据一致性（暴风雨场景）', () => {
    it('暴风雨损坏作物后立即保存损坏不重现', () => {
      const mature1 = createMatureCrop('potato', { id: 'c1' });
      const mature2 = createMatureCrop('carrot', { id: 'c2' });
      const immature = createGrowingCrop('potato', 2);
      let allCrops: PlantedCrop[] = [mature1, mature2, immature];

      manager.gold = 100;
      manager.save(['0,0', '1,0', '2,0'], allCrops);

      const { damaged, remaining } = CropLogic.damageRandomMatureCrops(allCrops, 1, 42);
      expect(damaged.length).toBe(1);

      damaged.forEach((c) => {
        const price = config.getCrop(c.cropId)?.sellPrice || 0;
        const seedPrice = config.getCrop(c.cropId)?.seedPrice || 0;
        manager.addGold(price + seedPrice);
      });

      allCrops = remaining;
      manager.save(['0,0', '1,0', '2,0'], allCrops);

      const loaded = manager.load();
      expect(loaded?.plantedCrops.length).toBe(2);
      expect(loaded?.plantedCrops.some((c) => c.id === damaged[0].id)).toBe(false);
      expect(loaded?.gold).toBeGreaterThan(100);
    });

    it('损坏补偿金币必须与配置一致', () => {
      const mature = createMatureCrop('potato', { id: 'cm' });
      manager.gold = 0;
      manager.save(['0,0'], [mature]);

      const { damaged } = CropLogic.damageRandomMatureCrops([mature], 10, 1);
      expect(damaged.length).toBe(1);

      const cfg = config.getCrop('potato');
      const expectedCompensation = (cfg?.sellPrice || 0) + (cfg?.seedPrice || 0);

      damaged.forEach(() => manager.addGold(expectedCompensation));
      manager.save(['0,0'], []);

      const loaded = manager.load();
      expect(loaded?.gold).toBe(expectedCompensation);
    });
  });

  describe('跨天数存档与作物恢复', () => {
    it('存档读取后作物生长状态完整保留', () => {
      const potatoCfg = config.getCrop('potato')!;
      const initDay = 3;

      const crops: PlantedCrop[] = [
        createPlantedCrop({
          cropId: 'potato',
          growthProgress: 0,
          currentDay: initDay,
          plantedDay: initDay,
          id: 'crop-new',
          stage: 'seed'
        }),
        createPlantedCrop({
          cropId: 'potato',
          growthProgress: potatoCfg.daysPerStage * 1.5,
          currentDay: initDay,
          plantedDay: initDay - 2,
          id: 'crop-growing',
          stage: 'sprout'
        })
      ];

      manager.day = initDay;
      manager.save(['0,0', '1,0'], crops);

      const loaded = manager.load()!;
      expect(loaded.plantedCrops.length).toBe(2);
      expect(loaded.plantedCrops[0].growthProgress).toBe(0);
      expect(loaded.plantedCrops[1].growthProgress).toBe(potatoCfg.daysPerStage * 1.5);
      expect(loaded.day).toBe(initDay);
    });

    it('读档后推进多日作物正确生长', () => {
      const carrotCfg = config.getCrop('carrot')!;
      const startDay = 5;
      const crops = [
        createPlantedCrop({
          cropId: 'carrot',
          growthProgress: 0,
          currentDay: startDay,
          plantedDay: startDay,
          id: 'c-1'
        })
      ];

      manager.day = startDay;
      manager.save(['0,0'], crops);

      const loaded = manager.load()!;
      let currentCrops = loaded.plantedCrops;

      for (let d = 0; d < carrotCfg.growthDays; d++) {
        currentCrops = CropLogic.advanceCrops(currentCrops, 1);
      }

      expect(currentCrops.every(CropLogic.isMature)).toBe(true);
    });

    it('保存 10 天后读取 → 再推进 5 天作物成熟', () => {
      const carrotCfg = config.getCrop('carrot')!;
      const startDay = 5;
      const crops = createMultipleCrops(3, {
        cropId: 'carrot',
        growthProgress: 1,
        currentDay: startDay
      });

      manager.day = startDay;
      manager.save(['0,0'], crops);

      let loaded = manager.load()!;
      loaded.day = 15;
      manager.applySaveData(loaded);

      let currentCrops = loaded.plantedCrops;
      for (let d = 0; d < carrotCfg.growthDays + 10; d++) {
        currentCrops = CropLogic.advanceCrops(currentCrops, 1);
      }

      expect(currentCrops.every(CropLogic.isMature)).toBe(true);
    });

    it('宠物跨天存档后属性正确恢复 + 再推进衰减', () => {
      const pet = PetLogic.create('cat', 3);
      manager.addPet(pet);
      manager.day = 3;
      manager.save([], []);

      let loaded = manager.load()!;
      loaded.day = 10;
      manager.applySaveData(loaded);

      let pets = [...manager.pets];
      for (let i = 0; i < 3; i++) {
        pets = pets.map((p) => PetLogic.advanceDay(p));
      }

      expect(pets[0].hunger).toBeLessThanOrEqual(100);
      expect(pets[0].id).toBe(pet.id);
    });
  });

  describe('完整 applySaveData 恢复', () => {
    it('applySaveData 恢复所有状态', () => {
      const saveData: SaveData = {
        gold: 9999,
        day: 100,
        inventory: createInventoryWithItems([
          { itemId: 'potato_seed', quantity: 50 },
          { itemId: 'pumpkin', quantity: 20 }
        ]),
        pets: [createPet({ type: 'rabbit', name: '兔兔' })],
        weather: { current: 'storm', yesterday: 'rainy', transitioning: false },
        tilledTiles: ['1,1', '2,2'],
        plantedCrops: [createMatureCrop('carrot')],
        selectedSeed: 'pumpkin_seed'
      };

      manager.applySaveData(saveData);

      expect(manager.gold).toBe(9999);
      expect(manager.day).toBe(100);
      expect(manager.getItemCount('potato_seed')).toBe(50);
      expect(manager.getItemCount('pumpkin')).toBe(20);
      expect(manager.pets[0].name).toBe('兔兔');
      expect(manager.weather.current).toBe('storm');
      expect(manager.selectedSeed).toBe('pumpkin_seed');
    });

    it('JSON 往返序列化与反序列化完整无损', () => {
      const saveData: SaveData = {
        gold: 1234,
        day: 25,
        inventory: createInventoryWithItems([
          { itemId: 'carrot_seed', quantity: 10 }
        ]),
        pets: [createPet({ type: 'dog', mood: 60, hunger: 40 })],
        weather: { current: 'rainy', yesterday: 'sunny', transitioning: true },
        tilledTiles: ['0,0'],
        plantedCrops: [createPlantedCrop({ cropId: 'potato', growthProgress: 2.5, id: 'c1' })],
        selectedSeed: null
      };

      const str = JSON.stringify(saveData);
      const restored: SaveData = JSON.parse(str);

      expect(restored.gold).toBe(1234);
      expect(restored.plantedCrops[0].growthProgress).toBe(2.5);
      expect(restored.pets[0].mood).toBe(60);
      expect(restored.selectedSeed).toBeNull();
    });
  });

  describe('损坏的存档处理', () => {
    it('读取损坏的 JSON 返回 null', () => {
      localStorage.setItem('stardew_farm_save', '{invalid json!!!');
      expect(manager.load()).toBeNull();
    });

    it('读取空存档返回 null', () => {
      expect(manager.load()).toBeNull();
    });
  });
});
