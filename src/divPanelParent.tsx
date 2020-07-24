import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DivPanelChild } from './divPanelChild';
import { DivPanelType, getDivPanelState, setDivPanelState, defaults } from './types';
import { PanelProps } from '@grafana/data';
import { parseHtml } from 'utils/functions';

interface Props extends PanelProps<DivPanelType> {}

export class DivPanelParent extends Component<Props> {
  id: string;
  constructor(props: Props) {
    super(props);

    const editor = props.options.editor || defaults;
    const divState = getDivPanelState();
    if (divState.editMode) {
      this.id = `divPanel-edit-${editor.id}`;
      setDivPanelState({
        ...divState,
        editId: this.id,
      });
    } else {
      this.id = `divPanel-${editor.id}`;
    }
  }

  onClear = () => {
    const elem = document.getElementById(this.id);
    if (elem) {
      ReactDOM.unmountComponentAtNode(elem);
    }
  };

  onChangeChild = (editContent: string[]) => {
    const { onOptionsChange, options } = this.props;

    onOptionsChange({
      editor: {
        ...options.editor,
        editContent,
      },
    });
  };

  render() {
    const { data } = this.props;
    const { content, editContent } = this.props.options.editor || defaults;
    const { command, editMode } = getDivPanelState();

    if (command === 'clear') {
      this.onClear();
      return <div>Clear and unmount complete</div>;
    }
    const { html, meta, links, scripts, imports } = parseHtml(content);

    return (
      <>
        <DivPanelChild
          key={`${this.id}-aparent`}
          id={this.id}
          onChange={this.onChangeChild}
          editMode={editMode}
          editContent={editContent}
          command={command}
          html={html}
          meta={meta}
          links={links}
          scripts={scripts}
          imports={imports}
          data={data}
        />
      </>
    );
  }
}
