// src/ProductYieldGaugePanel.tsx
import * as React from 'react';
import { PanelProps } from '@grafana/data';
import { Gauge, useTheme2 } from '@grafana/ui';
import { ThresholdsMode } from '@grafana/schema';
import { PanelOptions } from './types';

interface Props extends PanelProps<PanelOptions> {}

export const ProductYieldGaugePanel: React.FC<Props> = ({ data, width, height, options }) => {
  const theme = useTheme2();

  if (!data || data.series.length === 0 || data.series[0].fields.length === 0) {
    return <div>No data available.</div>;
  }

  const series = data.series[0];
  const valueField = series.fields.find((field) => field.name === 'value');
  const metricField = series.fields.find((field) => field.name === 'metric');

  if (!valueField || valueField.values.length === 0) {
    return <div>Data field not found or empty.</div>;
  }

  const staticThresholds = [
    { value: 0, color: 'red' },
    { value: 85, color: 'yellow' },
    { value: 90, color: 'green' },
    { value: 100, color: 'blue' },
  ];

  return (
    <div style={{ overflow: 'scroll', height: '100%', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {valueField.values.map((value, index) => {
          const yieldValue = Number(value.toFixed(2)); // Value in range 0-100
          const metricValue = metricField?.values[index];
          //   console.log(metricValue);
          // Calculate color based on thresholds
          let color = theme.colors.text.primary; // Default fallback
          for (const threshold of staticThresholds) {
            if (yieldValue >= threshold.value) {
              color = threshold.color; // Last matching threshold wins
            }
          }

          const gaugeProps = {
            value: {
              numeric: yieldValue, // Raw numeric value (0-100)
              percent: yieldValue / 100, // Normalized to 0-1 for gauge arc
              color: color, // Apply calculated color
              title: metricValue || options.productName || 'Yield',
              text: `${yieldValue}%`, // Display with % symbol
            },
            width: width / 3 - 16, // Adjust for grid
            height: height - 20, // Ensure enough height
            showThresholdMarkers: true, // Use option toggle
            showThresholdLabels: true, // Use option toggle
            fieldConfig: {
              displayName: options.productName || 'Yield',
              min: 0,
              max: 100,
              unit: 'percent', // Set unit to percentage
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: staticThresholds,
              },
            },
            theme: theme,
            // onClick: async () => {
            //   console.log(metricValue);
            //   alert(metricValue);
            //   await fetch(`https://google.com/search?q=${metricValue}`);
            // },
          };

          return (
            <div
              key={index}
              style={{ cursor: 'pointer' }}
              onClick={async () => {
                console.log(metricValue);
                // alert(metricValue);
                window.parent.postMessage(metricValue, '*');
                // const response = await fetch(`https://jsonplaceholder.typicode.com/posts`);
                // const data = await response.json();
                // alert(data);
                // alert('Hello from iframe!');
              }}
            >
              {' '}
              <Gauge {...gaugeProps} key={index} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
