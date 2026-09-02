import { useCallback } from 'react';
import axios from 'axios';
import { useTabsStore } from '../store/tabsStore';
import { useHistoryStore } from '../store/historyStore';
import { useConsoleStore } from '../store/consoleStore';
import { useEnvironmentsStore } from '../store/environmentsStore';
import { ResponseData } from '../types/response';
import { RequestConfig } from '../types/request';
import { resolveVariables } from '../utils/resolveVariables';
import { useT } from '../i18n/useT';

interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

interface ProxyErrorResponse {
  error?: string;
  message?: string;
  time?: number;
}

export function useSendRequest(tabId: string) {
  const tab = useTabsStore((state) => state.tabs.find((t) => t.id === tabId));
  const setTabLoading = useTabsStore((state) => state.setTabLoading);
  const setTabResponse = useTabsStore((state) => state.setTabResponse);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  const addEntry = useConsoleStore((state) => state.addEntry);
  const activeVariables = useEnvironmentsStore(
    (state) => state.environments.find((e) => e.id === state.activeEnvironmentId)?.variables ?? []
  );
  const t = useT();

  const send = useCallback(async () => {
    if (!tab) return;
    const { request: original } = tab;

    if (!original.url || original.url.trim() === '') {
      addEntry({
        level: 'error',
        message: t('log.urlEmpty'),
        details: t('log.urlEmptyDetails'),
      });
      return;
    }

    const request: RequestConfig = {
      ...original,
      url: resolveVariables(original.url, activeVariables),
      params: original.params.map((p) => ({
        ...p,
        key: resolveVariables(p.key, activeVariables),
        value: resolveVariables(p.value, activeVariables),
      })),
      headers: original.headers.map((h) => ({
        ...h,
        key: resolveVariables(h.key, activeVariables),
        value: resolveVariables(h.value, activeVariables),
      })),
      body: resolveVariables(original.body, activeVariables),
    };

    setTabLoading(tabId, true);

    addEntry({
      level: 'info',
      message: t('log.sending', { method: request.method }),
      method: request.method,
      url: request.url,
    });

    const startTime = Date.now();

    try {
      const response = await axios.post<ProxyResponse>('/proxy', request, {
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response.data;
      const responseData: ResponseData = {
        status: data.status,
        statusText: data.statusText,
        headers: data.headers,
        body: data.body,
        time: data.time,
        size: data.size,
        timestamp: new Date(),
      };

      setTabResponse(tabId, responseData);
      addToHistory(request, responseData);

      const level =
        data.status >= 500
          ? 'error'
          : data.status >= 400
          ? 'warning'
          : data.status >= 300
          ? 'info'
          : 'success';

      addEntry({
        level,
        message: `${data.status} ${data.statusText}`,
        method: request.method,
        url: request.url,
        status: data.status,
        time: data.time,
        details: t('log.responseDetails', { time: data.time, size: data.size }),
      });
    } catch (error: unknown) {
      const elapsed = Date.now() - startTime;
      setTabLoading(tabId, false);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as ProxyErrorResponse | undefined;
        const errorMessage = responseData?.message || responseData?.error || error.message;

        addEntry({
          level: 'error',
          message: t('log.requestFailed', { message: errorMessage }),
          method: request.method,
          url: request.url,
          time: elapsed,
          details: error.stack,
        });
      } else if (error instanceof Error) {
        addEntry({
          level: 'error',
          message: t('log.requestFailed', { message: error.message }),
          method: request.method,
          url: request.url,
          time: elapsed,
          details: error.stack,
        });
      } else {
        addEntry({
          level: 'error',
          message: t('log.unknownError'),
          method: request.method,
          url: request.url,
          time: elapsed,
        });
      }
    }
  }, [tab, tabId, setTabLoading, setTabResponse, addToHistory, addEntry, activeVariables, t]);

  return {
    send,
    isLoading: tab?.isLoading ?? false,
  };
}
