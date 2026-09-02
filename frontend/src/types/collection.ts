import { RequestConfig } from './request';

export interface CollectionItem {
  id: string;
  name: string;
  request: RequestConfig;
  savedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
}
