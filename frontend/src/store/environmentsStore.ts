import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Environment } from '../types/environment';
import { KeyValuePair } from '../types/request';

interface EnvironmentsState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  createEnvironment: (name: string) => string;
  renameEnvironment: (id: string, name: string) => void;
  deleteEnvironment: (id: string) => void;
  setVariables: (id: string, variables: KeyValuePair[]) => void;
  setActiveEnvironment: (id: string | null) => void;
  importEnvironment: (data: unknown) => boolean;
}

function parseImportedVariable(value: unknown): KeyValuePair | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.key !== 'string') return null;
  return {
    id: uuidv4(),
    key: raw.key,
    value: typeof raw.value === 'string' ? raw.value : '',
    enabled: raw.enabled !== false,
  };
}

export const useEnvironmentsStore = create<EnvironmentsState>()(
  persist(
    immer((set) => ({
      environments: [],
      activeEnvironmentId: null,

      createEnvironment: (name: string) => {
        const id = uuidv4();
        set((state) => {
          state.environments.push({ id, name: name.trim() || 'Untitled environment', variables: [] });
        });
        return id;
      },

      renameEnvironment: (id: string, name: string) =>
        set((state) => {
          const env = state.environments.find((e) => e.id === id);
          if (env && name.trim()) {
            env.name = name.trim();
          }
        }),

      deleteEnvironment: (id: string) =>
        set((state) => {
          state.environments = state.environments.filter((e) => e.id !== id);
          if (state.activeEnvironmentId === id) {
            state.activeEnvironmentId = null;
          }
        }),

      setVariables: (id: string, variables: KeyValuePair[]) =>
        set((state) => {
          const env = state.environments.find((e) => e.id === id);
          if (env) {
            env.variables = variables;
          }
        }),

      setActiveEnvironment: (id: string | null) =>
        set((state) => {
          state.activeEnvironmentId = id;
        }),

      importEnvironment: (data: unknown) => {
        if (!data || typeof data !== 'object') return false;
        const raw = data as Record<string, unknown>;
        if (typeof raw.name !== 'string' || !Array.isArray(raw.variables)) return false;
        const rawName = raw.name;

        const variables = raw.variables
          .map(parseImportedVariable)
          .filter((v): v is KeyValuePair => v !== null);

        set((state) => {
          const baseName = rawName.trim() || 'Untitled environment';
          const existingNames = new Set(state.environments.map((e) => e.name));
          let name = baseName;
          let suffix = 2;
          while (existingNames.has(name)) {
            name = `${baseName} (${suffix})`;
            suffix += 1;
          }
          state.environments.push({ id: uuidv4(), name, variables });
        });
        return true;
      },
    })),
    {
      name: 'postguy-environments',
    }
  )
);
