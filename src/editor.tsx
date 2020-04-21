import React, { Component } from 'react';
import Editor from '@monaco-editor/react';
import { PanelEditorProps } from '@grafana/data';
import { DivPanelOptions } from './types';
import { Button } from '@grafana/ui';

interface Props extends PanelEditorProps<DivPanelOptions> {}

export class DivMonacoEditor extends Component<Props> {
  getJs: any | undefined;
  getEditorValue: any | undefined;
  constructor(props: Props) {
    super(props);

    this.getEditorValue = undefined;
  }

  componentDidMount() {
    console.log('Editor::componentDidMount');
  }

  onHtmlEditorDidMount = (getEditorValue: any) => {
    this.getEditorValue = getEditorValue;
  };

  onApplyClick = (_: React.MouseEvent<HTMLButtonElement>) => {
    const { onOptionsChange } = this.props;

    console.log('applying options');
    onOptionsChange({
      command: 'render',
      content: this.getEditorValue(),
    });
  };

  onClearClick = (_: React.MouseEvent<HTMLButtonElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      command: 'clear',
    });
  };

  onRender = (): JSX.Element => {
    const { content } = this.props.options;
    return (
      <>
        <div style={{ height: '50vh', width: 'calc(100vw - 150px' }}>
          <Editor language="html" value={content} editorDidMount={this.onHtmlEditorDidMount} theme={'dark'} />
        </div>
        <Button onClick={this.onApplyClick}>Apply</Button>
        <Button onClick={this.onClearClick}>Clear</Button>
      </>
    );
  };

  render() {
    return this.onRender();
  }
}
