import { ThresholdsConfig, DataQuery } from '@grafana/schema';

export interface PanelOptions {
  productName: string;
  valueFieldName: string;
  thresholds?: ThresholdsConfig;
  query?: DataQuery; // Add query option type
}
