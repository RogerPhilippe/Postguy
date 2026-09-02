export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
  timestamp: Date;
}

export type LogLevel = 'info' | 'error' | 'warning' | 'success';

export interface ConsoleEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  details?: string;
  method?: string;
  url?: string;
  status?: number;
  time?: number;
}
