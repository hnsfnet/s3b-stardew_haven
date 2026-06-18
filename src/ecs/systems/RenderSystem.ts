import { System } from '../System';
import { Entity } from '../Entity';
import { PositionComponent } from '../components/PositionComponent';
import { SpriteComponent } from '../components/SpriteComponent';

export class RenderSystem extends System {
  readonly requiredComponents = ['position', 'sprite'];

  private depthCalculators: Map<string, (entity: Entity) => number> = new Map();

  registerDepthCalculator(entityType: string, calc: (entity: Entity) => number): void {
    this.depthCalculators.set(entityType, calc);
  }

  protected updateEntity(entity: Entity, _delta: number): void {
    const pos = entity.getComponent<PositionComponent>('position');
    const sprite = entity.getComponent<SpriteComponent>('sprite');

    if (!pos || !sprite) return;

    sprite.sprite.x = pos.x;
    sprite.sprite.y = pos.y;
    sprite.applyDepth();
  }

  updateDepths(entities: Entity[]): void {
    for (const entity of entities) {
      if (!this.hasRequiredComponents(entity)) continue;

      const sprite = entity.getComponent<SpriteComponent>('sprite');
      const pos = entity.getComponent<PositionComponent>('position');
      if (sprite && pos) {
        const depth = Math.floor(pos.y / 32) + 10;
        sprite.setDepth(depth);
      }
    }
  }
}
