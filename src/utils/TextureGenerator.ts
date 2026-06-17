import Phaser from 'phaser';

export class TextureGenerator {
  static generateAll(scene: Phaser.Scene): void {
    this.generatePlayerTexture(scene);
    this.generateTileTextures(scene);
    this.generateCropTextures(scene);
    this.generateItemTextures(scene);
    this.generateNpcTexture(scene);
  }

  static generatePlayerTexture(scene: Phaser.Scene): void {
    const width = 32;
    const height = 32;
    const frames = 8;

    const graphics = scene.add.graphics();

    const drawPlayer = (
      g: Phaser.GameObjects.Graphics,
      offsetX: number,
      frame: number,
      direction: string
    ) => {
      const bobOffset = frame % 2 === 0 ? 0 : 1;

      g.fillStyle(0x4a90d9);
      g.fillRect(offsetX + 10, 12 + bobOffset, 12, 14);

      g.fillStyle(0xffdbac);
      g.fillRect(offsetX + 10, 4 + bobOffset, 12, 10);

      g.fillStyle(0x8b4513);
      g.fillRect(offsetX + 10, 2 + bobOffset, 12, 4);
      g.fillRect(offsetX + 9, 3 + bobOffset, 1, 3);
      g.fillRect(offsetX + 22, 3 + bobOffset, 1, 3);

      g.fillStyle(0x000000);
      if (direction === 'left') {
        g.fillRect(offsetX + 12, 8 + bobOffset, 2, 2);
      } else if (direction === 'right') {
        g.fillRect(offsetX + 18, 8 + bobOffset, 2, 2);
      } else if (direction === 'up') {
        g.fillRect(offsetX + 13, 8 + bobOffset, 2, 2);
        g.fillRect(offsetX + 17, 8 + bobOffset, 2, 2);
      } else {
        g.fillRect(offsetX + 13, 8 + bobOffset, 2, 2);
        g.fillRect(offsetX + 17, 8 + bobOffset, 2, 2);
      }

      g.fillStyle(0x2d3436);
      if (frame % 2 === 0) {
        g.fillRect(offsetX + 11, 26 + bobOffset, 4, 4);
        g.fillRect(offsetX + 17, 26 + bobOffset, 4, 4);
      } else {
        g.fillRect(offsetX + 12, 26 + bobOffset, 4, 4);
        g.fillRect(offsetX + 16, 26 + bobOffset, 4, 4);
      }

      g.fillStyle(0xffdbac);
      if (direction === 'left') {
        g.fillRect(offsetX + 7, 14 + bobOffset, 3, 8);
        g.fillRect(offsetX + 22, 14 + bobOffset, 3, 8);
      } else if (direction === 'right') {
        g.fillRect(offsetX + 7, 14 + bobOffset, 3, 8);
        g.fillRect(offsetX + 22, 14 + bobOffset, 3, 8);
      } else {
        g.fillRect(offsetX + 7, 14 + bobOffset, 3, 8);
        g.fillRect(offsetX + 22, 14 + bobOffset, 3, 8);
      }
    };

    const directions = ['down', 'up', 'left', 'right'];
    for (let d = 0; d < 4; d++) {
      for (let f = 0; f < 2; f++) {
        const frameIndex = d * 2 + f;
        drawPlayer(graphics, frameIndex * width, f, directions[d]);
      }
    }

    graphics.generateTexture('player', width * frames, height);
    graphics.destroy();

    const animFrames: Phaser.Types.Textures.FrameConfig[] = [];
    for (let i = 0; i < frames; i++) {
      animFrames.push({ key: 'player', frame: i });
    }
  }

  static generateTileTextures(scene: Phaser.Scene): void {
    const tileSize = 32;

    const grassGraphics = scene.add.graphics();
    grassGraphics.fillStyle(0x4a8c3f);
    grassGraphics.fillRect(0, 0, tileSize, tileSize);
    grassGraphics.fillStyle(0x5da048);
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = Math.floor(Math.random() * tileSize);
      grassGraphics.fillRect(x, y, 2, 2);
    }
    grassGraphics.fillStyle(0x3d7a32);
    for (let i = 0; i < 5; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = Math.floor(Math.random() * tileSize);
      grassGraphics.fillRect(x, y, 2, 1);
    }
    grassGraphics.generateTexture('grass', tileSize, tileSize);
    grassGraphics.destroy();

    const tilledGraphics = scene.add.graphics();
    tilledGraphics.fillStyle(0x8b6914);
    tilledGraphics.fillRect(0, 0, tileSize, tileSize);
    tilledGraphics.fillStyle(0x6b4e0e);
    tilledGraphics.fillRect(2, 4, 28, 2);
    tilledGraphics.fillRect(2, 12, 28, 2);
    tilledGraphics.fillRect(2, 20, 28, 2);
    tilledGraphics.fillRect(2, 28, 28, 2);
    tilledGraphics.fillStyle(0x9c7a20);
    tilledGraphics.fillRect(4, 8, 24, 2);
    tilledGraphics.fillRect(4, 16, 24, 2);
    tilledGraphics.fillRect(4, 24, 24, 2);
    tilledGraphics.generateTexture('tilled', tileSize, tileSize);
    tilledGraphics.destroy();

    const waterGraphics = scene.add.graphics();
    waterGraphics.fillStyle(0x4fc3f7);
    waterGraphics.fillRect(0, 0, tileSize, tileSize);
    waterGraphics.fillStyle(0x81d4fa);
    waterGraphics.fillRect(4, 6, 10, 2);
    waterGraphics.fillRect(18, 14, 10, 2);
    waterGraphics.fillRect(8, 24, 12, 2);
    waterGraphics.fillStyle(0x29b6f6);
    waterGraphics.fillRect(0, 0, tileSize, 2);
    waterGraphics.fillRect(0, 30, tileSize, 2);
    waterGraphics.generateTexture('water', tileSize, tileSize);
    waterGraphics.destroy();

    const fenceGraphics = scene.add.graphics();
    fenceGraphics.fillStyle(0x8b4513);
    fenceGraphics.fillRect(0, 0, tileSize, tileSize);
    fenceGraphics.fillStyle(0x654321);
    fenceGraphics.fillRect(0, 4, tileSize, 4);
    fenceGraphics.fillRect(0, 20, tileSize, 4);
    fenceGraphics.fillStyle(0x9c5a20);
    fenceGraphics.fillRect(4, 0, 4, tileSize);
    fenceGraphics.fillRect(24, 0, 4, tileSize);
    fenceGraphics.fillStyle(0x5c3317);
    fenceGraphics.fillRect(2, 2, 2, 2);
    fenceGraphics.fillRect(28, 2, 2, 2);
    fenceGraphics.fillRect(2, 28, 2, 2);
    fenceGraphics.fillRect(28, 28, 2, 2);
    fenceGraphics.generateTexture('fence', tileSize, tileSize);
    fenceGraphics.destroy();

    const pathGraphics = scene.add.graphics();
    pathGraphics.fillStyle(0xc4a35a);
    pathGraphics.fillRect(0, 0, tileSize, tileSize);
    pathGraphics.fillStyle(0xb08940);
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = Math.floor(Math.random() * tileSize);
      pathGraphics.fillRect(x, y, 3, 3);
    }
    pathGraphics.fillStyle(0xd4b86e);
    for (let i = 0; i < 4; i++) {
      const x = Math.floor(Math.random() * tileSize);
      const y = Math.floor(Math.random() * tileSize);
      pathGraphics.fillRect(x, y, 2, 2);
    }
    pathGraphics.generateTexture('path', tileSize, tileSize);
    pathGraphics.destroy();

    const soilGraphics = scene.add.graphics();
    soilGraphics.fillStyle(0x6b4423);
    soilGraphics.fillRect(0, 0, tileSize, tileSize);
    soilGraphics.fillStyle(0x5a3a1d);
    soilGraphics.fillRect(2, 2, 28, 28);
    soilGraphics.fillStyle(0x7a5230);
    soilGraphics.fillRect(4, 4, 8, 2);
    soilGraphics.fillRect(16, 10, 10, 2);
    soilGraphics.fillRect(6, 18, 12, 2);
    soilGraphics.fillRect(20, 26, 8, 2);
    soilGraphics.generateTexture('soil', tileSize, tileSize);
    soilGraphics.destroy();
  }

  static generateCropTextures(scene: Phaser.Scene): void {
    const crops = ['potato', 'carrot', 'pumpkin'];
    const stages = ['seed', 'sprout', 'growing', 'mature'];

    crops.forEach((crop) => {
      stages.forEach((stage, stageIndex) => {
        const key = `${crop}_${stage}`;
        const graphics = scene.add.graphics();

        if (stage === 'seed') {
          graphics.fillStyle(0x6b4423);
          graphics.fillRect(12, 20, 8, 6);
          graphics.fillStyle(0x8b6914);
          graphics.fillRect(13, 22, 6, 3);
        } else if (stage === 'sprout') {
          graphics.fillStyle(0x6b4423);
          graphics.fillRect(12, 24, 8, 4);
          graphics.fillStyle(0x7cb342);
          graphics.fillRect(14, 14, 4, 12);
          graphics.fillRect(10, 16, 4, 4);
          graphics.fillRect(18, 16, 4, 4);
        } else if (stage === 'growing') {
          graphics.fillStyle(0x6b4423);
          graphics.fillRect(12, 26, 8, 3);
          graphics.fillStyle(0x558b2f);
          graphics.fillRect(14, 8, 4, 20);
          graphics.fillStyle(0x7cb342);
          graphics.fillRect(8, 10, 6, 4);
          graphics.fillRect(18, 10, 6, 4);
          graphics.fillRect(6, 16, 6, 3);
          graphics.fillRect(20, 16, 6, 3);
        } else if (stage === 'mature') {
          graphics.fillStyle(0x6b4423);
          graphics.fillRect(12, 28, 8, 2);
          graphics.fillStyle(0x558b2f);
          graphics.fillRect(14, 10, 4, 20);
          graphics.fillStyle(0x7cb342);
          graphics.fillRect(6, 12, 6, 4);
          graphics.fillRect(20, 12, 6, 4);
          graphics.fillRect(4, 18, 6, 3);
          graphics.fillRect(22, 18, 6, 3);

          if (crop === 'potato') {
            graphics.fillStyle(0xc4a35a);
            graphics.fillRect(8, 22, 6, 6);
            graphics.fillRect(16, 20, 8, 8);
            graphics.fillStyle(0xb08940);
            graphics.fillRect(18, 22, 4, 4);
          } else if (crop === 'carrot') {
            graphics.fillStyle(0xff9800);
            graphics.fillRect(12, 20, 8, 10);
            graphics.fillRect(10, 22, 2, 6);
            graphics.fillRect(20, 22, 2, 6);
            graphics.fillStyle(0xf57c00);
            graphics.fillRect(14, 24, 4, 4);
          } else if (crop === 'pumpkin') {
            graphics.fillStyle(0xff9800);
            graphics.fillRect(6, 16, 20, 14);
            graphics.fillStyle(0xf57c00);
            graphics.fillRect(10, 18, 4, 10);
            graphics.fillRect(18, 18, 4, 10);
            graphics.fillStyle(0x558b2f);
            graphics.fillRect(14, 12, 4, 4);
            graphics.fillStyle(0xffb74d);
            graphics.fillRect(8, 18, 2, 8);
          }
        }

        graphics.generateTexture(key, 32, 32);
        graphics.destroy();
      });
    });
  }

  static generateItemTextures(scene: Phaser.Scene): void {
    const items: Record<string, { color: number; type: string }> = {
      potato_seed: { color: 0x8b6914, type: 'seed' },
      carrot_seed: { color: 0xff9800, type: 'seed' },
      pumpkin_seed: { color: 0xff6f00, type: 'seed' },
      potato: { color: 0xc4a35a, type: 'crop' },
      carrot: { color: 0xff9800, type: 'crop' },
      pumpkin: { color: 0xff9800, type: 'crop' }
    };

    Object.entries(items).forEach(([key, data]) => {
      const graphics = scene.add.graphics();

      if (data.type === 'seed') {
        graphics.fillStyle(data.color);
        graphics.fillRect(8, 10, 16, 12);
        graphics.fillStyle(0xffffff);
        graphics.fillRect(10, 12, 4, 2);
        graphics.fillStyle(0x000000);
        graphics.fillRect(14, 15, 4, 2);
      } else {
        if (key === 'potato') {
          graphics.fillStyle(0xc4a35a);
          graphics.fillRect(6, 8, 20, 16);
          graphics.fillStyle(0xb08940);
          graphics.fillRect(8, 10, 4, 4);
          graphics.fillRect(18, 14, 4, 4);
        } else if (key === 'carrot') {
          graphics.fillStyle(0xff9800);
          graphics.fillRect(10, 6, 12, 20);
          graphics.fillRect(8, 10, 2, 12);
          graphics.fillRect(22, 10, 2, 12);
          graphics.fillStyle(0x558b2f);
          graphics.fillRect(12, 2, 8, 6);
          graphics.fillRect(14, 0, 4, 4);
        } else if (key === 'pumpkin') {
          graphics.fillStyle(0xff9800);
          graphics.fillRect(4, 8, 24, 20);
          graphics.fillStyle(0xf57c00);
          graphics.fillRect(10, 10, 4, 16);
          graphics.fillRect(18, 10, 4, 16);
          graphics.fillStyle(0x558b2f);
          graphics.fillRect(12, 2, 8, 8);
        }
      }

      graphics.generateTexture(key, 32, 32);
      graphics.destroy();
    });
  }

  static generateNpcTexture(scene: Phaser.Scene): void {
    const width = 32;
    const height = 32;

    const graphics = scene.add.graphics();

    graphics.fillStyle(0x9c27b0);
    graphics.fillRect(10, 12, 12, 14);

    graphics.fillStyle(0xffdbac);
    graphics.fillRect(10, 4, 12, 10);

    graphics.fillStyle(0x795548);
    graphics.fillRect(10, 2, 12, 4);

    graphics.fillStyle(0x000000);
    graphics.fillRect(13, 8, 2, 2);
    graphics.fillRect(17, 8, 2, 2);

    graphics.fillStyle(0x5d4037);
    graphics.fillRect(11, 26, 4, 4);
    graphics.fillRect(17, 26, 4, 4);

    graphics.fillStyle(0xffdbac);
    graphics.fillRect(7, 14, 3, 8);
    graphics.fillRect(22, 14, 3, 8);

    graphics.fillStyle(0xe91e63);
    graphics.fillRect(6, 6, 20, 4);
    graphics.fillStyle(0xf06292);
    graphics.fillRect(12, 2, 8, 6);

    graphics.generateTexture('npc', width, height);
    graphics.destroy();
  }
}
