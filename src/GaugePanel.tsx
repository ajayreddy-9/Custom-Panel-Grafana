import React, { PureComponent } from 'react';

import {
  FieldDisplay,
  getDisplayProcessor,
  getFieldDisplayValues,
  PanelProps,
  //   DisplayProcessor,
  DisplayValue,
  //   DisplayValueAlignmentFactors,
  FieldConfig,
  //   getDisplayValueAlignmentFactors,
} from '@grafana/data';
import { BarGaugeSizing, VizOrientation } from '@grafana/schema';
import { Gauge, VizRepeater, VizRepeaterRenderValueProps } from '@grafana/ui';
// import { DataLinksContextMenuApi } from '@grafana/ui/dist/esm/components/DataLinks/DataLinksContextMenu';
import { config } from 'config';
import { defaultOptions, Options } from './panelcfg.gen';
import './GaugePanel.css';

export function clearNameForSingleSeries(count: number, field: FieldConfig, display: DisplayValue): DisplayValue {
  if (count === 1 && !field.displayName) {
    return {
      ...display,
    };
  }

  return display;
}
interface State {
  activeGaugeId: string;
}

export class GaugePanel extends PureComponent<PanelProps<Options>, State> {
  state: State = {
    activeGaugeId: '',
  };

  handleGaugeClick = (title: string) => {
    this.setState({ activeGaugeId: title }, () => {
      // console.log('State updated, activeGaugeId:', this.state.activeGaugeId);
      window.parent.postMessage(title, '*');
    });
  };

  renderComponent = (
    valueProps: VizRepeaterRenderValueProps<FieldDisplay>
    // menuProps: DataLinksContextMenuApi
  ): JSX.Element => {
    const { options, fieldConfig } = this.props;
    const { width, height, count, value } = valueProps;
    const { field, display } = value;
    // const { openMenu, targetClassName } = menuProps;

    const isActive = display.title === this.state.activeGaugeId;

    // const gaugeStyle: React.CSSProperties = {
    //   border: isActive ? '3px solid green' : 'none',
    //   padding: isActive ? '4px' : '0',
    //   borderRadius: '4px',
    //   boxSizing: 'border-box',
    //   // backgroundColor: isActive ? 'rgba(0, 255, 0, 0.05)' : 'transparent',
    //   cursor: 'pointer',
    //   width: '100%',
    //   height: '100%',
    // };

    // console.log('Rendering gauge, title:', display.title, 'isActive:', isActive);

    return (
      // <div style={gaugeStyle} onClick={() => this.handleGaugeClick(display.title!)}>
      <Gauge
        value={clearNameForSingleSeries(count, fieldConfig.defaults, display)}
        width={width}
        height={height}
        field={field}
        text={options.text}
        showThresholdLabels={options.showThresholdLabels}
        showThresholdMarkers={options.showThresholdMarkers}
        theme={config.theme2}
        // onClick={() => {
        //   console.log(display.title);
        //   // alert(display.title);
        //   window.parent.postMessage(display.title, '*');
        // }}
        onClick={() => {
          this.handleGaugeClick(display.title!);
        }}
        // className={targetClassName}
        className={`${isActive ? 'custom-gauge active-gauge' : 'custom-gauge'}`}
        orientation={options.orientation}
      />
      // </div>
    );
  };

  renderValue = (valueProps: VizRepeaterRenderValueProps<FieldDisplay>): JSX.Element => {
    // const { value } = valueProps;
    // const { getLinks, hasLinks } = value;

    // if (hasLinks && getLinks) {
    //   return (
    //     <DataLinksContextMenu links={getLinks} style={{ flexGrow: 1 }}>
    //       {(api) => {
    //         return this.renderComponent(valueProps, api);
    //       }}
    //     </DataLinksContextMenu>
    //   );
    // }

    // console.log('valueProps', valueProps);

    return this.renderComponent(valueProps);
  };

  getValues = (): FieldDisplay[] => {
    const { data, options, replaceVariables, fieldConfig, timeZone } = this.props;

    for (let frame of data.series) {
      for (let field of frame.fields) {
        // Set the Min/Max value automatically for percent and percentunit
        if (field.config.unit === 'percent' || field.config.unit === 'percentunit') {
          const min = field.config.min ?? 0;
          const max = field.config.max ?? (field.config.unit === 'percent' ? 100 : 1);
          field.state = field.state ?? {};
          field.state.range = { min, max, delta: max - min };
          field.display = getDisplayProcessor({ field, theme: config.theme2 });
        }
      }
    }
    const values = getFieldDisplayValues({
      fieldConfig,
      reduceOptions: options.reduceOptions,
      replaceVariables,
      theme: config.theme2,
      data: data.series,
      timeZone,
    });

    if (this.state.activeGaugeId === '' && values.length > 0) {
      const firstGaugeTitle = values[0].display.title!;
      this.setState({ activeGaugeId: firstGaugeTitle });
    }

    return values;
  };

  calculateGaugeSize = () => {
    const { options } = this.props;

    const orientation = options.orientation;
    const isManualSizing = options.sizing === BarGaugeSizing.Manual;
    const isVerticalOrientation = orientation === VizOrientation.Vertical;
    const isHorizontalOrientation = orientation === VizOrientation.Horizontal;

    const minVizWidth = isManualSizing && isVerticalOrientation ? options.minVizWidth : defaultOptions.minVizWidth;
    const minVizHeight = isManualSizing && isHorizontalOrientation ? options.minVizHeight : defaultOptions.minVizHeight;

    return { minVizWidth, minVizHeight };
  };

  render() {
    const { height, width, data, renderCounter, options } = this.props;
    const { minVizHeight, minVizWidth } = this.calculateGaugeSize();

    const { activeGaugeId } = this.state;
    // console.log('Rendering GaugePanel, activeGaugeId:', activeGaugeId);

    return (
      <VizRepeater
        key={activeGaugeId} // Force re-render on state change
        getValues={this.getValues}
        renderValue={this.renderValue}
        width={width}
        height={height}
        source={data}
        autoGrid={true}
        renderCounter={renderCounter}
        orientation={options.orientation}
        minVizHeight={minVizHeight}
        minVizWidth={minVizWidth}
      />
    );
  }
}
