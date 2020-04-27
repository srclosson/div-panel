import React, { Component } from 'react';
import { PanelData } from '@grafana/data';
import { css } from 'emotion';
import { loadMeta, loadCSS, load, init, run } from 'utils/functions';
import { getDivPanelState, setDivPanelState } from './types';
import tracker from 'utils/editmode';

interface Props {
  id: string;
  html: string;
  onChange?: (editContent: string[]) => void;
  editContent: string[];
  meta: HTMLMetaElement[];
  scripts: HTMLScriptElement[];
  imports: HTMLScriptElement[];
  links: HTMLLinkElement[];
  data: PanelData;
  command: string;
}

interface State {
  divLoaded: boolean;
}

const divStyle = {
  wrapper: css`
    display: inline-grid;
    position: relative;
    width: 100%;
    height: 100%;
  `,
};

export class DivPanelChild extends Component<Props, State> {
  editModeHtml: Array<string | undefined>;

  constructor(props: Props) {
    super(props);

    this.editModeHtml = [];
    this.state = {
      divLoaded: false,
    };
  }

  async componentDidMount() {
    await this.loadDependencies();
    this.panelUpdate();
  }

  async componentDidUpdate() {
    await this.loadDependencies();
    this.panelUpdate();
  }

  async loadDependencies() {
    const { divLoaded } = this.state;
    const { id, imports, links, meta } = this.props;
    const { metaLoaded } = getDivPanelState();

    if (!metaLoaded) {
      for (const i of meta) {
        await loadMeta(i);
      }

      setDivPanelState({
        ...getDivPanelState(),
        metaLoaded: true,
      });
    }

    for (const i of links) {
      await loadCSS(i);
    }

    let container = document.getElementById(id)?.parentElement;
    if (container) {
      container = container.parentElement?.parentElement?.parentElement;
    }
    if (container) {
      for (const i of imports) {
        try {
          await load(i, container);
        } catch (ex) {
          throw ex;
        }
      }
    }

    if (!divLoaded) {
      const elem = document.getElementById(id);
      if (elem) {
        this.setState({
          ...this.state,
          divLoaded: true,
        });
      }
    }
  }

  panelUpdate() {
    const { divLoaded } = this.state;
    const { scriptsLoaded } = getDivPanelState();
    const { id, command, scripts, editContent, onChange } = this.props;
    const { state, series } = this.props.data;

    const elem = document.getElementById(id);

    if (divLoaded && elem && !scriptsLoaded) {
      scripts.forEach(async i => await init(elem?.children, i));
      setDivPanelState({
        ...getDivPanelState(),
        scriptsLoaded: true,
      });
    }

    if (state === 'Done' && elem && scriptsLoaded) {
      tracker.update();
      const editState = tracker.get();
      const newEditContent = scripts.map((s: HTMLScriptElement) => {
        return run({
          code: s,
          elem: elem?.children,
          editState,
          editMode: getDivPanelState().editMode,
          editContent,
          command,
          data: series,
        });
      });

      const cleanEditContent: string[] = [];
      newEditContent.forEach((ec: string | undefined) => {
        if (ec) {
          cleanEditContent.push(ec);
        }
      });

      if (onChange && editState.prev && !editState.curr) {
        onChange(cleanEditContent);
      }
    }
  }

  render() {
    const { id, html } = this.props;
    return (
      <>
        <div key={id} id={id} className={divStyle.wrapper} dangerouslySetInnerHTML={{ __html: html }}></div>
      </>
    );
  }
}
