export const PhaserMock = {
  Scene: class MockScene {
    scene = {
      launch: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      switch: jest.fn()
    };
    registry = new MockDataManager();
    events = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    };
    add = {
      text: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setColor: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        destroy: jest.fn(),
        x: 0,
        y: 0,
        width: 100,
        height: 20
      })),
      graphics: jest.fn(() => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillRoundedRect: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        strokeRoundedRect: jest.fn().mockReturnThis(),
        strokeRect: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        destroy: jest.fn(),
        alpha: 1
      })),
      sprite: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setTexture: jest.fn().mockReturnThis(),
        setFlipX: jest.fn().mockReturnThis(),
        setFlipY: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        anims: {
          play: jest.fn()
        },
        destroy: jest.fn(),
        x: 0,
        y: 0
      })),
      container: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        add: jest.fn().mockReturnThis(),
        destroy: jest.fn(),
        x: 0,
        y: 0,
        children: {
          each: jest.fn()
        }
      })),
      zone: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      })),
      particles: jest.fn(() => ({
        createEmitter: jest.fn()
      }))
    };
    physics = {
      add: {
        collider: jest.fn(),
        sprite: jest.fn(() => ({
          setCollideWorldBounds: jest.fn().mockReturnThis(),
          setBounce: jest.fn().mockReturnThis(),
          setImmovable: jest.fn().mockReturnThis(),
          body: {
            setSize: jest.fn()
          }
        })),
        staticGroup: jest.fn(() => ({
          create: jest.fn(),
          add: jest.fn(),
          clear: jest.fn(),
          getChildren: jest.fn(() => [])
        }))
      }
    };
    cameras = {
      main: {
        startFollow: jest.fn(),
        setBounds: jest.fn(),
        setZoom: jest.fn(),
        shake: jest.fn(),
        scrollX: 0,
        scrollY: 0
      }
    };
    tweens = {
      add: jest.fn()
    };
    time = {
      addEvent: jest.fn(),
      delayedCall: jest.fn()
    };
    input = {
      keyboard: {
        addKey: jest.fn(() => ({})),
        createCursorKeys: jest.fn(() => ({})),
        on: jest.fn()
      }
    };
    textures = {
      get: jest.fn(() => ({
        add: jest.fn()
      }))
    };
    Utils = {
      String: {
        UUID: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
      },
      Array: {
        Shuffle: <T>(arr: T[]): T[] => {
          const result = [...arr];
          for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
          }
          return result;
        }
      },
      Math: {
        Clamp: (value: number, min: number, max: number) =>
          Math.max(min, Math.min(max, value))
      }
    };
    Math: {
      Between: (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min,
      Distance: {
        Between: (x1: number, y1: number, x2: number, y2: number) =>
          Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      }
    };
    load = {
      on: jest.fn()
    };
    scale = {
      width: 800,
      height: 600
    };
    children = {
      each: jest.fn()
    };
  },
  GameObjects: {
    Sprite: class MockSprite {},
    Graphics: class MockGraphics {},
    Container: class MockContainer {},
    Text: class MockText {}
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        W: 1,
        A: 2,
        S: 3,
        D: 4,
        SPACE: 5,
        E: 6,
        I: 7,
        ESC: 8
      }
    }
  },
  Data: {
    DataManager: class MockDataManager {
      private data: Record<string, unknown> = {};

      has(key: string): boolean {
        return key in this.data;
      }

      get(key: string): unknown {
        return this.data[key];
      }

      set(key: string, value: unknown): void {
        this.data[key] = value;
      }
    }
  }
};

class MockDataManager {
  private data: Record<string, unknown> = {};

  has(key: string): boolean {
    return key in this.data;
  }

  get(key: string): unknown {
    return this.data[key];
  }

  set(key: string, value: unknown): void {
    this.data[key] = value;
  }

  destroy(): void {
    this.data = {};
  }
}

export default PhaserMock;
