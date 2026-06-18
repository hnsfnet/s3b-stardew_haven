import { System } from '../System';
import { Entity } from '../Entity';
import { PositionComponent } from '../components/PositionComponent';
import { FollowComponent } from '../components/FollowComponent';
import { SpriteComponent } from '../components/SpriteComponent';

export class FollowSystem extends System {
  readonly requiredComponents = ['position', 'follow'];

  private entityMap: Map<string, Entity> = new Map();
  private updateAccumulator: number = 0;
  private updateInterval: number = 200;

  setEntityMap(entities: Entity[]): void {
    this.entityMap.clear();
    for (const entity of entities) {
      this.entityMap.set(entity.id, entity);
    }
  }

  update(entities: Entity[], delta: number, ...args: unknown[]): void {
    this.updateAccumulator += delta;

    if (this.updateAccumulator >= this.updateInterval) {
      this.updateAccumulator = 0;
      this.updateTargets(entities);
    }

    for (const entity of entities) {
      if (this.hasRequiredComponents(entity)) {
        this.updateEntity(entity, delta, ...args);
      }
    }
  }

  private updateTargets(entities: Entity[]): void {
    for (const entity of entities) {
      if (!this.hasRequiredComponents(entity)) continue;

      const follow = entity.getComponent<FollowComponent>('follow');
      const pos = entity.getComponent<PositionComponent>('position');
      const sprite = entity.getComponent<SpriteComponent>('sprite');
      const target = this.entityMap.get(follow.targetEntityId);

      if (!follow || !pos || !target) continue;

      const targetPos = target.getComponent<PositionComponent>('position');
      if (!targetPos) continue;

      if (follow.isPaused) {
        follow.pauseTimer -= this.updateInterval;
        if (follow.pauseTimer <= 0) {
          follow.isPaused = false;
          follow.randomizeOffset();
        }
        continue;
      }

      if (Math.random() < 0.02) {
        follow.isPaused = true;
        follow.pauseTimer = 1000 + Math.random() * 2000;
        continue;
      }

      const idealX = targetPos.x + follow.offsetX;
      const idealY = targetPos.y + follow.offsetY;

      const dx = idealX - pos.x;
      const dy = idealY - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > follow.minDistance) {
        pos.vx = (dx / distance) * follow.followSpeed;
        pos.vy = (dy / distance) * follow.followSpeed;

        if (sprite && dx !== 0) {
          sprite.setFlipX(dx < 0);
        }
      } else {
        pos.vx = 0;
        pos.vy = 0;
      }

      if (distance > follow.maxDistance) {
        pos.x = idealX;
        pos.y = idealY;
        follow.randomizeOffset();
      }
    }
  }

  protected updateEntity(entity: Entity, delta: number): void {
    const pos = entity.getComponent<PositionComponent>('position');
    const follow = entity.getComponent<FollowComponent>('follow');

    if (!pos || !follow) return;

    pos.x += pos.vx * (delta / 1000);
    pos.y += pos.vy * (delta / 1000);
  }
}
