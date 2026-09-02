import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { Tab } from '../types/tab';
import { RequestConfig, HttpMethod } from '../types/request';
import { ResponseData } from '../types/response';

function createDefaultTab(): Tab {
  return {
    id: uuidv4(),
    label: 'New Request',
    request: {
      method: 'GET' as HttpMethod,
      url: '',
      params: [],
      headers: [],
      bodyType: 'none',
      body: '',
    },
    response: null,
    isLoading: false,
  };
}

function getLabelFromUrl(url: string): string {
  if (!url || url.trim() === '') return 'New Request';
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    if (path && path !== '/') {
      const parts = path.split('/').filter(Boolean);
      return parts[parts.length - 1] || parsed.hostname;
    }
    return parsed.hostname;
  } catch {
    // Not a valid URL yet, try to extract something meaningful
    const trimmed = url.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/').filter(Boolean);
      return parts[parts.length - 1] || trimmed;
    }
    return trimmed.slice(0, 30) || 'New Request';
  }
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string;
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabRequest: (id: string, request: Partial<RequestConfig>) => void;
  setTabResponse: (id: string, response: ResponseData) => void;
  setTabLoading: (id: string, isLoading: boolean) => void;
}

const initialTab = createDefaultTab();

export const useTabsStore = create<TabsState>()(
  immer((set) => ({
    tabs: [initialTab],
    activeTabId: initialTab.id,

    addTab: () =>
      set((state) => {
        const newTab = createDefaultTab();
        state.tabs.unshift(newTab);
        state.activeTabId = newTab.id;
      }),

    closeTab: (id: string) =>
      set((state) => {
        const index = state.tabs.findIndex((t) => t.id === id);
        if (index === -1) return;

        if (state.tabs.length === 1) {
          // Replace with new empty tab rather than removing
          const newTab = createDefaultTab();
          state.tabs = [newTab];
          state.activeTabId = newTab.id;
          return;
        }

        state.tabs.splice(index, 1);

        if (state.activeTabId === id) {
          const newIndex = Math.min(index, state.tabs.length - 1);
          state.activeTabId = state.tabs[newIndex].id;
        }
      }),

    setActiveTab: (id: string) =>
      set((state) => {
        state.activeTabId = id;
      }),

    updateTabRequest: (id: string, request: Partial<RequestConfig>) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === id);
        if (!tab) return;
        Object.assign(tab.request, request);
        // Update label based on URL
        if (request.url !== undefined) {
          tab.label = getLabelFromUrl(request.url);
        }
      }),

    setTabResponse: (id: string, response: ResponseData) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === id);
        if (!tab) return;
        tab.response = response;
        tab.isLoading = false;
      }),

    setTabLoading: (id: string, isLoading: boolean) =>
      set((state) => {
        const tab = state.tabs.find((t) => t.id === id);
        if (!tab) return;
        tab.isLoading = isLoading;
      }),
  }))
);
