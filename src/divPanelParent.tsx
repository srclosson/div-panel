import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DivPanelChild } from './divPanelChild';
import { DivPanelProps, getDivPanelState, setDivPanelState } from './types';
import { parseHtml } from 'utils/functions';

interface Props extends DivPanelProps {}

export class DivPanelParent extends Component<Props> {
  id: string;
  constructor(props: Props) {
    super(props);

    const divState = getDivPanelState();
    if (divState.editMode) {
      this.id = `divPanel-edit-${divState.id}`;
      setDivPanelState({
        ...divState,
        editId: this.id,
      });
    } else {
      this.id = `divPanel-${divState.id}`;
    }
  }

  onClear = () => {
    const elem = document.getElementById(getDivPanelState().id);
    if (elem) {
      ReactDOM.unmountComponentAtNode(elem);
    }
  };

  onChangeChild = (editContent: string[]) => {
    const { onOptionsChange, options } = this.props;

    onOptionsChange({
      ...options,
      editContent,
    });
  };

  render() {
    const { data } = this.props;
    const { content, editContent } = this.props.options;
    const { command, editMode } = getDivPanelState();

    if (command === 'clear') {
      this.onClear();
      return <div>You're code has been cleared</div>;
    }
    const { html, meta, links, scripts, imports } = parseHtml(content);
    let editContentElements: JSX.Element[] = [];
    if (editContent && editContent.length && !editMode) {
      editContentElements = editContent.map((html: string, index: number) => {
        return <div key={`${this.id}-edit-${index}`} dangerouslySetInnerHTML={{ __html: html || '' }}></div>;
      });
    }

    return (
      <>
        {editContentElements}
        <DivPanelChild
          key={`${this.id}-aparent`}
          id={this.id}
          onChange={this.onChangeChild}
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
