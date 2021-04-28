import React, { Component } from 'react';
import { PanelEditorProps } from '@grafana/data';
import Editor from '@monaco-editor/react';
import { DivPanelOptions, getDivPanelState, defaultContent, setDivPanelState } from './types';
import { Button } from '@grafana/ui';

export interface Props extends PanelEditorProps<DivPanelOptions> {}

interface State {
  editorVisible: boolean;
  content: string;
}

export class DivMonacoEditor extends Component<Props, State> {
  getJs: any | undefined;
  scripts: HTMLScriptElement[];
  constructor(props: Props) {
    super(props);
    const { content } = this.props.options;
    this.state = {
      editorVisible: false,
      content: content || defaultContent,
    };
    this.scripts = [];
  }

  componentDidMount() {
    setDivPanelState({
      ...getDivPanelState(),
      editMode: true,
    });
  }

  componentWillUnmount() {
    setDivPanelState({
      ...getDivPanelState(),
      command: 'exitEditMode',
      editMode: false,
    });
  }

  onOpenEditor = () => {
    const { content } = this.state;

    this.setState({
      editorVisible: true,
      content,
    });
  };

  onChange = (content?: string) => {
    if (content) {
      this.setState({
        content,
      });
    }
  };

  onClearClick = () => {
    const { onOptionsChange, options } = this.props;
    setDivPanelState({
      ...getDivPanelState(),
      command: 'clear',
      editContent: [],
      editMode: true,
    });
    onOptionsChange(options);
  };

  onRunClick = () => {
    const { onOptionsChange, options } = this.props;
    const { content } = this.state;

    onOptionsChange({
      ...options,
      content,
    });
    setDivPanelState({
      ...getDivPanelState(),
      command: 'render',
    });
    this.setState({
      ...this.state,
      content,
    });
  };

  onRender = (): JSX.Element => {
    const { content } = this.state;

    return (
      <div style={{ width: '100%', height: '50vh' }}>
        <Editor language="html" value={content} onChange={this.onChange} theme={'vs-dark'} />
        <Button onClick={this.onRunClick}>Run</Button>
        <Button onClick={this.onClearClick}>Clear</Button>
      </div>
    );
  };

  render() {
    return this.onRender();
  }
}
