import { RequestConfig } from './request';
import { ResponseData } from './response';

export interface Tab {
  id: string;
  label: string;
  request: RequestConfig;
  response: ResponseData | null;
  isLoading: boolean;
}
