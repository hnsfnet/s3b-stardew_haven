import Phaser from 'phaser';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface DirectionInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private direction: Direction = 'down';
  private isMoving: boolean = false;
  private moveSpeed: number = 150;
  private mapBounds: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, mapBounds: Phaser.Geom.Rectangle) {
    super(scene, x, y, 'player');
    this.mapBounds = mapBounds;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.body?.setSize(20, 20);
    this.body?.setOffset(6, 12);

    this.createAnimations();
    this.anims.play('player_idle_down');
  }

  private createAnimations(): void {
    const frameRate = 8;

    this.scene.anims.create({
      key: 'player_idle_down',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'player_idle_up',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 2, end: 2 }),
      frameRate: 1,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'player_idle_left',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 4 }),
      frameRate: 1,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'player_idle_right',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 6, end: 6 }),
      frameRate: 1,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'player_walk_down',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
      frameRate: frameRate,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'player_walk_up',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 2, end: 3 }),
      frameRate: frameRate,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'player_walk_left',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 5 }),
      frameRate: frameRate,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'player_walk_right',
      frames: this.scene.anims.generateFrameNumbers('player', { start: 6, end: 7 }),
      frameRate: frameRate,
      repeat: -1
    });
  }

  update(input: DirectionInput, speedMultiplier: number = 1): void {
    if (!this.body) return;

    const speed = this.moveSpeed * speedMultiplier;

    let velocityX = 0;
    let velocityY = 0;

    if (input.left) {
      velocityX = -speed;
      this.direction = 'left';
    } else if (input.right) {
      velocityX = speed;
      this.direction = 'right';
    }

    if (input.up) {
      velocityY = -speed;
      this.direction = 'up';
    } else if (input.down) {
      velocityY = speed;
      this.direction = 'down';
    }

    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.setVelocity(velocityX, velocityY);

    this.isMoving = velocityX !== 0 || velocityY !== 0;

    if (this.isMoving) {
      this.anims.play(`player_walk_${this.direction}`, true);
    } else {
      this.anims.play(`player_idle_${this.direction}`, true);
    }

    this.clampToMapBounds();
  }

  private clampToMapBounds(): void {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    this.x = Phaser.Math.Clamp(
      this.x,
      this.mapBounds.x + halfWidth,
      this.mapBounds.x + this.mapBounds.width - halfWidth
    );
    this.y = Phaser.Math.Clamp(
      this.y,
      this.mapBounds.y + halfHeight,
      this.mapBounds.y + this.mapBounds.height - halfHeight
    );

    if (this.body) {
      this.body.position.x = this.x - this.body.offset.x;
      this.body.position.y = this.y - this.body.offset.y;
    }
  }

  getDirection(): Direction {
    return this.direction;
  }

  getFacingTilePosition(tileSize: number): { x: number; y: number } {
    let offsetX = 0;
    let offsetY = 0;

    switch (this.direction) {
      case 'up':
        offsetY = -tileSize;
        break;
      case 'down':
        offsetY = tileSize;
        break;
      case 'left':
        offsetX = -tileSize;
        break;
      case 'right':
        offsetX = tileSize;
        break;
    }

    const tileX = Math.floor((this.x + offsetX) / tileSize);
    const tileY = Math.floor((this.y + offsetY + this.height / 2) / tileSize);

    return { x: tileX, y: tileY };
  }

  isPlayerMoving(): boolean {
    return this.isMoving;
  }
}
