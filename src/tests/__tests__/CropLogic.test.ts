import { CropLogic } from '../../logic/CropLogic';
import { ConfigLoader } from '../../config/ConfigLoader';
import {
  createPlantedCrop,
  createMatureCrop,
  createGrowingCrop,
  createMultipleCrops
} from '../factories/TestFactories';

describe('CropLogic - 种植系统单元测试', () => {
  const config = ConfigLoader.getInstance();
  const potatoConfig = config.getCrop('potato')!;
  const carrotConfig = config.getCrop('carrot')!;

  describe('生长阶段计算', () => {
    it('新种植的作物应为种子阶段', () => {
      const crop = createPlantedCrop({ cropId: 'potato', growthProgress: 0 });
      expect(CropLogic.calculateStage(crop)).toBe('seed');
    });

    it('土豆生长 2 天后应为发芽阶段', () => {
      const daysPerStage = potatoConfig.daysPerStage;
      const crop = createPlantedCrop({
        cropId: 'potato',
        growthProgress: daysPerStage
      });
      expect(CropLogic.calculateStage(crop)).toBe('sprout');
    });

    it('土豆生长 4 天后应为成长阶段', () => {
      const daysPerStage = potatoConfig.daysPerStage;
      const crop = createPlantedCrop({
        cropId: 'potato',
        growthProgress: daysPerStage * 2 + 0.5
      });
      expect(CropLogic.calculateStage(crop)).toBe('growing');
    });

    it('土豆达到生长天数后应为成熟阶段', () => {
      const crop = createMatureCrop('potato');
      expect(CropLogic.calculateStage(crop)).toBe('mature');
    });

    it('胡萝卜按配置正确阶段推进', () => {
      const d = carrotConfig.daysPerStage;
      expect(CropLogic.calculateStage(createGrowingCrop('carrot', d - 0.1))).toBe('seed');
      expect(CropLogic.calculateStage(createGrowingCrop('carrot', d))).toBe('sprout');
      expect(CropLogic.calculateStage(createGrowingCrop('carrot', d * 2))).toBe('growing');
      expect(CropLogic.calculateStage(createMatureCrop('carrot'))).toBe('mature');
    });
  });

  describe('生长推进', () => {
    it('调用 grow 一次生长进度增加 1', () => {
      const crop = createPlantedCrop({ cropId: 'potato', growthProgress: 0 });
      const grown = CropLogic.grow(crop);
      expect(grown.growthProgress).toBe(1);
      expect(grown.stage).toBe('seed');
    });

    it('生长进度增加会正确更新阶段', () => {
      const d = potatoConfig.daysPerStage;
      let crop = createPlantedCrop({ cropId: 'potato', growthProgress: d - 1 });
      crop = CropLogic.grow(crop);
      expect(crop.stage).toBe('sprout');
    });

    it('超出总生长天数阶段保持成熟', () => {
      const crop = createMatureCrop('potato');
      const extra = CropLogic.grow(crop, 10);
      expect(extra.stage).toBe('mature');
      expect(extra.growthProgress).toBe(potatoConfig.growthDays + 10);
    });

    it('原作物对象不被修改（不可变）', () => {
      const crop = createPlantedCrop({ cropId: 'potato', growthProgress: 0 });
      const originalProgress = crop.growthProgress;
      CropLogic.grow(crop);
      expect(crop.growthProgress).toBe(originalProgress);
    });
  });

  describe('成熟判断', () => {
    it('种子阶段作物未成熟', () => {
      const crop = createPlantedCrop({ cropId: 'potato' });
      expect(CropLogic.isMature(crop)).toBe(false);
    });

    it('刚达到生长天数的作物已成熟', () => {
      const crop = createMatureCrop('potato');
      expect(CropLogic.isMature(crop)).toBe(true);
    });

    it('超过生长天数的作物仍为成熟', () => {
      const crop = createMatureCrop('potato', { growthProgress: potatoConfig.growthDays + 10 });
      expect(CropLogic.isMature(crop)).toBe(true);
    });

    it('不同作物成熟判断独立', () => {
      expect(CropLogic.isMature(createPlantedCrop({
        cropId: 'carrot',
        growthProgress: carrotConfig.growthDays
      }))).toBe(true);
      expect(CropLogic.isMature(createPlantedCrop({
        cropId: 'carrot',
        growthProgress: carrotConfig.growthDays - 0.5
      }))).toBe(false);
    });
  });

  describe('收获信息', () => {
    it('能正确获取作物收获物品 ID', () => {
      const crop = createMatureCrop('potato');
      expect(CropLogic.getHarvestItemId(crop)).toBe(potatoConfig.cropItemId);
    });

    it('成熟作物能正确获取售价', () => {
      const crop = createMatureCrop('carrot');
      expect(CropLogic.getHarvestSellPrice(crop)).toBe(carrotConfig.sellPrice);
    });

    it('未成熟作物也能获取收获信息', () => {
      const crop = createGrowingCrop('pumpkin', 3);
      const pumpkinCfg = config.getCrop('pumpkin');
      expect(CropLogic.getHarvestItemId(crop)).toBe(pumpkinCfg?.cropItemId);
      expect(CropLogic.getHarvestSellPrice(crop)).toBe(pumpkinCfg?.sellPrice || 0);
    });
  });

  describe('雨天加速生长', () => {
    it('雨天生长倍数应为 2（配置）', () => {
      const rainy = config.getWeather('rainy');
      expect(rainy?.growthMultiplier).toBe(2);
    });

    it('雨天生长 1 次等于晴天生长 2 次', () => {
      const sunnyCrop = createPlantedCrop({ cropId: 'potato' });
      const rainyCrop = createPlantedCrop({ cropId: 'potato' });

      const grown1 = CropLogic.grow(sunnyCrop, 1);
      const grown2 = CropLogic.grow(rainyCrop, 2);

      expect(grown1.growthProgress).toBe(1);
      expect(grown2.growthProgress).toBe(2);
    });

    it('雨天作物比晴天更快到达下一个阶段', () => {
      const d = potatoConfig.daysPerStage;
      let rainyCrop = createPlantedCrop({ cropId: 'potato' });
      let sunnyCrop = createPlantedCrop({ cropId: 'potato' });

      rainyCrop = CropLogic.grow(rainyCrop, 2);
      sunnyCrop = CropLogic.grow(sunnyCrop, 1);

      if (d <= 2) {
        expect(CropLogic.calculateStage(rainyCrop)).not.toBe('seed');
      }
      expect(CropLogic.calculateStage(sunnyCrop)).toBe(d > 1 ? 'seed' : 'sprout');
    });

    it('暴风雨生长倍数应为 1.5（配置）', () => {
      const storm = config.getWeather('storm');
      expect(storm?.growthMultiplier).toBe(1.5);
    });
  });

  describe('暴风雨损坏作物', () => {
    it('无成熟作物时损坏结果为空', () => {
      const crops = createMultipleCrops(5, { growthProgress: 0 });
      const result = CropLogic.damageRandomMatureCrops(crops, 2, 12345);
      expect(result.damaged.length).toBe(0);
      expect(result.remaining.length).toBe(5);
    });

    it('能正确损坏指定数量的成熟作物', () => {
      const mature1 = createMatureCrop('potato', { id: 'mature-1', tileX: 0, tileY: 0 });
      const mature2 = createMatureCrop('potato', { id: 'mature-2', tileX: 1, tileY: 0 });
      const mature3 = createMatureCrop('carrot', { id: 'mature-3', tileX: 2, tileY: 0 });
      const immature = createGrowingCrop('potato', 2);

      const allCrops = [mature1, mature2, mature3, immature];
      const result = CropLogic.damageRandomMatureCrops(allCrops, 2, 42);

      expect(result.damaged.length).toBe(2);
      expect(result.remaining.length).toBe(2);
      expect(result.remaining.includes(immature)).toBe(true);
      expect(result.damaged.every((c) => CropLogic.isMature(c))).toBe(true);
    });

    it('损坏数量超过成熟作物时全部移除', () => {
      const crops = [
        createMatureCrop('potato', { id: 'm1' }),
        createMatureCrop('carrot', { id: 'm2' })
      ];
      const result = CropLogic.damageRandomMatureCrops(crops, 10, 1);
      expect(result.damaged.length).toBe(2);
      expect(result.remaining.length).toBe(0);
    });

    it('使用相同种子应产生相同损坏结果（确定性）', () => {
      const mature = Array.from({ length: 10 }, (_, i) =>
        createMatureCrop('potato', { id: `m-${i}` })
      );
      const result1 = CropLogic.damageRandomMatureCrops([...mature], 3, 999);
      const result2 = CropLogic.damageRandomMatureCrops([...mature], 3, 999);

      expect(result1.damaged.map((c) => c.id)).toEqual(result2.damaged.map((c) => c.id));
    });

    it('损坏的作物应该从列表中移除', () => {
      const mature = createMatureCrop('potato', { id: 'should-remove' });
      const other = createGrowingCrop('carrot', 1);
      const result = CropLogic.damageRandomMatureCrops([mature, other], 5, 123);
      expect(result.remaining.find((c) => c.id === 'should-remove')).toBeUndefined();
      expect(result.remaining.includes(other)).toBe(true);
    });
  });

  describe('批量作物推进', () => {
    it('批量推进所有作物生长', () => {
      const crops = createMultipleCrops(10, { cropId: 'potato', growthProgress: 0 });
      const advanced = CropLogic.advanceCrops(crops, 1);
      expect(advanced.every((c) => (c.growthProgress || 0) === 1)).toBe(true);
    });

    it('批量推进时支持生长倍数', () => {
      const crops = createMultipleCrops(5, { growthProgress: 0 });
      const rainy = CropLogic.advanceCrops(crops, 2);
      expect(rainy[0].growthProgress).toBe(2);
    });

    it('过滤成熟作物', () => {
      const mixed = [
        createMatureCrop('potato'),
        createMatureCrop('carrot'),
        createGrowingCrop('potato', 1),
        createPlantedCrop({ growthProgress: 0 })
      ];
      const mature = CropLogic.filterMatureCrops(mixed);
      expect(mature.length).toBe(2);
    });
  });

  describe('剩余天数计算', () => {
    it('新种植作物剩余天数等于配置天数', () => {
      const crop = createPlantedCrop({ cropId: 'potato' });
      expect(CropLogic.getRemainingDays(crop)).toBe(potatoConfig.growthDays);
    });

    it('成熟作物剩余天数为 0', () => {
      const crop = createMatureCrop('potato');
      expect(CropLogic.getRemainingDays(crop)).toBe(0);
    });

    it('部分生长后剩余天数正确减少', () => {
      const crop = createPlantedCrop({ cropId: 'carrot', growthProgress: 3 });
      const expected = Math.max(0, carrotConfig.growthDays - 3);
      expect(CropLogic.getRemainingDays(crop)).toBe(expected);
    });
  });
});
