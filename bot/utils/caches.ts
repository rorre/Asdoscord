import LRUCache from "lru-native2";

export const usernameCache = new LRUCache<string>({
  size: 500,
  maxElements: 1000,
  maxLoadFactor: 2.0,
});
