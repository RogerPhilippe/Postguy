import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ConsoleEntry } from '../types/response';
import { v4 as uuidv4 } from 'uuid';

const MAX_ENTRIES = 200;

interface ConsoleState {
  entries: ConsoleEntry[];
  addEntry: (entry: Omit<ConsoleEntry, 'id' | 'timestamp'>) => void;
  clearConsole: () => void;
}

export const useConsoleStore = create<ConsoleState>()(
  immer((set) => ({
    entries: [],

    addEntry: (entry) =>
      set((state) => {
        const newEntry: ConsoleEntry = {
          ...entry,
          id: uuidv4(),
          timestamp: new Date(),
        };
        state.entries.unshift(newEntry);
        if (state.entries.length > MAX_ENTRIES) {
          state.entries = state.entries.slice(0, MAX_ENTRIES);
        }
      }),

    clearConsole: () =>
      set((state) => {
        state.entries = [];
      }),
  }))
);
