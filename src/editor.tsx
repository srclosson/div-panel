import React, { Component } from 'react';
import Editor from '@monaco-editor/react';
import { PanelEditorProps } from '@grafana/data';
import { DivPanelOptions, getDivPanelState, DivPanelState, defaultContent, setDivPanelState } from './types';
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
    console.log('Editor::componentDidMount');
    const divState = getDivPanelState();

    setDivPanelState({
      ...divState,
      editMode: true,
    });
  }

  componentWillUnmount() {
    //const { content } = this.state;
    //const { onOptionsChange, options } = this.props;
    const divState: DivPanelState = getDivPanelState();
    //const elem = document.getElementById(`divPanel-edit-${divState.id}`);
    //const scripts = parseScripts(content);

    // if (elem) {
    //   const editContent: Array<string | undefined> = scripts.map((s: HTMLScriptElement) => {
    //     return runExitEditMode(s, elem?.children);
    //   });

    //   const cleanEditContent: string[] = [];
    //   editContent.forEach((ec: string | undefined) => {
    //     if (ec) {
    //       cleanEditContent.push(ec);
    //     }
    //   });

    //   onOptionsChange({
    //     ...options,
    //     editContent: cleanEditContent,
    //   });

    //   console.log("setting div panel state", cleanEditContent);
    // }

    setDivPanelState({
      ...divState,
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
        )) || <Button onClick={this.onOpenEditor}>Open Editor</Button>}
      </>
    );
  };

  render() {
    return this.onRender();
  }
}
