import type { Pet, PetType } from '../types';
import { ConfigLoader, PetConfig } from '../config/ConfigLoader';

export class PetLogic {
  static create(type: PetType, currentDay: number, name?: string): Pet {
    const config = ConfigLoader.getInstance().getPet(type);
    const petName = name || this.getRandomName(type);

    return {
      id: 'pet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      type,
      name: petName,
      mood: 80,
      hunger: 100,
      isFollowing: true,
      helpedToday: false,
      lastFedDay: currentDay
    };
  }

  static getRandomName(type: PetType): string {
    const config = ConfigLoader.getInstance().getPet(type);
    if (config && config.names.length > 0) {
      const index = Math.floor(Math.random() * config.names.length);
      return config.names[index];
    }
    return '小伙伴';
  }

  static getConfig(pet: Pet): PetConfig | undefined {
    return ConfigLoader.getInstance().getPet(pet.type);
  }

  static feed(pet: Pet, currentDay: number): Pet {
    const config = this.getConfig(pet);
    const hungerRestore = config?.feedHungerRestore || 40;
    const moodBoost = config?.feedMoodBoost || 10;

    return {
      ...pet,
      hunger: Math.min(100, pet.hunger + hungerRestore),
      mood: Math.min(100, pet.mood + moodBoost),
      isFollowing: true,
      lastFedDay: currentDay
    };
  }

  static advanceDay(pet: Pet): Pet {
    const config = this.getConfig(pet);
    const hungerDecay = config?.hungerDecayPerDay || 30;
    const moodDecay = config?.moodDecayPerDay || 5;

    const newHunger = Math.max(0, pet.hunger - hungerDecay);
    let newMood = pet.mood;
    let isFollowing = pet.isFollowing;

    if (newHunger <= 0) {
      isFollowing = false;
      newMood = Math.max(0, newMood - (moodDecay + 15));
    } else {
      newMood = Math.min(100, newMood + 5);
    }

    return {
      ...pet,
      hunger: newHunger,
      mood: newMood,
      isFollowing,
      helpedToday: false
    };
  }

  static shouldHelpTill(pet: Pet): boolean {
    const config = this.getConfig(pet);
    if (!config) return false;
    if (pet.helpedToday) return false;
    if (pet.mood < config.helpTillMoodThreshold) return false;
    if (pet.hunger < config.helpTillHungerThreshold) return false;
    return Math.random() < config.helpTillChance;
  }

  static shouldHelpTillDeterministic(pet: Pet, testValue: number): boolean {
    const config = this.getConfig(pet);
    if (!config) return false;
    if (pet.helpedToday) return false;
    if (pet.mood < config.helpTillMoodThreshold) return false;
    if (pet.hunger < config.helpTillHungerThreshold) return false;
    return testValue < config.helpTillChance;
  }

  static getHungerStatus(pet: Pet): 'full' | 'hungry' | 'starving' {
    if (pet.hunger >= 70) return 'full';
    if (pet.hunger >= 30) return 'hungry';
    return 'starving';
  }

  static getMoodStatus(pet: Pet): 'happy' | 'neutral' | 'sad' {
    if (pet.mood >= 70) return 'happy';
    if (pet.mood >= 30) return 'neutral';
    return 'sad';
  }

  static getDaysSinceFed(pet: Pet, currentDay: number): number {
    return currentDay - pet.lastFedDay;
  }

  static getPetByType(pets: Pet[], type: PetType): Pet | undefined {
    return pets.find((p) => p.type === type);
  }

  static hasPetType(pets: Pet[], type: PetType): boolean {
    return pets.some((p) => p.type === type);
  }

  static findNearestPet(
    pets: Pet[],
    playerX: number,
    playerY: number,
    getPosition: (pet: Pet) => { x: number; y: number },
    maxDistance: number = 80
  ): Pet | null {
    let nearest: Pet | null = null;
    let nearestDist = Infinity;

    for (const pet of pets) {
      const pos = getPosition(pet);
      const dx = pos.x - playerX;
      const dy = pos.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= maxDistance && distance < nearestDist) {
        nearestDist = distance;
        nearest = pet;
      }
    }

    return nearest;
  }
}
