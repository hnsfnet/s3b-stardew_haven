import { ShopLogic } from '../../logic/ShopLogic';
import { ConfigLoader } from '../../config/ConfigLoader';
import {
  createInventory,
  createInventoryWithItems,
  createFullInventory
} from '../factories/TestFactories';
import type { InventorySlot } from '../../types';

describe('ShopLogic - 商店系统单元测试', () => {
  const config = ConfigLoader.getInstance();

  describe('金币与购买校验', () => {
    it('金币充足时可以购买', () => {
      const seed = config.getItem('potato_seed')!;
      expect(ShopLogic.canBuy(100, seed.price)).toBe(true);
    });

    it('金币不足时无法购买', () => {
      const seed = config.getItem('potato_seed')!;
      expect(ShopLogic.canBuy(5, seed.price)).toBe(false);
    });

    it('零或负价格不允许购买', () => {
      expect(ShopLogic.canBuy(100, 0)).toBe(false);
      expect(ShopLogic.canBuy(100, -10)).toBe(false);
    });

    it('刚好等于价格时允许购买', () => {
      expect(ShopLogic.canBuy(50, 50)).toBe(true);
    });
  });

  describe('物品添加（背包）', () => {
    it('空背包可以添加物品', () => {
      const inv = createInventory(5);
      const result = ShopLogic.addItems(inv, 'potato_seed', 10);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(0);
      expect(result.newInventory[0].itemId).toBe('potato_seed');
      expect(result.newInventory[0].quantity).toBe(10);
    });

    it('相同物品合并到同一槽位', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato_seed', quantity: 5 }]);
      const result = ShopLogic.addItems(inv, 'potato_seed', 10);
      expect(result.success).toBe(true);
      expect(result.newInventory[0].quantity).toBe(15);
      expect(result.newInventory[1].itemId).toBeNull();
    });

    it('背包满时添加失败并返回剩余数量', () => {
      const inv = createFullInventory('potato', 99);
      const result = ShopLogic.addItems(inv, 'carrot', 5);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(5);
    });

    it('空间不足时尽可能填充', () => {
      const inv = createInventory(3);
      inv[0] = { itemId: 'carrot', quantity: 10 };
      inv[1] = { itemId: 'carrot', quantity: 5 };
      const result = ShopLogic.addItems(inv, 'carrot', 100);
      expect(result.success).toBe(true);
      expect(ShopLogic.countItem(result.newInventory, 'carrot')).toBe(115);
    });

    it('添加 0 个物品返回成功且不修改背包', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato', quantity: 1 }]);
      const snapshot = JSON.stringify(inv);
      const result = ShopLogic.addItems(inv, 'carrot', 0);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(0);
      expect(JSON.stringify(inv)).toBe(snapshot);
    });
  });

  describe('物品移除（背包）', () => {
    it('能正确移除指定数量物品', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato', quantity: 15 }]);
      const result = ShopLogic.removeItems(inv, 'potato', 10);
      expect(result[0].quantity).toBe(5);
      expect(result[0].itemId).toBe('potato');
    });

    it('移除全部数量后清空槽位', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato', quantity: 10 }]);
      const result = ShopLogic.removeItems(inv, 'potato', 10);
      expect(result[0].quantity).toBe(0);
      expect(result[0].itemId).toBeNull();
    });

    it('数量不足时移除所有存在的', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato', quantity: 5 }]);
      const result = ShopLogic.removeItems(inv, 'potato', 100);
      expect(ShopLogic.countItem(result, 'potato')).toBe(0);
    });

    it('不存在物品时背包不变', () => {
      const inv = createInventoryWithItems([{ itemId: 'carrot', quantity: 10 }]);
      const snapshot = JSON.stringify(inv);
      const result = ShopLogic.removeItems(inv, 'potato', 5);
      expect(JSON.stringify(result)).toBe(snapshot);
    });

    it('跨多个槽位移除', () => {
      const inv = createInventory(5);
      inv[0] = { itemId: 'carrot', quantity: 5 };
      inv[2] = { itemId: 'carrot', quantity: 3 };
      inv[4] = { itemId: 'carrot', quantity: 2 };
      const result = ShopLogic.removeItems(inv, 'carrot', 8);
      expect(ShopLogic.countItem(result, 'carrot')).toBe(2);
    });
  });

  describe('物品计数和存在检查', () => {
    it('统计物品数量正确（跨槽位）', () => {
      const inv = createInventory(5);
      inv[0] = { itemId: 'potato', quantity: 3 };
      inv[2] = { itemId: 'potato', quantity: 7 };
      expect(ShopLogic.countItem(inv, 'potato')).toBe(10);
    });

    it('不存在的物品数量为 0', () => {
      const inv = createInventory(5);
      expect(ShopLogic.countItem(inv, 'nonexistent')).toBe(0);
    });

    it('空槽位不计入数量', () => {
      const inv = createInventoryWithItems([{ itemId: 'carrot', quantity: 0 }]);
      expect(ShopLogic.countItem(inv, 'carrot')).toBe(0);
    });

    it('hasItem 检查数量是否足够', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato', quantity: 5 }]);
      expect(ShopLogic.hasItem(inv, 'potato', 3)).toBe(true);
      expect(ShopLogic.hasItem(inv, 'potato', 10)).toBe(false);
    });
  });

  describe('购买物品', () => {
    it('正常购买种子成功', () => {
      const inv = createInventory(10);
      const seed = config.getItem('carrot_seed')!;
      const result = ShopLogic.buy(500, inv, 'carrot_seed', 3);
      expect(result.success).toBe(true);
      expect(result.newGold).toBe(500 - seed.price * 3);
      expect(ShopLogic.countItem(result.newInventory, 'carrot_seed')).toBe(3);
    });

    it('金币不足购买失败', () => {
      const inv = createInventory(10);
      const result = ShopLogic.buy(1, inv, 'potato_seed', 1);
      expect(result.success).toBe(false);
      expect(result.newGold).toBe(1);
    });

    it('不存在物品购买失败', () => {
      const result = ShopLogic.buy(1000, createInventory(), 'nonexistent_item', 1);
      expect(result.success).toBe(false);
      expect(result.message).toBe('物品不存在');
    });

    it('背包满时购买失败并退还金币', () => {
      const inv = createFullInventory('potato', 99);
      const result = ShopLogic.buy(500, inv, 'carrot', 1);
      expect(result.success).toBe(false);
      expect(result.newGold).toBe(500);
    });

    it('批量购买时数量计算正确', () => {
      const inv = createInventory(5);
      const potatoCfg = config.getItem('potato_seed')!;
      const result = ShopLogic.buy(1000, inv, 'potato_seed', 10);
      expect(result.success).toBe(true);
      expect(result.newGold).toBe(1000 - potatoCfg.price * 10);
      expect(ShopLogic.countItem(result.newInventory, 'potato_seed')).toBe(10);
    });
  });

  describe('出售物品', () => {
    it('出售作物获得金币', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato', quantity: 10 }]);
      const potatoCfg = config.getItem('potato')!;
      const result = ShopLogic.sell(0, inv, 'potato', 5);
      expect(result.success).toBe(true);
      expect(result.newGold).toBe(potatoCfg.sellPrice * 5);
      expect(result.soldCount).toBe(5);
      expect(ShopLogic.countItem(result.newInventory, 'potato')).toBe(5);
    });

    it('出售不存在的物品返回 0', () => {
      const result = ShopLogic.sell(100, createInventory(), 'potato', 5);
      expect(result.success).toBe(false);
      expect(result.soldCount).toBe(0);
      expect(result.newGold).toBe(100);
    });

    it('数量超出库存时只出售现有部分', () => {
      const inv = createInventoryWithItems([{ itemId: 'carrot', quantity: 3 }]);
      const carrotCfg = config.getItem('carrot')!;
      const result = ShopLogic.sell(0, inv, 'carrot', 100);
      expect(result.success).toBe(true);
      expect(result.soldCount).toBe(3);
      expect(result.totalPrice).toBe(carrotCfg.sellPrice * 3);
    });

    it('sellAll 一次性卖出全部', () => {
      const inv = createInventoryWithItems([{ itemId: 'pumpkin', quantity: 12 }]);
      const pumpkinCfg = config.getItem('pumpkin')!;
      const result = ShopLogic.sellAll(50, inv, 'pumpkin');
      expect(result.success).toBe(true);
      expect(result.soldCount).toBe(12);
      expect(result.totalPrice).toBe(pumpkinCfg.sellPrice * 12);
      expect(result.newGold).toBe(50 + pumpkinCfg.sellPrice * 12);
      expect(ShopLogic.countItem(result.newInventory, 'pumpkin')).toBe(0);
    });

    it('出售数量为 0 返回失败', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato', quantity: 5 }]);
      const result = ShopLogic.sell(100, inv, 'potato', 0);
      expect(result.success).toBe(false);
      expect(result.soldCount).toBe(0);
    });

    it('超过 99 个物品时正确计算全部金币', () => {
      const inv = createInventory(5);
      inv[0] = { itemId: 'potato', quantity: 99 };
      inv[1] = { itemId: 'potato', quantity: 50 };
      const potatoCfg = config.getItem('potato')!;
      const result = ShopLogic.sellAll(0, inv, 'potato');
      expect(result.soldCount).toBe(149);
      expect(result.totalPrice).toBe(potatoCfg.sellPrice * 149);
    });
  });

  describe('购买-出售完整交易流程', () => {
    it('买种子→（模拟种植收获）→卖作物应盈利', () => {
      const seedCfg = config.getItem('potato_seed')!;
      const cropCfg = config.getItem('potato')!;

      let gold = 100;
      let inv = createInventory(5);

      const buy = ShopLogic.buy(gold, inv, 'potato_seed', 1);
      expect(buy.success).toBe(true);
      gold = buy.newGold;
      inv = buy.newInventory;

      inv = ShopLogic.removeItems(inv, 'potato_seed', 1);
      inv = ShopLogic.addItems(inv, 'potato', 1).newInventory;

      const sell = ShopLogic.sell(gold, inv, 'potato', 1);
      expect(sell.success).toBe(true);
      expect(sell.newGold).toBeGreaterThan(100 - seedCfg.price + cropCfg.sellPrice - 1);
    });
  });

  describe('原对象不被修改', () => {
    it('buy 不修改传入的 inventory', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato', quantity: 1 }]);
      const snapshot = JSON.stringify(inv);
      ShopLogic.buy(500, inv, 'carrot_seed', 1);
      expect(JSON.stringify(inv)).toBe(snapshot);
    });

    it('sell 不修改传入的 inventory', () => {
      const inv = createInventoryWithItems([{ itemId: 'potato', quantity: 10 }]);
      const snapshot = JSON.stringify(inv);
      ShopLogic.sell(0, inv, 'potato', 5);
      expect(JSON.stringify(inv)).toBe(snapshot);
    });
  });

  describe('利润计算', () => {
    it('盈利时利润为正数', () => {
      expect(ShopLogic.calculateProfit(100, 150)).toBe(50);
    });

    it('亏损时利润为负数', () => {
      expect(ShopLogic.calculateProfit(100, 80)).toBe(-20);
    });

    it('不赚不亏时利润为 0', () => {
      expect(ShopLogic.calculateProfit(100, 100)).toBe(0);
    });
  });

  describe('背包汇总与可出售物品', () => {
    it('getInventorySummary 返回物品汇总', () => {
      const inv = createInventory(5);
      inv[0] = { itemId: 'potato', quantity: 3 };
      inv[2] = { itemId: 'potato', quantity: 2 };
      inv[3] = { itemId: 'carrot', quantity: 5 };
      const summary = ShopLogic.getInventorySummary(inv);
      expect(summary.length).toBe(2);
      const potato = summary.find((s) => s.itemId === 'potato');
      expect(potato?.quantity).toBe(5);
      const carrot = summary.find((s) => s.itemId === 'carrot');
      expect(carrot?.quantity).toBe(5);
    });

    it('getSellableItems 只返回作物类', () => {
      const inv = createInventoryWithItems([
        { itemId: 'potato_seed', quantity: 5 },
        { itemId: 'potato', quantity: 3 },
        { itemId: 'pet_food', quantity: 2 },
        { itemId: 'carrot', quantity: 1 }
      ]);
      const sellable = ShopLogic.getSellableItems(inv);
      expect(sellable).toContain('potato');
      expect(sellable).toContain('carrot');
      expect(sellable).not.toContain('potato_seed');
      expect(sellable).not.toContain('pet_food');
    });

    it('空背包汇总返回空数组', () => {
      const summary = ShopLogic.getInventorySummary(createInventory());
      expect(summary.length).toBe(0);
    });

    it('未知物品 ID 不出现在汇总中', () => {
      const inv = createInventory(3);
      inv[0] = { itemId: 'nonexistent_item', quantity: 5 };
      const summary = ShopLogic.getInventorySummary(inv);
      expect(summary.length).toBe(0);
    });
  });
});
