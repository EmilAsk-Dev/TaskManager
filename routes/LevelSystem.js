export class LevelSystem {
    constructor() {
        this.level = 1; // Initial level
        this.xp = 0; // Initial XP
        this.xpToNextLevel = 100; // XP required for the next level
    }

    addXP(amount) {
        this.xp += amount;

        // Check for level-up
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel; // Deduct XP required for the current level
            this.level++; // Increase the level
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.2); // Scale up XP for the next level
        }1

        return this.getProgress();
    }

    getProgress() {
        return {
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
        };
    }
}
