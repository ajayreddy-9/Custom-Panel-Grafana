import { ThresholdsMode, VisualizationSuggestionsBuilder } from '@grafana/data';
export enum SuggestionName {
  LineChart = 'Line chart',
  LineChartSmooth = 'Line chart smooth',
  LineChartGradientColorScheme = 'Line chart with gradient color scheme',
  AreaChart = 'Area chart',
  AreaChartStacked = 'Area chart stacked',
  AreaChartStackedPercent = 'Area chart 100% stacked',
  BarChart = 'Bar chart',
  BarChartGradientColorScheme = 'Bar chart with gradient color scheme',
  BarChartStacked = 'Bar chart stacked',
  BarChartStackedPercent = 'Bar chart 100% stacked',
  BarChartHorizontal = 'Bar chart horizontal',
  BarChartHorizontalStacked = 'Bar chart horizontal stacked',
  BarChartHorizontalStackedPercent = 'Bar chart horizontal 100% stacked',
  Candlestick = 'Candlestick',
  PieChart = 'Pie chart',
  PieChartDonut = 'Pie chart donut',
  Stat = 'Stat',
  StatColoredBackground = 'Stat colored background',
  Gauge = 'Gauge',
  GaugeNoThresholds = 'Gauge no thresholds',
  BarGaugeBasic = 'Bar gauge basic',
  BarGaugeLCD = 'Bar gauge LCD',
  Table = 'Table',
  StateTimeline = 'State timeline',
  StatusHistory = 'Status history',
  TextPanel = 'Text',
  DashboardList = 'Dashboard list',
  Logs = 'Logs',
  FlameGraph = 'Flame graph',
  Trace = 'Trace',
  NodeGraph = 'Node graph',
}

import { Options } from './panelcfg.gen';

export class GaugeSuggestionsSupplier {
  getSuggestionsForData(builder: VisualizationSuggestionsBuilder) {
    const { dataSummary } = builder;

    if (!dataSummary.hasData || !dataSummary.hasNumberField) {
      return;
    }

    // for many fields / series this is probably not a good fit
    if (dataSummary.numberFieldCount >= 50) {
      return;
    }

    const list = builder.getListAppender<Options, {}>({
      name: SuggestionName.Gauge,
      pluginId: 'gauge',
      options: {},
      fieldConfig: {
        defaults: {
          thresholds: {
            steps: [
              { value: -Infinity, color: 'green' },
              { value: 70, color: 'orange' },
              { value: 85, color: 'red' },
            ],
            mode: ThresholdsMode.Percentage,
          },
          custom: {},
        },
        overrides: [],
      },
      cardOptions: {
        previewModifier: (s) => {
          if (s.options!.reduceOptions.values) {
            s.options!.reduceOptions.limit = 2;
          }
        },
      },
    });

    if (dataSummary.hasStringField && dataSummary.frameCount === 1 && dataSummary.rowCountTotal < 10) {
      list.append({
        name: SuggestionName.Gauge,
        options: {
          reduceOptions: {
            values: true,
            calcs: [],
          },
        },
      });
      list.append({
        name: SuggestionName.GaugeNoThresholds,
        options: {
          reduceOptions: {
            values: true,
            calcs: [],
          },
          showThresholdMarkers: false,
        },
      });
    } else {
      list.append({
        name: SuggestionName.Gauge,
        options: {
          reduceOptions: {
            values: false,
            calcs: ['lastNotNull'],
          },
        },
      });
      list.append({
        name: SuggestionName.GaugeNoThresholds,
        options: {
          reduceOptions: {
            values: false,
            calcs: ['lastNotNull'],
          },
          showThresholdMarkers: false,
        },
      });
    }
  }
}
