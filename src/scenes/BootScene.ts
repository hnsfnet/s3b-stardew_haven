import Phaser from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator';
import { GameStateManager } from '../state/GameStateManager';
import { ConfigLoader } from '../config/ConfigLoader';

export class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.createLoadingBar();

    this.load.on('progress', (value: number) => {
      this.updateProgressBar(value);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('资源加载完成！');
    });
  }

  create(): void {
    TextureGenerator.generateAll(this);

    this.setupPlayerFrames();

    this.initRegistry();

    this.time.delayedCall(500, () => {
      this.scene.start('GameScene');
    });
  }

  private setupPlayerFrames(): void {
    const texture = this.textures.get('player');
    const frameWidth = 32;
    const frameHeight = 32;
    const frames = 8;

    for (let i = 0; i < frames; i++) {
      texture.add(i, 0, i * frameWidth, 0, frameWidth, frameHeight);
    }
  }

  private createLoadingBar(): void {
    const { width, height } = this.scale;

    const title = this.add.text(width / 2, height / 2 - 80, '🌻 星露小筑 🌻', {
      fontSize: '36px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei'
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height / 2 - 40, '像素风农场经营游戏', {
      fontSize: '18px',
      color: '#98d98e',
      fontFamily: 'Microsoft YaHei'
    });
    subtitle.setOrigin(0.5);

    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x2d1b0e, 1);
    this.loadingBar.fillRoundedRect(width / 2 - 150, height / 2 + 20, 300, 30, 6);
    this.loadingBar.lineStyle(2, 0x8b6914, 1);
    this.loadingBar.strokeRoundedRect(width / 2 - 150, height / 2 + 20, 300, 30, 6);

    this.progressBar = this.add.graphics();

    this.loadingText = this.add.text(width / 2, height / 2 + 65, '正在加载资源...', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Microsoft YaHei'
    });
    this.loadingText.setOrigin(0.5);
  }

  private updateProgressBar(value: number): void {
    const { width } = this.scale;

    this.progressBar.clear();
    this.progressBar.fillStyle(0x7cfc00, 1);
    this.progressBar.fillRoundedRect(width / 2 - 146, height / 2 + 24, 292 * value, 22, 4);
  }

  private initRegistry(): void {
    const stateManager = GameStateManager.getInstance();
    stateManager.setRegistry(this.registry);
    ConfigLoader.getInstance();

    const savedData = stateManager.load();
    if (savedData) {
      stateManager.applySaveData(savedData);
    } else {
      stateManager.gold = 100;
      stateManager.day = 1;
      stateManager.initDefaultInventory();
      stateManager.pets = [];
      stateManager.weather = {
        current: 'sunny',
        yesterday: 'sunny',
        transitioning: false
      };
      stateManager.selectedSeed = null;
    }

    this.registry.set('time', 0);
    this.registry.set('gamePaused', false);
  }
}
