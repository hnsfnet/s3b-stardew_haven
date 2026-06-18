import { Component } from '../Component';

export class FollowComponent extends Component {
  readonly type = 'follow';

  targetEntityId: string;
  offsetX: number = 0;
  offsetY: number = 0;
  followSpeed: number = 100;
  minDistance: number = 5;
  maxDistance: number = 200;
  pauseTimer: number = 0;
  isPaused: boolean = false;

  constructor(targetEntityId: string) {
    super();
    this.targetEntityId = targetEntityId;
    this.randomizeOffset();
  }

  randomizeOffset(minDist: number = 30, maxDist: number = 60): void {
    const angle = Math.random() * Math.PI * 2;
    const distance = minDist + Math.random() * (maxDist - minDist);
    this.offsetX = Math.cos(angle) * distance;
    this.offsetY = Math.sin(angle) * distance;
  }
}
