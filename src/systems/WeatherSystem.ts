import Phaser from 'phaser';
import type { WeatherType, WeatherState } from '../types';
import { ConfigLoader } from '../config/ConfigLoader';

export class WeatherSystem {
  private scene: Phaser.Scene;
  private state: WeatherState;
  private rainParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private stormParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private lightningGraphics!: Phaser.GameObjects.Graphics;
  private lightningTimer: number = 0;
  private darkOverlay!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.state = {
      current: 'sunny',
      yesterday: 'sunny',
      transitioning: false
    };

    this.createWeatherEffects();
    this.applyWeather();
  }

  loadFromRegistry(): void {
    const savedWeather = this.scene.registry.get('weather') as WeatherState | undefined;
    if (savedWeather) {
      this.state = { ...savedWeather };
    }
    this.applyWeather();
  }

  private saveToRegistry(): void {
    this.scene.registry.set('weather', { ...this.state });
  }

  private createWeatherEffects(): void {
    const { width, height } = this.scene.scale;

    this.darkOverlay = this.scene.add.graphics();
    this.darkOverlay.setScrollFactor(0);
    this.darkOverlay.setDepth(50);
    this.darkOverlay.fillStyle(0x000033, 0);
    this.darkOverlay.fillRect(0, 0, width * 3, height * 3);

    this.rainParticles = this.scene.add.particles(0, 0, null, {
      speed: { min: 200, max: 300 },
      angle: { min: 240, max: 260 },
      lifespan: 2000,
      quantity: 2,
      scale: { start: 1, end: 1 },
      alpha: { start: 0.6, end: 0.3 },
      tint: 0x4fc3f7,
      emitting: false,
      gravityY: 300,
      bounds: { x: -100, y: -100, w: width * 3 + 200, h: height * 3 + 200 },
      collideBottom: false
    });
    this.rainParticles.setScrollFactor(1);
    this.rainParticles.setDepth(48);

    this.stormParticles = this.scene.add.particles(0, 0, null, {
      speed: { min: 400, max: 600 },
      angle: { min: 230, max: 270 },
      lifespan: 1500,
      quantity: 4,
      scale: { start: 1, end: 1 },
      alpha: { start: 0.8, end: 0.4 },
      tint: 0x29b6f6,
      emitting: false,
      gravityY: 500,
      bounds: { x: -100, y: -100, w: width * 3 + 200, h: height * 3 + 200 },
      collideBottom: false
    });
    this.stormParticles.setScrollFactor(1);
    this.stormParticles.setDepth(49);

    this.lightningGraphics = this.scene.add.graphics();
    this.lightningGraphics.setScrollFactor(0);
    this.lightningGraphics.setDepth(51);
  }

  applyWeather(): void {
    this.rainParticles.stop();
    this.stormParticles.stop();
    this.lightningGraphics.clear();

    const { width, height } = this.scene.scale;
    this.darkOverlay.clear();

    switch (this.state.current) {
      case 'sunny':
        this.darkOverlay.fillStyle(0x000000, 0);
        this.darkOverlay.fillRect(0, 0, width * 3, height * 3);
        break;

      case 'rainy':
        this.rainParticles.start();
        this.darkOverlay.fillStyle(0x333366, 0.15);
        this.darkOverlay.fillRect(0, 0, width * 3, height * 3);
        break;

      case 'storm':
        this.rainParticles.start();
        this.stormParticles.start();
        this.darkOverlay.fillStyle(0x1a1a3a, 0.35);
        this.darkOverlay.fillRect(0, 0, width * 3, height * 3);
        this.lightningTimer = 3000 + Math.random() * 5000;
        break;
    }

    this.saveToRegistry();
  }

  update(delta: number): void {
    if (this.state.current === 'storm') {
      this.lightningTimer -= delta;
      if (this.lightningTimer <= 0) {
        this.triggerLightning();
        this.lightningTimer = 4000 + Math.random() * 8000;
      }
    }
  }

  updateParticlesPosition(cameraX: number, cameraY: number): void {
    if (this.state.current === 'rainy' || this.state.current === 'storm') {
      this.rainParticles.emitParticleAt(
        cameraX + Math.random() * 900 - 50,
        cameraY - 50,
        2
      );
    }

    if (this.state.current === 'storm') {
      this.stormParticles.emitParticleAt(
        cameraX + Math.random() * 900 - 50,
        cameraY - 50,
        3
      );
    }
  }

  private triggerLightning(): void {
    const { width, height } = this.scene.scale;

    this.scene.tweens.add({
      targets: this.darkOverlay,
      alpha: 0.1,
      duration: 50,
      yoyo: true,
      onComplete: () => {
        this.applyWeather();
      }
    });

    this.lightningGraphics.clear();
    this.lightningGraphics.fillStyle(0xffffff, 0.9);
    this.lightningGraphics.fillRect(0, 0, width * 3, height * 3);

    this.scene.time.delayedCall(80, () => {
      this.lightningGraphics.clear();
      this.lightningGraphics.fillStyle(0xffffff, 0.3);
      this.lightningGraphics.fillRect(0, 0, width * 3, height * 3);
    });

    this.scene.time.delayedCall(120, () => {
      this.lightningGraphics.clear();
    });

    this.scene.cameras.main.shake(200, 0.005);
  }

  advanceDay(): WeatherType {
    const weatherTypes: WeatherType[] = ['sunny', 'sunny', 'sunny', 'rainy', 'rainy', 'storm'];
    const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

    this.state.yesterday = this.state.current;
    this.state.current = newWeather;
    this.state.transitioning = true;

    this.applyWeather();

    return newWeather;
  }

  getCurrentWeather(): WeatherType {
    return this.state.current;
  }

  getWeatherConfig() {
    const config = ConfigLoader.getInstance();
    return config.getWeather(this.state.current);
  }

  getState(): WeatherState {
    return { ...this.state };
  }

  destroy(): void {
    this.rainParticles.destroy();
    this.stormParticles.destroy();
    this.lightningGraphics.destroy();
    this.darkOverlay.destroy();
  }
}
