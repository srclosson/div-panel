import React, { Component } from 'react';
import { PanelEditorProps } from '@grafana/data';
import Editor from '@monaco-editor/react';
import { DivPanelOptions, getDivPanelState, defaultContent, setDivPanelState } from './types';
import { Button, Drawer } from '@grafana/ui';

interface Props extends PanelEditorProps<DivPanelOptions> {}

interface State {
  editorVisible: boolean;
  content: string;
}

export class DivMonacoEditor extends Component<Props, State> {
  getJs: any | undefined;
  getEditorValue: any | undefined;
  scripts: HTMLScriptElement[];
  constructor(props: Props) {
    super(props);
    const { content } = this.props.options;
    this.state = {
      editorVisible: false,
      content: content || defaultContent,
    };
    this.getEditorValue = undefined;
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

  onHtmlEditorDidMount = (getEditorValue: any) => {
    this.getEditorValue = getEditorValue;
  };

  onApplyClick = () => {
    this.onRunClick();
    this.onCloseClick();
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

  onCloseClick = () => {
    this.setState({
      editorVisible: false,
      content: this.getEditorValue(),
    });
  };

  onRunClick = () => {
    const { onOptionsChange, options } = this.props;
    const content = this.getEditorValue();
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
    const { editorVisible, content } = this.state;

    return (
      <>
        {(editorVisible && (
          <Drawer
            width="50%"
            title="Div Panel Code Editor"
            expandable
            onClose={() => {
              this.setState({
                editorVisible: false,
                content,
              });
            }}
          >
            <div style={{ width: '100%', height: '85vh' }}>
              <Editor language="html" value={content} editorDidMount={this.onHtmlEditorDidMount} theme={'dark'} />
              <Button onClick={this.onRunClick}>Run</Button>
              <Button onClick={this.onClearClick}>Clear</Button>
              <Button onClick={this.onApplyClick}>Apply</Button>
              <Button onClick={this.onCloseClick}>Close</Button>
            </div>
          </Drawer>
        )) || <Button onClick={this.onOpenEditor}>Open</Button>}
      </>
    );
  };

  render() {
    return this.onRender();
  }
}
