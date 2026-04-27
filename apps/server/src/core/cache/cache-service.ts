import NodeCache from 'node-cache';
import logger from '../logger';

// Default cache TTL: 1 hour (in seconds)
const DEFAULT_TTL = 60 * 60;

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: DEFAULT_TTL,
      checkperiod: 120, // Check for expired keys every 2 minutes
    });
    
    logger.info('Cache service initialized');
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): boolean {
    try {
      return this.cache.set(key, value, ttl);
    } catch (error) {
      logger.error(`Error setting cache value for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | undefined {
    try {
      return this.cache.get<T>(key);
    } catch (error) {
      logger.error(`Error getting cache value for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Delete a value from the cache
   */
  delete(key: string): number {
    try {
      return this.cache.del(key);
    } catch (error) {
      logger.error(`Error deleting cache value for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    try {
      this.cache.flushAll();
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }
}

// Export a singleton instance
export default new CacheService(); 