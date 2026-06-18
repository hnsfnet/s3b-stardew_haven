import { Entity } from './Entity';

export abstract class System {
  abstract readonly requiredComponents: string[];

  update(entities: Entity[], delta: number, ...args: unknown[]): void {
    for (const entity of entities) {
      if (this.hasRequiredComponents(entity)) {
        this.updateEntity(entity, delta, ...args);
      }
    }
  }

  protected hasRequiredComponents(entity: Entity): boolean {
    return this.requiredComponents.every((type) => entity.hasComponent(type));
  }

  protected abstract updateEntity(entity: Entity, delta: number, ...args: unknown[]): void;
}
