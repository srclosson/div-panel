import React, { Component } from 'react';
import { PanelData } from '@grafana/data';
import { css } from 'emotion';
import { loadMeta, loadCSS, load, init, run } from 'utils/functions';
import { getDivPanelState, setDivPanelState } from './types';
import tracker from 'utils/editmode';
const Handlebars = require("handlebars");

interface Props {
  id: string;
  html: string;
  onChange?: (editContent: string[]) => void;
  editMode: boolean;
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

  componentDidMount() {
    this.loadDependencies().then(() => this.panelUpdate);
  }

  shouldComponentUpdate() {
    return true;
  }

  componentDidUpdate() {
    this.loadDependencies();
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
    const { editMode, scriptsLoaded } = getDivPanelState();
    const { id, command, scripts, editContent, onChange } = this.props;
    const { state, series } = this.props.data;

    const elem = document.getElementById(id);
    tracker.update();

    if (divLoaded && elem && !scriptsLoaded) {
      scripts.forEach(async i => await init(elem?.children, i));
      setDivPanelState({
        ...getDivPanelState(),
        scriptsLoaded: true,
      });
    }

    if (state === 'Done' && elem) {
      const editState = tracker.get();
      const newEditContent = scripts.map((s: HTMLScriptElement) => {
        return run({
          code: s,
          elem: elem?.children,
          editState,
          editMode,
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
    const { id, html, editContent, editMode } = this.props;
    const { series } = this.props.data;

    let template, newHtml;
    try {
      template = Handlebars.compile(html)
      newHtml = template(series);
    } catch(ex) {
      console.log("could not compile", ex);
      newHtml = html
    }

    let editContentElements: JSX.Element[] = [];
    if (editContent && editContent.length && !editMode) {
      editContentElements = editContent.map((html: string, index: number) => {
        let template, newHtml;
        try {
          template = Handlebars.compile(html)
          newHtml = template(series);
        } catch(ex) {
          console.log("could not compile", ex);
          newHtml = html
        }
        return <div key={`${id}-edit-${index}`} id={`${id}-edit-${index}`} dangerouslySetInnerHTML={{ __html: newHtml || '' }}></div>;
      });
    }
    return (
      <>
        {editContentElements}
        <div key={`${id}-achild`} id={id} className={divStyle.wrapper} dangerouslySetInnerHTML={{ __html: newHtml }}></div>
      </>
    );
  }
}
