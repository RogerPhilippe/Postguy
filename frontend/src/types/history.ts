import { RequestConfig } from './request';
import { ResponseData } from './response';

export interface HistoryEntry {
  id: string;
  request: RequestConfig;
  response: ResponseData;
  timestamp: Date;
}
