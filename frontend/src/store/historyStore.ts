import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { HistoryEntry } from '../types/history';
import { RequestConfig } from '../types/request';
import { ResponseData } from '../types/response';
import { v4 as uuidv4 } from 'uuid';

const MAX_HISTORY = 100;

interface HistoryState {
  history: HistoryEntry[];
  addToHistory: (request: RequestConfig, response: ResponseData) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    immer((set) => ({
      history: [],

      addToHistory: (request: RequestConfig, response: ResponseData) =>
        set((state) => {
          const entry: HistoryEntry = {
            id: uuidv4(),
            request: { ...request },
            response: { ...response },
            timestamp: new Date(),
          };
          state.history.unshift(entry);
          if (state.history.length > MAX_HISTORY) {
            state.history = state.history.slice(0, MAX_HISTORY);
          }
        }),

      clearHistory: () =>
        set((state) => {
          state.history = [];
        }),

      removeFromHistory: (id: string) =>
        set((state) => {
          const index = state.history.findIndex((e) => e.id === id);
          if (index !== -1) {
            state.history.splice(index, 1);
          }
        }),
    })),
    {
      name: 'postguy-history',
      // Convert dates back from JSON
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.history = state.history.map((entry) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
            response: {
              ...entry.response,
              timestamp: new Date(entry.response.timestamp),
            },
          }));
        }
      },
    }
  )
);
