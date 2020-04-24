import React, { Component } from 'react';
import Editor from '@monaco-editor/react';
import { PanelEditorProps } from '@grafana/data';
import { DivPanelOptions } from './types';
import { Button, Drawer } from '@grafana/ui';

interface Props extends PanelEditorProps<DivPanelOptions> {}
interface State {
  editorVisible: boolean;
}

export class DivMonacoEditor extends Component<Props, State> {
  getJs: any | undefined;
  getEditorValue: any | undefined;
  constructor(props: Props) {
    super(props);

    this.state = {
      editorVisible: false,
    }
    this.getEditorValue = undefined;
  }

  componentDidMount() {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      command: 'enterEditMode',
      content: options.content,
    });
  }

  componentWillUnmount() {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      command: 'exitEditMode',
      content: options.content,
    });
  }

  onOpenEditor = () => {
    this.setState({
      editorVisible: true,
    })
  }

  onHtmlEditorDidMount = (getEditorValue: any) => {
    this.getEditorValue = getEditorValue;
  };

  onApplyClick = () => {
    this.onRunClick();
    this.onCloseClick();
  };

  onClearClick = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      command: 'clear',
    });
  };

  onCloseClick = () => {
    this.setState({
      editorVisible: false,
    })
  }

  onRunClick = () => {
    const { onOptionsChange } = this.props;

    onOptionsChange({
      command: 'render',
      content: this.getEditorValue(),
    });
  }

  onRender = (): JSX.Element => {
    const { editorVisible } = this.state;
    const { content } = this.props.options;
    return (
      <>
        {editorVisible &&
        <Drawer
          width="50%"
          title="Div Panel Code Editor"
          expandable
          onClose={() => {
            this.setState({
              editorVisible: false,
            });
          }}
        >
          <div style={{width: "100%", height: "85vh"}}>
            <Editor language="html" value={content} editorDidMount={this.onHtmlEditorDidMount} theme={'dark'} />
            <Button onClick={this.onRunClick}>Run</Button>
            <Button onClick={this.onClearClick}>Clear</Button>
            <Button onClick={this.onApplyClick}>Apply</Button>
            <Button onClick={this.onCloseClick}>Close</Button>
          </div>
        </Drawer>
      || <Button onClick={this.onOpenEditor}>Open Editor</Button>}
      </>
    );
  };

  render() {
    return this.onRender();
  }
}
