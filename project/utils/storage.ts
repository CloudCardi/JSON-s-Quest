import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PLAYER_DATA: '@json_quest_player_data',
};

export interface PlayerData {
  currentLevel: number;
  totalXP: number;
  levelsCompleted: number;
  achievements: string[];
  character: 'wizard' | 'spy';
  lastPlayed: number;
  createdAt: number;
}

const DEFAULT_PLAYER_DATA: PlayerData = {
  currentLevel: 1,
  totalXP: 0,
  levelsCompleted: 0,
  achievements: [],
  character: 'wizard',
  lastPlayed: Date.now(),
  createdAt: Date.now(),
};

// Cache for player data to reduce AsyncStorage calls
let playerDataCache: PlayerData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds

export class GameStorage {
  static async getPlayerData(): Promise<PlayerData> {
    try {
      // Return cached data if it's still fresh
      const now = Date.now();
      if (playerDataCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return playerDataCache;
      }

      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
      if (data) {
        const parsedData = JSON.parse(data);
        // Ensure all required fields exist and validate data
        const validatedData = { 
          ...DEFAULT_PLAYER_DATA, 
          ...parsedData,
          // Ensure currentLevel is never higher than levelsCompleted + 1
          currentLevel: Math.min(parsedData.currentLevel || 1, (parsedData.levelsCompleted || 0) + 1)
        };
        
        // Update cache
        playerDataCache = validatedData;
        cacheTimestamp = now;
        
        return validatedData;
      }
      
      // First time player - save default data
      await this.savePlayerData(DEFAULT_PLAYER_DATA);
      playerDataCache = DEFAULT_PLAYER_DATA;
      cacheTimestamp = now;
      
      return DEFAULT_PLAYER_DATA;
    } catch (error) {
      console.error('Error getting player data:', error);
      return DEFAULT_PLAYER_DATA;
    }
  }

  static async savePlayerData(data: Partial<PlayerData>): Promise<void> {
    try {
      const currentData = playerDataCache || await this.getPlayerData();
      const updatedData = { 
        ...currentData, 
        ...data,
        lastPlayed: Date.now()
      };
      
      // Validate data consistency
      updatedData.currentLevel = Math.max(1, Math.min(updatedData.currentLevel, 1000));
      updatedData.levelsCompleted = Math.max(0, Math.min(updatedData.levelsCompleted, 1000));
      updatedData.totalXP = Math.max(0, updatedData.totalXP);
      
      // Update cache immediately for instant UI updates
      playerDataCache = updatedData;
      cacheTimestamp = Date.now();
      
      // Save to AsyncStorage asynchronously
      AsyncStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving player data:', error);
    }
  }

  static async resetProgress(): Promise<void> {
    try {
      const currentData = playerDataCache || await this.getPlayerData();
      const resetData: PlayerData = {
        ...DEFAULT_PLAYER_DATA,
        character: currentData.character, // Keep character preference
        createdAt: currentData.createdAt, // Keep original creation date
      };
      
      // Update cache immediately
      playerDataCache = resetData;
      cacheTimestamp = Date.now();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(resetData));
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }

  static async addAchievement(achievementId: string): Promise<void> {
    try {
      const data = await this.getPlayerData();
      if (!data.achievements.includes(achievementId)) {
        data.achievements.push(achievementId);
        await this.savePlayerData({ achievements: data.achievements });
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  }

  static async updateLevel(level: number, xpGained: number = 0): Promise<void> {
    try {
      const data = await this.getPlayerData();
      const updatedData = {
        currentLevel: Math.max(level, data.currentLevel),
        totalXP: data.totalXP + xpGained,
        levelsCompleted: Math.max(level - 1, data.levelsCompleted),
        lastPlayed: Date.now(),
      };
      await this.savePlayerData(updatedData);
    } catch (error) {
      console.error('Error updating level:', error);
    }
  }

  static async exportData(): Promise<string> {
    try {
      const data = await this.getPlayerData();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '{}';
    }
  }

  static async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      // Validate imported data
      const validatedData = {
        ...DEFAULT_PLAYER_DATA,
        ...data,
        currentLevel: Math.max(1, Math.min(data.currentLevel || 1, 1000)),
        levelsCompleted: Math.max(0, Math.min(data.levelsCompleted || 0, 1000)),
        totalXP: Math.max(0, data.totalXP || 0),
      };
      await this.savePlayerData(validatedData);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  static async unlockLevel(level: number): Promise<void> {
    try {
      const data = await this.getPlayerData();
      if (level <= data.levelsCompleted + 1) {
        await this.savePlayerData({ 
          currentLevel: level,
          levelsCompleted: Math.max(data.levelsCompleted, level - 1)
        });
      }
    } catch (error) {
      console.error('Error unlocking level:', error);
    }
  }

  // Clear cache when needed
  static clearCache(): void {
    playerDataCache = null;
    cacheTimestamp = 0;
  }
}