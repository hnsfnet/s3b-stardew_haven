import Phaser from 'phaser';
import type { WeatherType } from '../types';
import { ConfigLoader } from '../config/ConfigLoader';
import { WeatherSystem } from '../systems/WeatherSystem';

export class WeatherUI {
  private scene: Phaser.Scene;
  private weatherSystem: WeatherSystem;
  private container!: Phaser.GameObjects.Container;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private iconText!: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;
  private currentWeather: WeatherType = 'sunny';

  constructor(scene: Phaser.Scene, weatherSystem: WeatherSystem) {
    this.scene = scene;
    this.weatherSystem = weatherSystem;
    this.createUI();
    this.updateWeather(weatherSystem.getCurrentWeather());
  }

  private createUI(): void {
    const { width } = this.scene.scale;

    this.container = this.scene.add.container(width / 2, 28);
    this.container.setScrollFactor(0);
    this.container.setDepth(60);

    this.bgGraphics = this.scene.add.graphics();
    this.bgGraphics.fillStyle(0x000000, 0.5);
    this.bgGraphics.fillRoundedRect(-70, -22, 140, 44, 8);
    this.bgGraphics.lineStyle(2, 0xffffff, 0.3);
    this.bgGraphics.strokeRoundedRect(-70, -22, 140, 44, 8);

    this.iconText = this.scene.add.text(-45, 0, '☀️', {
      fontSize: '28px'
    });
    this.iconText.setOrigin(0, 0.5);

    this.nameText = this.scene.add.text(-5, 0, '晴天', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.nameText.setOrigin(0, 0.5);

    this.container.add([this.bgGraphics, this.iconText, this.nameText]);
  }

  updateWeather(weather: WeatherType): void {
    this.currentWeather = weather;
    const config = ConfigLoader.getInstance().getWeather(weather);
    if (!config) return;

    this.iconText.setText(config.icon);
    this.nameText.setText(config.name);

    let bgColor = 0x000000;
    let lineColor = 0xffffff;

    switch (weather) {
      case 'sunny':
        bgColor = 0xffa500;
        lineColor = 0xffd700;
        break;
      case 'rainy':
        bgColor = 0x2196f3;
        lineColor = 0x64b5f6;
        break;
      case 'storm':
        bgColor = 0x4a148c;
        lineColor = 0x7c4dff;
        break;
    }

    this.bgGraphics.clear();
    this.bgGraphics.fillStyle(bgColor, 0.6);
    this.bgGraphics.fillRoundedRect(-70, -22, 140, 44, 8);
    this.bgGraphics.lineStyle(2, lineColor, 0.8);
    this.bgGraphics.strokeRoundedRect(-70, -22, 140, 44, 8);
  }

  showTransition(): void {
    const newWeather = this.weatherSystem.getCurrentWeather();
    if (newWeather !== this.currentWeather) {
      this.scene.tweens.add({
        targets: this.container,
        scale: { from: 0.5, to: 1.2 },
        duration: 400,
        ease: 'Back.out',
        onComplete: () => {
          this.updateWeather(newWeather);
          this.scene.tweens.add({
            targets: this.container,
            scale: 1,
            duration: 200,
            ease: 'Sine.easeOut'
          });
        }
      });
    }
  }

  getWeather(): WeatherType {
    return this.currentWeather;
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }
}
