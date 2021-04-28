import React, { Component } from 'react';
import { PanelData } from '@grafana/data';
import { css } from 'emotion';
import { load, init, run, loadMeta } from 'utils/functions';
import { getDivPanelState, DivPanelOptions } from './types';
import tracker from 'utils/editmode';
const Handlebars = require('handlebars');

interface Props {
  id: string;
  html: string;
  onChange: (options: DivPanelOptions) => void;
  editMode: boolean;
  options: DivPanelOptions;
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

  shouldComponentUpdate(prevProps: Props) {
    return (
      prevProps.options.content !== this.props.options.content ||
      prevProps.html !== this.props.html ||
      this.state.depsLoaded === false
    );
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
    const { id, command, scripts, options, onChange } = this.props;
    const { editContent } = options;
    const { editMode } = getDivPanelState();
    const { state, series } = this.props.data;

    const elem = document.getElementById(id);
    tracker.update();

    if ((state === 'Done' || state === 'Streaming') && elem) {
      if (depsLoaded && !this.scriptsLoaded) {
        scripts.forEach(async (i) => await init(elem?.children, i));
        this.scriptsLoaded = true;
      }

      const editState = tracker.get();
      const newEditContent = scripts.map((s: HTMLScriptElement) => {
        try {
          let returnedEditContent = run({
            code: s,
            elem: elem?.children,
            editState,
            editMode,
            editContent,
            command,
            data: series,
          });
          onChange({
            ...options,
            error: undefined,
          });
          return returnedEditContent;
        } catch (error) {
          onChange({
            ...options,
            error,
          });
          return;
        }
      });

      const cleanEditContent: string[] = [];
      newEditContent.forEach((ec: string | undefined) => {
        if (ec) {
          cleanEditContent.push(ec);
        }
      });

      if (editState.prev && !editState.curr) {
        onChange({
          ...options,
          editContent: cleanEditContent,
        });
      }
    }
  }

  render() {
    const { id, html, options, editMode } = this.props;
    const { editContent } = options;
    const { series } = this.props.data;
    let template, newHtml;
    try {
      template = Handlebars.compile(html);
      newHtml = template(series);
    } catch (ex) {
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
