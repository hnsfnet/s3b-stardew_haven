import { System } from '../System';
import { Entity } from '../Entity';
import { PositionComponent } from '../components/PositionComponent';

export class MoveSystem extends System {
  readonly requiredComponents = ['position'];

  private speedMultiplier: number = 1;

  setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  protected updateEntity(entity: Entity, delta: number): void {
    const pos = entity.getComponent<PositionComponent>('position');
    if (!pos) return;

    const speed = this.speedMultiplier;
    pos.x += pos.vx * speed * (delta / 1000);
    pos.y += pos.vy * speed * (delta / 1000);
  }
}
