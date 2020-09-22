import React, { Component } from 'react';
import { PanelData } from '@grafana/data';
import { css } from 'emotion';
import { load, init, run, loadMeta } from 'utils/functions';
import { getDivPanelState } from './types';
import tracker from 'utils/editmode';
const Handlebars = require('handlebars');

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
  depsLoaded: boolean;
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
  scriptsLoaded: boolean;
  constructor(props: Props) {
    super(props);

    this.scriptsLoaded = false;
    this.editModeHtml = [];
    this.state = {
      depsLoaded: false,
    };

    Handlebars.registerHelper('last', () => {
      return this.props.data.series[0].fields[1].values.get(this.props.data.series[0].fields[1].values.length - 1);
    });
  }

  componentDidMount() {
    this.loadDependencies(true);
  }

  shouldComponentUpdate() {
    return true;
  }

  componentDidUpdate() {
    this.loadDependencies(false);
    this.panelUpdate();
  }

  loadDependencies(refreshState: boolean): Promise<any> {
    const { id, imports, meta } = this.props;
    const { depsLoaded } = this.state;
    let promises: Array<Promise<any>> = [];

    if (!depsLoaded) {
      let container = document.getElementById(id)?.parentElement;
      if (container) {
        container = container.parentElement?.parentElement?.parentElement;
      }
      if (container) {
        for (const i of imports) {
          promises.push(load(i, container));
        }
        for (const i of meta) {
          promises.push(loadMeta(i));
        }
      }

      return Promise.all(promises).then(() => {
        if (refreshState) {
          this.setState({
            depsLoaded: true,
          });
        }
      });
    }

    return Promise.resolve(null);
  }

  panelUpdate() {
    const { depsLoaded } = this.state;
    const { id, command, scripts, editContent, onChange } = this.props;
    const { editMode } = getDivPanelState();
    const { state, series } = this.props.data;

    const elem = document.getElementById(id);
    tracker.update();

    if ((state === 'Done' || state === 'Streaming') && elem) {
      if (depsLoaded && !this.scriptsLoaded) {
        scripts.forEach(async i => await init(elem?.children, i));
        this.scriptsLoaded = true;
      }

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
      console.log("series", series);
      template = Handlebars.compile(html);
      newHtml = template(series);
    } catch (ex) {
      console.log('could not compile', html, ex);
      newHtml = html;
    }

    let editContentElements: JSX.Element[] = [];
    if (editContent && editContent.length && !editMode) {
      editContentElements = editContent.map((html: string, index: number) => {
        let template, newHtml;
        try {
          template = Handlebars.compile(html);
          newHtml = template(series);
        } catch (ex) {
          console.log('could not compile', html, ex);
          newHtml = html;
        }
        return (
          <div
            key={`${id}-edit-${index}`}
            id={`${id}-edit-${index}`}
            dangerouslySetInnerHTML={{ __html: newHtml || '' }}
          ></div>
        );
      });
    }
    return (
      <>
        {editContentElements}
        <div
          key={`${id}-achild`}
          id={id}
          className={divStyle.wrapper}
          dangerouslySetInnerHTML={{ __html: newHtml }}
        ></div>
      </>
    );
  }
}
