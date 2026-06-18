import { Component } from '../Component';

export class StateComponent extends Component {
  readonly type = 'state';

  private values: Map<string, number | string | boolean> = new Map();

  set(key: string, value: number | string | boolean): void {
    this.values.set(key, value);
  }

  get<T = number | string | boolean>(key: string, defaultValue?: T): T {
    const value = this.values.get(key);
    return (value !== undefined ? value : defaultValue) as T;
  }

  getNumber(key: string, defaultValue: number = 0): number {
    const value = this.values.get(key);
    return typeof value === 'number' ? value : defaultValue;
  }

  getString(key: string, defaultValue: string = ''): string {
    const value = this.values.get(key);
    return typeof value === 'string' ? value : defaultValue;
  }

  getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = this.values.get(key);
    return typeof value === 'boolean' ? value : defaultValue;
  }

  increment(key: string, amount: number = 1): number {
    const current = this.getNumber(key, 0);
    const newValue = current + amount;
    this.values.set(key, newValue);
    return newValue;
  }

  decrement(key: string, amount: number = 1): number {
    const current = this.getNumber(key, 0);
    const newValue = current - amount;
    this.values.set(key, newValue);
    return newValue;
  }

  clamp(key: string, min: number, max: number): number {
    const value = this.getNumber(key, 0);
    const clamped = Phaser.Math.Clamp(value, min, max);
    this.values.set(key, clamped);
    return clamped;
  }

  has(key: string): boolean {
    return this.values.has(key);
  }

  getAll(): Record<string, number | string | boolean> {
    const result: Record<string, number | string | boolean> = {};
    this.values.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  loadFromObject(data: Record<string, number | string | boolean>): void {
    for (const [key, value] of Object.entries(data)) {
      this.values.set(key, value);
    }
  }
}
