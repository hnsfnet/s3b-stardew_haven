import { Component } from '../Component';

export class PositionComponent extends Component {
  readonly type = 'position';

  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;

  constructor(x: number = 0, y: number = 0) {
    super();
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  distanceTo(other: PositionComponent): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
