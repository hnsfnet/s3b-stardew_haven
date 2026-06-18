import { Component } from '../Component';

export class SpriteComponent extends Component {
  readonly type = 'sprite';

  textureKey: string;
  sprite!: Phaser.GameObjects.Sprite;
  depth: number = 0;
  visible: boolean = true;
  flipX: boolean = false;
  scale: number = 1;
  alpha: number = 1;
  animation: string | null = null;
  scene: Phaser.Scene;
  private depthDirty: boolean = false;

  constructor(scene: Phaser.Scene, textureKey: string, x: number = 0, y: number = 0) {
    super();
    this.scene = scene;
    this.textureKey = textureKey;
    this.createSprite(x, y);
  }

  private createSprite(x: number, y: number): void {
    this.sprite = this.scene.add.sprite(x, y, this.textureKey);
    this.sprite.setDepth(this.depth);
  }

  setTexture(key: string): void {
    this.textureKey = key;
    if (this.sprite) {
      this.sprite.setTexture(key);
    }
  }

  setDepth(depth: number): void {
    this.depth = depth;
    this.depthDirty = true;
  }

  applyDepth(): void {
    if (this.depthDirty && this.sprite) {
      this.sprite.setDepth(this.depth);
      this.depthDirty = false;
    }
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.sprite) {
      this.sprite.setVisible(visible);
    }
  }

  setFlipX(flip: boolean): void {
    this.flipX = flip;
    if (this.sprite) {
      this.sprite.setFlipX(flip);
    }
  }

  setScale(scale: number): void {
    this.scale = scale;
    if (this.sprite) {
      this.sprite.setScale(scale);
    }
  }

  setAlpha(alpha: number): void {
    this.alpha = alpha;
    if (this.sprite) {
      this.sprite.setAlpha(alpha);
    }
  }

  playAnimation(key: string, ignoreIfPlaying: boolean = true): void {
    this.animation = key;
    if (this.sprite && this.sprite.anims) {
      this.sprite.anims.play(key, ignoreIfPlaying);
    }
  }

  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
