import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DivPanelChild } from './divPanelChild';
import { DivPanelProps } from './types';
import { v4 as uuidv4 } from 'uuid';

interface Props extends DivPanelProps {}

const isEditMode = () => window.location.href.match(/[?&]edit/) !== null;

export class DivPanelParent extends Component<Props> {
  childContainerId: string;
  editMode: boolean;
  constructor(props: Props) {
    super(props);

    this.childContainerId = `divPanel-${uuidv4()}`;
    this.editMode = isEditMode();
  }

  onClear = () => {
    const elem = document.getElementById(this.childContainerId);
    if (elem) {
      ReactDOM.unmountComponentAtNode(elem);
    }
  };

  parseHtml = (content: string) => {
    const scripts: HTMLScriptElement[] = [];
    const imports: HTMLScriptElement[] = [];
    const links: HTMLLinkElement[] = [];
    const meta: HTMLMetaElement[] = [];
    const divElement: HTMLDivElement = document.createElement('div');

    const parser = new DOMParser();
    const newDoc = parser.parseFromString(content, 'text/html');
    const head: HTMLHeadElement = newDoc.documentElement.children[0] as HTMLHeadElement;
    const body: HTMLBodyElement = newDoc.documentElement.children[1] as HTMLBodyElement;

    for (let i = 0; i < head.children.length; i++) {
      switch (head.children[i].nodeName) {
        case 'META':
          meta.push(head.children[i].cloneNode(true) as HTMLMetaElement);
          break;
        case 'LINK':
          links.push(head.children[i].cloneNode(true) as HTMLLinkElement);
          break;
        case 'SCRIPT':
          imports.push(head.children[i].cloneNode(true) as HTMLScriptElement);
          break;
        default:
          break;
      }
    }

    for (let i = 0; i < body.children.length; i++) {
      switch (body.children[i].nodeName) {
        case 'SCRIPT':
          scripts.push(body.children[i].cloneNode(true) as HTMLScriptElement);
          body.children[i].remove();
          break;
        default:
          divElement.appendChild(body.children[i].cloneNode(true));
          break;
      }
    }

    return {
      html: divElement.innerHTML,
      meta,
      scripts,
      imports,
      links,
    };
  };

  render() {
    const { data } = this.props;
    const { content, command } = this.props.options;

    if (command === 'clear') {
      this.onClear();
      return <div>You're code has been cleared</div>;
    }

    const { html, meta, links, scripts, imports } = this.parseHtml(content);

    return (
      <>
        <DivPanelChild id={this.childContainerId} command={command} html={html} meta={meta} links={links} scripts={scripts} imports={imports} data={data} />
      </>
    );
  }
}
