import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Collection, CollectionItem } from '../types/collection';
import { RequestConfig } from '../types/request';

interface CollectionsState {
  collections: Collection[];
  createCollection: (name: string) => string;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  addItem: (collectionId: string, name: string, request: RequestConfig) => void;
  removeItem: (collectionId: string, itemId: string) => void;
  importCollection: (data: unknown) => boolean;
}

function isRequestConfig(value: unknown): value is RequestConfig {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return typeof r.method === 'string' && typeof r.url === 'string';
}

function parseImportedItem(value: unknown): Omit<CollectionItem, 'id'> | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (!isRequestConfig(raw.request)) return null;
  const savedAt = typeof raw.savedAt === 'string' || raw.savedAt instanceof Date ? new Date(raw.savedAt as string) : new Date();
  return {
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : raw.request.url,
    request: raw.request,
    savedAt,
  };
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    immer((set) => ({
      collections: [],

      createCollection: (name: string) => {
        const id = uuidv4();
        set((state) => {
          state.collections.push({ id, name: name.trim() || 'Untitled collection', items: [] });
        });
        return id;
      },

      renameCollection: (id: string, name: string) =>
        set((state) => {
          const collection = state.collections.find((c) => c.id === id);
          if (collection && name.trim()) {
            collection.name = name.trim();
          }
        }),

      deleteCollection: (id: string) =>
        set((state) => {
          state.collections = state.collections.filter((c) => c.id !== id);
        }),

      addItem: (collectionId: string, name: string, request: RequestConfig) =>
        set((state) => {
          const collection = state.collections.find((c) => c.id === collectionId);
          if (!collection) return;
          const item: CollectionItem = {
            id: uuidv4(),
            name: name.trim() || request.url || 'Untitled request',
            request: { ...request },
            savedAt: new Date(),
          };
          collection.items.unshift(item);
        }),

      removeItem: (collectionId: string, itemId: string) =>
        set((state) => {
          const collection = state.collections.find((c) => c.id === collectionId);
          if (!collection) return;
          collection.items = collection.items.filter((i) => i.id !== itemId);
        }),

      importCollection: (data: unknown) => {
        if (!data || typeof data !== 'object') return false;
        const raw = data as Record<string, unknown>;
        if (typeof raw.name !== 'string' || !Array.isArray(raw.items)) return false;
        const rawName = raw.name;

        const items = raw.items
          .map(parseImportedItem)
          .filter((item): item is Omit<CollectionItem, 'id'> => item !== null)
          .map((item) => ({ ...item, id: uuidv4() }));

        set((state) => {
          const baseName = rawName.trim() || 'Untitled collection';
          const existingNames = new Set(state.collections.map((c) => c.name));
          let name = baseName;
          let suffix = 2;
          while (existingNames.has(name)) {
            name = `${baseName} (${suffix})`;
            suffix += 1;
          }
          state.collections.push({ id: uuidv4(), name, items });
        });
        return true;
      },
    })),
    {
      name: 'postguy-collections',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.collections = state.collections.map((c) => ({
            ...c,
            items: c.items.map((i) => ({ ...i, savedAt: new Date(i.savedAt) })),
          }));
        }
      },
    }
  )
);
