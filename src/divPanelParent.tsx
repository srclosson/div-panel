import React, { Component } from 'react';
import { DivPanelChild } from './divPanelChild';
import { DivPanelEditChild } from './divPanelEditChild';
import { DivPanelType, getDivPanelState, DivPanelOptions, defaults } from './types';
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

  onChangeEditContent = (newEditContent: string[]) => {
    const { options } = this.props;

    this.onChangeChild({
      ...options.editor,
      editContent: newEditContent,
    });
  };

  render() {
    const { data } = this.props;
    const { editor } = this.props.options;
    const { content, error } = editor || defaults;
    const { command, editMode } = getDivPanelState();

    if (command === 'clear') {
      return <div>Clear and unmount complete</div>;
    }

    const parsed = parseHtml(content, error);
    if (editMode && hasEditModeFunctions(content)) {
      return (
        <DivPanelEditChild
          onChange={this.onChangeChild}
          editMode={editMode}
          changeEditContent={this.onChangeEditContent}
          options={editor}
          parsed={parsed}
          data={data}
        />
      );
    }

    return <DivPanelChild onChange={this.onChangeChild} options={editor} parsed={parsed} data={data} />;
  }
}
