import React, { Component } from 'react';
import { DivPanelChild } from './divPanelChild';
import { DivPanelEditChild } from './divPanelEditChild';
import { DivPanelType, getDivPanelState, defaults, DivPanelOptions } from './types';
import { hasEditModeFunctions } from './utils/functions';
import { PanelProps } from '@grafana/data';
import { parseHtml } from 'utils/functions';

interface Props extends PanelProps<DivPanelType> {}

export class DivPanelParent extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  onChangeChild = (newOptions: DivPanelOptions) => {
    const { onOptionsChange, options } = this.props;

    onOptionsChange({
      ...options,
      editor: newOptions,
    });
  };

  render() {
    const { data } = this.props;
    const options = this.props.options.editor;
    const { editMode, content, error } = options;
    const { command } = getDivPanelState();

    if (command === 'clear') {
      return <div>Clear and unmount complete</div>;
    }

    const parsed = parseHtml(content, error);
    if (editMode && hasEditModeFunctions(content)) {
      return (
        <DivPanelEditChild
          onChange={this.onChangeChild}
          options={options}
          parsed={parsed}
          data={data}
        />
      )
    }

    return (
      <DivPanelChild
        onChange={this.onChangeChild}
        options={options}
        parsed={parsed}
        data={data}
      />
    );
  }
}
