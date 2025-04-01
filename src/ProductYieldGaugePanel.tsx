// src/ProductYieldGaugePanel.tsx
import * as React from 'react';
import { PanelProps, getValueFormat, reduceField } from '@grafana/data';
import { Gauge, useTheme2 } from '@grafana/ui';
import { PanelOptions } from './types';

interface Props extends PanelProps<PanelOptions> {}

export const ProductYieldGaugePanel: React.FC<Props> = ({ data, width, height, options, fieldConfig }) => {
  const theme = useTheme2();

  // Handle no data case
  if (!data || data.series.length === 0 || data.series[0].fields.length === 0) {
    return <div>No data available.</div>;
  }

  // Get the first series and numeric field
  const series = data.series[0];
  const valueField = series.fields.find((field) => field.type === 'number');
  const labelField = series.fields.find((field) => field.type === 'string') || valueField;

  if (!valueField || valueField.values.length === 0) {
    return <div>No numeric data found.</div>;
  }

  // Default to 'last' calculation (mimics default Gauge behavior)
  const reducedValue = reduceField({ field: valueField, reducers: ['last'] })['last'];
  const label = labelField
    ? labelField.values[labelField.values.length - 1] || options.productName || 'Gauge'
    : options.productName || 'Gauge';

  // Use fieldConfig defaults or fallbacks
  const min = fieldConfig.defaults.min || 0;
  const max = fieldConfig.defaults.max || 100;
  const unit = fieldConfig.defaults.unit || 'none';
  const thresholds = fieldConfig.defaults.thresholds || {
    mode: 'absolute',
    steps: [
      { value: min, color: 'red' },
      { value: max * 0.8, color: 'yellow' },
      { value: max, color: 'green' },
    ],
  };

  // Calculate color based on thresholds
  let color = theme.colors.text.primary;
  for (const threshold of thresholds.steps) {
    if (reducedValue >= threshold.value) {
      color = threshold.color;
    }
  }

  // Format value using Grafana’s utility
  const formattedValue = getValueFormat(unit)(reducedValue, fieldConfig.defaults.decimals);

  const gaugeProps = {
    value: {
      numeric: reducedValue,
      percent: (reducedValue - min) / (max - min), // Normalize to 0-1
      color: color,
      title: label,
      text: formattedValue.text + (formattedValue.suffix || ''),
    },
    width: width,
    height: height,
    showThresholdMarkers: true,
    showThresholdLabels: true,
    // Use defaults from Gauge component, override with fieldConfig if set
    // showThresholdMarkers: fieldConfig.defaults.custom?.showThresholdMarkers ?? true,
    // showThresholdLabels: fieldConfig.defaults.custom?.showThresholdLabels ?? false,
    fieldConfig: {
      displayName: options.productName || label,
      min: min,
      max: max,
      unit: unit,
      thresholds: thresholds,
    },
    theme: theme,
    // Text sizes default to Gauge component’s built-in values
  };

  return <Gauge {...gaugeProps} />;
};
