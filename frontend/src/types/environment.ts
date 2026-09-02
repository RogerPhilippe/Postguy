import { KeyValuePair } from './request';

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
}
