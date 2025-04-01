// src/types.ts
import { DataQuery } from '@grafana/schema';

export interface PanelOptions {
  productName?: string; // Optional custom name (our only custom addition)
  query?: DataQuery; // Optional for future use
}
