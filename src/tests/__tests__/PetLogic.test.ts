import { PetLogic } from '../../logic/PetLogic';
import { ConfigLoader } from '../../config/ConfigLoader';
import {
  createPet,
  createHappyPet,
  createHungryPet,
  createFullPetsArray
} from '../factories/TestFactories';
import type { Pet, PetType } from '../../types';

describe('PetLogic - 宠物系统单元测试', () => {
  const config = ConfigLoader.getInstance();

  describe('宠物创建', () => {
    it('创建宠物时应设置正确的默认属性', () => {
      const pet = PetLogic.create('cat', 1);
      expect(pet.type).toBe('cat');
      expect(pet.mood).toBe(80);
      expect(pet.hunger).toBe(100);
      expect(pet.isFollowing).toBe(true);
      expect(pet.helpedToday).toBe(false);
      expect(pet.lastFedDay).toBe(1);
    });

    it('创建宠物时应生成唯一 ID', () => {
      const pet1 = PetLogic.create('cat', 1);
      const pet2 = PetLogic.create('dog', 1);
      expect(pet1.id).not.toBe(pet2.id);
    });

    it('可以指定自定义名字', () => {
      const pet = PetLogic.create('rabbit', 1, '自定义名');
      expect(pet.name).toBe('自定义名');
    });

    it('未指定名字时使用配置中的随机名字', () => {
      const catConfig = config.getPet('cat');
      const pet = PetLogic.create('cat', 1);
      expect(catConfig?.names).toContain(pet.name);
    });

    it('三种宠物类型创建后属性正常', () => {
      const types: PetType[] = ['cat', 'dog', 'rabbit'];
      types.forEach((type) => {
        const pet = PetLogic.create(type, 1);
        expect(pet.type).toBe(type);
        expect(pet.mood).toBeGreaterThan(0);
        expect(pet.hunger).toBeGreaterThan(0);
        expect(typeof pet.name).toBe('string');
      });
    });
  });

  describe('饱食度消耗', () => {
    it('每天饱食度下降配置值（猫 30）', () => {
      const cat = createPet({ type: 'cat', hunger: 100 });
      const catCfg = config.getPet('cat')!;
      const result = PetLogic.advanceDay(cat);
      expect(result.hunger).toBe(100 - catCfg.hungerDecayPerDay);
    });

    it('饱食度不能低于 0', () => {
      const pet = createPet({ type: 'cat', hunger: 10 });
      const result = PetLogic.advanceDay(pet);
      expect(result.hunger).toBe(0);
    });

    it('连续多天饥饿后饱食度保持 0', () => {
      let pet = createPet({ type: 'rabbit', hunger: 50 });
      for (let i = 0; i < 10; i++) {
        pet = PetLogic.advanceDay(pet);
      }
      expect(pet.hunger).toBe(0);
    });

    it('不同宠物类型饱食度衰减不同', () => {
      const cat = PetLogic.advanceDay(createPet({ type: 'cat', hunger: 100 }));
      const rabbit = PetLogic.advanceDay(createPet({ type: 'rabbit', hunger: 100 }));
      expect(cat.hunger).not.toBe(rabbit.hunger);
    });
  });

  describe('心情值变化', () => {
    it('饱食充足时心情值每天上升', () => {
      const pet = createPet({ type: 'cat', mood: 70, hunger: 100 });
      const result = PetLogic.advanceDay(pet);
      expect(result.mood).toBeGreaterThan(pet.mood);
    });

    it('饱食度归零时心情值下降', () => {
      const pet = createHungryPet({ hunger: 0, mood: 50 });
      const result = PetLogic.advanceDay(pet);
      expect(result.mood).toBeLessThan(pet.mood);
    });

    it('心情值上限为 100', () => {
      const pet = createHappyPet({ mood: 99 });
      const result = PetLogic.advanceDay(pet);
      expect(result.mood).toBeLessThanOrEqual(100);
    });

    it('心情值下限为 0', () => {
      const pet = createPet({ type: 'cat', mood: 5, hunger: 0 });
      let result = pet;
      for (let i = 0; i < 5; i++) {
        result = PetLogic.advanceDay(result);
      }
      expect(result.mood).toBe(0);
    });
  });

  describe('跟随行为', () => {
    it('饱食充足时保持跟随', () => {
      const pet = createPet({ hunger: 100 });
      const result = PetLogic.advanceDay(pet);
      expect(result.isFollowing).toBe(true);
    });

    it('饱食度归零时停止跟随', () => {
      const pet = createHungryPet({ hunger: 0 });
      const result = PetLogic.advanceDay(pet);
      expect(result.isFollowing).toBe(false);
    });

    it('喂食后恢复跟随', () => {
      const pet = createHungryPet({ hunger: 0, isFollowing: false });
      const result = PetLogic.feed(pet, 5);
      expect(result.isFollowing).toBe(true);
      expect(result.hunger).toBeGreaterThan(0);
    });

    it('连续饥饿 4 天后停止跟随', () => {
      let pet = createPet({ type: 'cat', hunger: 100 });
      for (let i = 0; i < 4; i++) {
        pet = PetLogic.advanceDay(pet);
      }
      expect(pet.isFollowing).toBe(false);
    });
  });

  describe('喂食', () => {
    it('喂食能恢复饱食度', () => {
      const pet = createHungryPet({ hunger: 20 });
      const result = PetLogic.feed(pet, 5);
      expect(result.hunger).toBeGreaterThan(pet.hunger);
    });

    it('喂食能恢复心情', () => {
      const pet = createHungryPet({ mood: 20, hunger: 30 });
      const result = PetLogic.feed(pet, 5);
      expect(result.mood).toBeGreaterThan(pet.mood);
    });

    it('饱食度上限 100', () => {
      const pet = createPet({ hunger: 90 });
      const result = PetLogic.feed(pet, 5);
      expect(result.hunger).toBe(100);
    });

    it('心情值上限 100', () => {
      const pet = createPet({ mood: 98, hunger: 80 });
      const result = PetLogic.feed(pet, 5);
      expect(result.mood).toBe(100);
    });

    it('喂食后更新最后喂食日期', () => {
      const pet = createPet({ lastFedDay: 3 });
      const result = PetLogic.feed(pet, 10);
      expect(result.lastFedDay).toBe(10);
    });

    it('原宠物对象不被修改', () => {
      const pet = createPet({ hunger: 50, mood: 50 });
      const origHunger = pet.hunger;
      const origMood = pet.mood;
      PetLogic.feed(pet, 5);
      expect(pet.hunger).toBe(origHunger);
      expect(pet.mood).toBe(origMood);
    });
  });

  describe('帮忙翻地', () => {
    it('已帮忙过当天不再触发', () => {
      const pet = createHappyPet({ helpedToday: true });
      expect(PetLogic.shouldHelpTillDeterministic(pet, 0)).toBe(false);
    });

    it('心情低于阈值不触发帮忙', () => {
      const dogCfg = config.getPet('dog')!;
      const pet = createPet({
        type: 'dog',
        mood: dogCfg.helpTillMoodThreshold - 1,
        hunger: 100,
        helpedToday: false
      });
      expect(PetLogic.shouldHelpTillDeterministic(pet, 0)).toBe(false);
    });

    it('饱食低于阈值不触发帮忙', () => {
      const dogCfg = config.getPet('dog')!;
      const pet = createPet({
        type: 'dog',
        mood: 100,
        hunger: dogCfg.helpTillHungerThreshold - 1,
        helpedToday: false
      });
      expect(PetLogic.shouldHelpTillDeterministic(pet, 0)).toBe(false);
    });

    it('满足条件且概率内触发帮忙', () => {
      const pet = createHappyPet();
      expect(PetLogic.shouldHelpTillDeterministic(pet, 0)).toBe(true);
    });

    it('满足条件但概率外不触发', () => {
      const pet = createHappyPet();
      expect(PetLogic.shouldHelpTillDeterministic(pet, 0.999)).toBe(false);
    });

    it('不同宠物帮忙概率不同（狗>猫>兔子）', () => {
      const types: PetType[] = ['cat', 'dog', 'rabbit'];
      const chances = types.map((t) => config.getPet(t)!.helpTillChance);
      const sorted = [...chances].sort((a, b) => b - a);
      expect(chances).toEqual(sorted);
    });
  });

  describe('状态判断', () => {
    it('饱食度状态判断正确', () => {
      expect(PetLogic.getHungerStatus(createPet({ hunger: 80 }))).toBe('full');
      expect(PetLogic.getHungerStatus(createPet({ hunger: 50 }))).toBe('hungry');
      expect(PetLogic.getHungerStatus(createPet({ hunger: 10 }))).toBe('starving');
    });

    it('心情状态判断正确', () => {
      expect(PetLogic.getMoodStatus(createPet({ mood: 90 }))).toBe('happy');
      expect(PetLogic.getMoodStatus(createPet({ mood: 50 }))).toBe('neutral');
      expect(PetLogic.getMoodStatus(createPet({ mood: 10 }))).toBe('sad');
    });

    it('计算距上次喂食天数', () => {
      const pet = createPet({ lastFedDay: 3 });
      expect(PetLogic.getDaysSinceFed(pet, 5)).toBe(2);
      expect(PetLogic.getDaysSinceFed(pet, 3)).toBe(0);
    });
  });

  describe('宠物集合查询', () => {
    it('检查是否存在指定类型宠物', () => {
      const pets = createFullPetsArray();
      expect(PetLogic.hasPetType(pets, 'cat')).toBe(true);
      expect(PetLogic.hasPetType(pets, 'dog')).toBe(true);
      expect(PetLogic.hasPetType(pets, 'rabbit')).toBe(true);
    });

    it('按类型查找宠物', () => {
      const pets = createFullPetsArray();
      const dog = PetLogic.getPetByType(pets, 'dog');
      expect(dog?.type).toBe('dog');
    });

    it('查找指定距离内最近的宠物', () => {
      const positions: Record<string, { x: number; y: number }> = {
        cat: { x: 10, y: 10 },
        dog: { x: 100, y: 100 },
        rabbit: { x: 50, y: 50 }
      };
      const pets = [
        createPet({ type: 'cat', id: 'pet-1' }),
        createPet({ type: 'dog', id: 'pet-2' }),
        createPet({ type: 'rabbit', id: 'pet-3' })
      ];

      const nearest = PetLogic.findNearestPet(
        pets,
        55,
        55,
        (pet: Pet) => positions[pet.type],
        100
      );
      expect(nearest?.type).toBe('rabbit');
    });

    it('超出距离的宠物不被选中', () => {
      const pets = [createPet({ type: 'cat' })];
      const nearest = PetLogic.findNearestPet(
        pets,
        0,
        0,
        () => ({ x: 500, y: 500 }),
        80
      );
      expect(nearest).toBeNull();
    });
  });

  describe('每天推进完整流程', () => {
    it('连续 5 天不喂食后宠物状态正确', () => {
      let pet = PetLogic.create('cat', 1);
      const initialId = pet.id;

      for (let day = 2; day <= 6; day++) {
        pet = PetLogic.advanceDay(pet);
      }

      expect(pet.id).toBe(initialId);
      expect(pet.hunger).toBe(0);
      expect(pet.isFollowing).toBe(false);
      expect(pet.helpedToday).toBe(false);
      expect(pet.mood).toBeLessThan(80);
    });

    it('每天喂食能保持宠物状态良好', () => {
      let pet = PetLogic.create('dog', 1);
      const initialId = pet.id;

      for (let day = 2; day <= 10; day++) {
        pet = PetLogic.advanceDay(pet);
        pet = PetLogic.feed(pet, day);
      }

      expect(pet.id).toBe(initialId);
      expect(pet.hunger).toBeGreaterThan(50);
      expect(pet.isFollowing).toBe(true);
      expect(pet.mood).toBeGreaterThanOrEqual(70);
    });
  });
});
