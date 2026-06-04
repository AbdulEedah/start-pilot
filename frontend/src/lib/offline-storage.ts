/**
 * Offline Storage System
 * Handles local data persistence for offline functionality
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  subscription: 'free' | 'pro' | 'enterprise';
  onboardingCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  metadata?: {
    type?: 'idea' | 'validation' | 'roadmap' | 'pitch' | 'general';
    confidence?: number;
    sources?: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  type: 'idea' | 'validation' | 'roadmap' | 'pitch' | 'general';
}

export interface StartupIdea {
  id: string;
  title: string;
  description: string;
  sector: string;
  stage: 'idea' | 'validation' | 'mvp' | 'growth' | 'scale';
  validationScore: number;
  marketSize: string;
  competition: string[];
  techStack: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: 'product' | 'marketing' | 'funding' | 'team' | 'legal';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  status: 'pending' | 'in-progress' | 'completed';
  dependencies: string[];
}

export interface Roadmap {
  id: string;
  startupId: string;
  title: string;
  items: RoadmapItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PitchAnalysis {
  id: string;
  startupId: string;
  content: string;
  scores: {
    clarity: number;
    marketOpportunity: number;
    businessModel: number;
    traction: number;
    team: number;
    financials: number;
    overall: number;
  };
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  createdAt: string;
}

class OfflineStorage {
  private dbName = 'StartPilotDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chatSessions')) {
          db.createObjectStore('chatSessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('startupIdeas')) {
          db.createObjectStore('startupIdeas', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('roadmaps')) {
          db.createObjectStore('roadmaps', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pitchAnalyses')) {
          db.createObjectStore('pitchAnalyses', { keyPath: 'id' });
        }
      };
    });
  }

  // Generic CRUD operations
  async save<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Local Storage helpers for simple data
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Authentication helpers
  setCurrentUser(user: User): void {
    this.setItem('currentUser', user);
  }

  getCurrentUser(): User | null {
    return this.getItem<User>('currentUser');
  }

  clearCurrentUser(): void {
    this.removeItem('currentUser');
  }

  setAuthToken(token: string): void {
    this.setItem('authToken', token);
  }

  getAuthToken(): string | null {
    return this.getItem<string>('authToken');
  }

  clearAuthToken(): void {
    this.removeItem('authToken');
  }
}

export const offlineStorage = new OfflineStorage();