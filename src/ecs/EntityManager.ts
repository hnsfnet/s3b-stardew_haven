import { Entity } from './Entity';
import { System } from './System';

export class EntityManager {
  private entities: Map<string, Entity> = new Map();
  private systems: System[] = [];
  private entityList: Entity[] = [];

  addEntity(entity: Entity): Entity {
    this.entities.set(entity.id, entity);
    this.entityList.push(entity);
    return entity;
  }

  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.destroy();
      this.entities.delete(id);
      const index = this.entityList.indexOf(entity);
      if (index > -1) {
        this.entityList.splice(index, 1);
      }
    }
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): Entity[] {
    return this.entityList;
  }

  getEntitiesWithComponents(componentTypes: string[]): Entity[] {
    return this.entityList.filter((entity) =>
      componentTypes.every((type) => entity.hasComponent(type))
    );
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  update(delta: number, ...args: unknown[]): void {
    for (const system of this.systems) {
      system.update(this.entityList, delta, ...args);
    }
  }

  destroy(): void {
    for (const entity of this.entityList) {
      entity.destroy();
    }
    this.entities.clear();
    this.entityList = [];
    this.systems = [];
  }
}
