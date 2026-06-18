import { Component } from './Component';

export class Entity {
  readonly id: string;
  private components: Map<string, Component> = new Map();

  constructor(id?: string) {
    this.id = id || Phaser.Utils.String.UUID();
  }

  addComponent<T extends Component>(component: T): T {
    component.entityId = this.id;
    this.components.set(component.type, component);
    return component;
  }

  getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T;
  }

  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  removeComponent(type: string): void {
    this.components.delete(type);
  }

  getAllComponents(): Component[] {
    return Array.from(this.components.values());
  }

  destroy(): void {
    this.components.clear();
  }
}
