import { PanelPlugin } from '@grafana/data';
import { ProductYieldGaugePanel } from './ProductYieldGaugePanel';
import { PanelOptions } from './types';

export const plugin = new PanelPlugin<PanelOptions>(ProductYieldGaugePanel);
