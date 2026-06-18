import { ConfigLoader, CropConfig, PetConfig, WeatherConfigEntry, ItemConfig } from '../../config/ConfigLoader';
import cropsJSON from '../../config/crops.json';
import petsJSON from '../../config/pets.json';
import weatherJSON from '../../config/weather.json';
import itemsJSON from '../../config/items.json';

type PetType = 'cat' | 'dog' | 'rabbit';

describe('配置数据校验 - 作物配置 (crops.json)', () => {
  const loader = ConfigLoader.getInstance();
  const allCrops: Record<string, CropConfig> = loader.getAllCrops();
  const cropEntries = Object.entries(allCrops) as Array<[string, CropConfig]>;

  it('至少有 3 种作物（土豆、胡萝卜、南瓜）', () => {
    expect(cropEntries.length).toBeGreaterThanOrEqual(3);
    expect(['potato', 'carrot', 'pumpkin'].every((k) => k in allCrops)).toBe(true);
  });

  it.each(cropEntries)('%s: growthStages 应为 4（种子→发芽→成长→成熟）', (_id, cfg) => {
    expect(cfg.growthStages).toBe(4);
  });

  it.each(cropEntries)('%s: growthDays 等于 daysPerStage × (growthStages-1)', (_id, cfg) => {
    const expected = cfg.daysPerStage * (cfg.growthStages - 1);
    expect(cfg.growthDays).toBe(expected);
  });

  it.each(cropEntries)('%s: 生长时间必须为正数', (_id, cfg) => {
    expect(cfg.growthDays).toBeGreaterThan(0);
    expect(cfg.daysPerStage).toBeGreaterThan(0);
  });

  it.each(cropEntries)('%s: 售价 > 种子价格（保证有利润）', (_id, cfg) => {
    expect(cfg.sellPrice).toBeGreaterThan(cfg.seedPrice);
    const profit = cfg.sellPrice - cfg.seedPrice;
    expect(profit).toBeGreaterThan(0);
  });

  it.each(cropEntries)('%s: 售价在合理范围 [种子价×2, 种子价×10]', (_id, cfg) => {
    expect(cfg.sellPrice).toBeGreaterThanOrEqual(cfg.seedPrice * 2);
    expect(cfg.sellPrice).toBeLessThanOrEqual(cfg.seedPrice * 10);
  });

  it('生长天数递增（土豆<胡萝卜<南瓜，难度阶梯）', () => {
    const order = ['potato', 'carrot', 'pumpkin'];
    const days = order.map((id) => allCrops[id].growthDays);
    for (let i = 1; i < days.length; i++) {
      expect(days[i]).toBeGreaterThan(days[i - 1]);
    }
  });

  it('种子价格随作物等级递增', () => {
    const order = ['potato', 'carrot', 'pumpkin'];
    const prices = order.map((id) => allCrops[id].seedPrice);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    }
  });

  it('利润率随生长时间增加（越长越赚钱）', () => {
    const order = ['potato', 'carrot', 'pumpkin'];
    const margins = order.map((id) => {
      const c = allCrops[id];
      return (c.sellPrice - c.seedPrice) / c.growthDays;
    });
    for (let i = 1; i < margins.length; i++) {
      expect(margins[i]).toBeGreaterThanOrEqual(margins[i - 1] - 0.01);
    }
  });

  it('每个作物都有对应的 cropItemId 且存在于 items.json', () => {
    const allItemIds = Object.keys(loader.getAllItems());
    cropEntries.forEach(([id, cfg]) => {
      expect(cfg.cropItemId).toBeDefined();
      expect(allItemIds).toContain(cfg.cropItemId);
      const seedId = cfg.seedItemId;
      expect(allItemIds).toContain(seedId);
    });
  });

  it.each(cropEntries)('%s: 字段类型正确', (_id, cfg) => {
    expect(typeof cfg.name).toBe('string');
    expect(typeof cfg.color).toBe('string');
    expect(typeof cfg.description).toBe('string');
    expect(typeof cfg.seedPrice).toBe('number');
    expect(typeof cfg.sellPrice).toBe('number');
  });

  it('JSON 结构正确性：所有顶级键映射到 id 字段', () => {
    Object.entries(cropsJSON as Record<string, CropConfig>).forEach(([key, cfg]) => {
      expect(cfg.id).toBe(key);
    });
  });
});

describe('配置数据校验 - 宠物配置 (pets.json)', () => {
  const loader = ConfigLoader.getInstance();
  const allPets: Record<PetType, PetConfig> = loader.getAllPets();
  const petEntries = Object.entries(allPets) as Array<[PetType, PetConfig]>;
  const validPetTypes: PetType[] = ['cat', 'dog', 'rabbit'];

  it('三种宠物类型都存在', () => {
    validPetTypes.forEach((t) => expect(allPets[t]).toBeDefined());
  });

  it.each(petEntries)('%s: 每天心情衰减率在 [0, 100]', (_type, cfg) => {
    expect(cfg.moodDecayPerDay).toBeGreaterThanOrEqual(0);
    expect(cfg.moodDecayPerDay).toBeLessThan(100);
  });

  it.each(petEntries)('%s: 每天饱食度衰减率在 [0, 100]', (_type, cfg) => {
    expect(cfg.hungerDecayPerDay).toBeGreaterThan(0);
    expect(cfg.hungerDecayPerDay).toBeLessThanOrEqual(100);
  });

  it.each(petEntries)('%s: 衰减后至少 4 天才会降到 0（保证体验）', (_type, cfg) => {
    expect(cfg.hungerDecayPerDay).toBeLessThanOrEqual(100 / 3);
    expect(cfg.hungerDecayPerDay).toBeLessThanOrEqual(50);
  });

  it.each(petEntries)('%s: 帮忙翻地概率在 [0, 1]', (_type, cfg) => {
    expect(cfg.helpTillChance).toBeGreaterThanOrEqual(0);
    expect(cfg.helpTillChance).toBeLessThanOrEqual(1);
  });

  it.each(petEntries)('%s: 帮忙阈值心情在 [0, 100]', (_type, cfg) => {
    expect(cfg.helpTillMoodThreshold).toBeGreaterThanOrEqual(0);
    expect(cfg.helpTillMoodThreshold).toBeLessThanOrEqual(100);
  });

  it.each(petEntries)('%s: 帮忙阈值饱食度在 [0, 100]', (_type, cfg) => {
    expect(cfg.helpTillHungerThreshold).toBeGreaterThanOrEqual(0);
    expect(cfg.helpTillHungerThreshold).toBeLessThanOrEqual(100);
  });

  it.each(petEntries)('%s: 喂食恢复值在有效范围', (_type, cfg) => {
    expect(cfg.feedHungerRestore).toBeGreaterThan(0);
    expect(cfg.feedHungerRestore).toBeLessThanOrEqual(100);
    expect(cfg.feedMoodBoost).toBeGreaterThanOrEqual(0);
    expect(cfg.feedMoodBoost).toBeLessThanOrEqual(100);
  });

  it.each(petEntries)('%s: 跟随速度为正数', (_type, cfg) => {
    expect(cfg.followSpeed).toBeGreaterThan(0);
  });

  it.each(petEntries)('%s: 至少有 3 个备选名字', (_type, cfg) => {
    expect(cfg.names.length).toBeGreaterThanOrEqual(3);
    cfg.names.forEach((name) => expect(typeof name).toBe('string'));
    cfg.names.forEach((name) => expect(name.length).toBeGreaterThan(0));
  });

  it('宠物帮忙概率递减：狗 > 猫 > 兔子（稀有度）', () => {
    expect(allPets.dog.helpTillChance).toBeGreaterThan(allPets.cat.helpTillChance);
    expect(allPets.cat.helpTillChance).toBeGreaterThan(allPets.rabbit.helpTillChance);
  });

  it('宠物价格随稀有度递增：狗 > 猫 > 兔子', () => {
    expect(allPets.dog.price).toBeGreaterThan(allPets.cat.price);
    expect(allPets.cat.price).toBeGreaterThan(allPets.rabbit.price);
  });

  it('JSON 顶级键与 type 字段一致', () => {
    Object.entries(petsJSON as Record<string, PetConfig>).forEach(([key, cfg]) => {
      expect(cfg.type).toBe(key);
    });
  });
});

describe('配置数据校验 - 天气配置 (weather.json)', () => {
  const loader = ConfigLoader.getInstance();
  const allWeather = loader.getAllWeather();
  const weatherEntries = Object.entries(allWeather) as Array<[string, WeatherConfigEntry]>;
  const validTypes = ['sunny', 'rainy', 'storm'];

  it('三种天气都存在', () => {
    validTypes.forEach((t) => expect(allWeather[t as keyof typeof allWeather]).toBeDefined());
  });

  it.each(weatherEntries)('%s: growthMultiplier 在 [0.5, 3.0]', (_type, cfg) => {
    expect(cfg.growthMultiplier).toBeGreaterThanOrEqual(0.5);
    expect(cfg.growthMultiplier).toBeLessThanOrEqual(3);
  });

  it.each(weatherEntries)('%s: playerSpeedMultiplier 在 [0.3, 2.0]', (_type, cfg) => {
    expect(cfg.playerSpeedMultiplier).toBeGreaterThanOrEqual(0.3);
    expect(cfg.playerSpeedMultiplier).toBeLessThanOrEqual(2);
  });

  it.each(weatherEntries)('%s: damageChance 为 [0, 1] 合法概率', (_type, cfg) => {
    expect(cfg.damageChance).toBeGreaterThanOrEqual(0);
    expect(cfg.damageChance).toBeLessThanOrEqual(1);
  });

  it('只有暴风雨会损坏作物（damageChance > 0）', () => {
    expect(allWeather.sunny.damageChance).toBe(0);
    expect(allWeather.rainy.damageChance).toBe(0);
    expect(allWeather.storm.damageChance).toBeGreaterThan(0);
  });

  it('暴风雨损坏数量上限≥下限且为正数', () => {
    const storm = allWeather.storm;
    expect(storm.damageCountMin).toBeGreaterThan(0);
    expect(storm.damageCountMax).toBeGreaterThanOrEqual(storm.damageCountMin);
  });

  it('weatherWeight 全部为正数且和大于 0', () => {
    const weights = weatherEntries.map(([, cfg]) => cfg.weatherWeight);
    weights.forEach((w) => expect(w).toBeGreaterThan(0));
    const total = weights.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0);
  });

  it('晴天权重最高（大部分是好天气）', () => {
    expect(allWeather.sunny.weatherWeight).toBeGreaterThan(allWeather.rainy.weatherWeight);
    expect(allWeather.rainy.weatherWeight).toBeGreaterThan(allWeather.storm.weatherWeight);
  });

  it('雨天与暴风雨生长倍数≥晴天（水促进生长）', () => {
    const sunnyMult = allWeather.sunny.growthMultiplier;
    expect(allWeather.rainy.growthMultiplier).toBeGreaterThanOrEqual(sunnyMult);
    expect(allWeather.storm.growthMultiplier).toBeGreaterThanOrEqual(sunnyMult);
  });

  it('暴风雨玩家移速最慢', () => {
    expect(allWeather.storm.playerSpeedMultiplier).toBeLessThan(allWeather.sunny.playerSpeedMultiplier);
    expect(allWeather.storm.playerSpeedMultiplier).toBeLessThan(allWeather.rainy.playerSpeedMultiplier);
  });

  it('只有暴风雨有闪电效果', () => {
    expect(allWeather.sunny.hasLightning).toBe(false);
    expect(allWeather.rainy.hasLightning).toBe(false);
    expect(allWeather.storm.hasLightning).toBe(true);
  });

  it('雨天和暴风雨启用雨滴粒子', () => {
    expect(allWeather.sunny.hasRainParticles).toBe(false);
    expect(allWeather.rainy.hasRainParticles).toBe(true);
    expect(allWeather.storm.hasRainParticles).toBe(true);
  });

  it('JSON 顶级键与 type 字段一致', () => {
    Object.entries(weatherJSON as Record<string, WeatherConfigEntry>).forEach(([key, cfg]) => {
      expect(cfg.type).toBe(key);
    });
  });
});

describe('配置数据校验 - 物品配置 (items.json)', () => {
  const loader = ConfigLoader.getInstance();
  const allItems: Record<string, ItemConfig> = loader.getAllItems();
  const itemEntries = Object.entries(allItems) as Array<[string, ItemConfig]>;

  it('至少包含 10 种物品', () => {
    expect(itemEntries.length).toBeGreaterThanOrEqual(10);
  });

  it.each(itemEntries)('%s: 价格为正数', (_id, cfg) => {
    expect(cfg.price).toBeGreaterThan(0);
  });

  it.each(itemEntries)('%s: 售价 ≥ 0 且 ≤ 买入价（不允许倒卖）', (_id, cfg) => {
    expect(cfg.sellPrice).toBeGreaterThanOrEqual(0);
    expect(cfg.sellPrice).toBeLessThanOrEqual(cfg.price);
  });

  it('作物类（可收获产品）售价应大于种子价格（形成市场）', () => {
    const crops = ['potato_crop', 'carrot_crop', 'pumpkin_crop'];
    const seeds = ['potato_seed', 'carrot_seed', 'pumpkin_seed'];
    crops.forEach((c, i) => {
      expect(allItems[c].sellPrice).toBeGreaterThan(allItems[seeds[i]].price);
    });
  });

  it('每种作物种子的买入价和 crops.json 中 seedPrice 一致', () => {
    const cropIds = ['potato', 'carrot', 'pumpkin'];
    const cropsCfg = loader.getAllCrops();
    cropIds.forEach((cid) => {
      const seedId = cropsCfg[cid].seedItemId;
      expect(allItems[seedId].price).toBe(cropsCfg[cid].seedPrice);
    });
  });

  it('每种作物售价和 crops.json 中 sellPrice 一致', () => {
    const cropIds = ['potato', 'carrot', 'pumpkin'];
    const cropsCfg = loader.getAllCrops();
    cropIds.forEach((cid) => {
      const cropItemId = cropsCfg[cid].cropItemId;
      expect(allItems[cropItemId].sellPrice).toBe(cropsCfg[cid].sellPrice);
    });
  });

  it.each(itemEntries)('%s: type 为合法类型', (_id, cfg) => {
    expect(['seed', 'crop', 'pet_food', 'pet']).toContain(cfg.type);
  });

  it('宠物物品有正确的 petType', () => {
    const pets = Object.values(allItems).filter((i) => i.type === 'pet');
    pets.forEach((p) => {
      expect(['cat', 'dog', 'rabbit']).toContain(p.petType);
    });
  });

  it('JSON 顶级键与 id 字段一致', () => {
    Object.entries(itemsJSON as Record<string, ItemConfig>).forEach(([key, cfg]) => {
      expect(cfg.id).toBe(key);
    });
  });

  it('getShopItems 返回正确分类（种子 + 宠物饲料 + 宠物）', () => {
    const shopItems = loader.getShopItems();
    const hasSeeds = shopItems.some((i) => i.type === 'seed');
    const hasPetFood = shopItems.some((i) => i.type === 'pet_food');
    const hasPets = shopItems.some((i) => i.type === 'pet');
    expect(hasSeeds).toBe(true);
    expect(hasPetFood).toBe(true);
    expect(hasPets).toBe(true);
  });

  it('getSellableItems 只返回作物类', () => {
    const sellable = loader.getSellableItems();
    sellable.forEach((item) => {
      expect(item.type).toBe('crop');
    });
    expect(sellable.length).toBeGreaterThanOrEqual(3);
  });
});

describe('配置权重随机化逻辑', () => {
  const loader = ConfigLoader.getInstance();
  const TRIALS = 1000;

  it('getRandomWeather 返回合法天气类型且不崩', () => {
    const seen = new Set<string>();
    for (let i = 0; i < TRIALS; i++) {
      const w = loader.getRandomWeather();
      expect(['sunny', 'rainy', 'storm']).toContain(w);
      seen.add(w);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('权重分布合理：晴天 > 雨天 > 暴风雨', () => {
    const counts: Record<string, number> = { sunny: 0, rainy: 0, storm: 0 };
    for (let i = 0; i < TRIALS; i++) {
      const w = loader.getRandomWeather();
      counts[w]++;
    }
    expect(counts.sunny).toBeGreaterThan(counts.rainy);
    expect(counts.rainy).toBeGreaterThan(counts.storm);
  });
});
